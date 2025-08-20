// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MicroSacco
 * @dev Micro-lending SACCO (Savings and Credit Cooperative) contract
 * Allows members to deposit ETH as collateral and borrow USDC against it
 * Features governance system for rate changes and member voting
 */
contract MicroSacco is ReentrancyGuard {
    
    // =============================================================================
    // CONSTANTS
    // =============================================================================
    
    uint256 public constant BIG_THRESHOLD = 10000 * 1e6; // 10,000 USDC threshold for big approvals
    uint256 public constant INIT_RATE_BPS = 1200; // Initial 12% APR in basis points
    uint256 public constant JOIN_FEE = 0.01 ether; // 0.01 ETH join fee
    uint256 public constant MAX_LTV_BPS = 6000; // 60% max loan-to-value ratio
    uint256 public constant QUORUM = 3; // Minimum votes needed for governance decisions
    
    // =============================================================================
    // STATE VARIABLES
    // =============================================================================
    
    IERC20 public immutable govToken; // Governance token contract
    IERC20 public immutable usdc; // USDC token contract
    
    uint256 public globalRateBps; // Current global interest rate in basis points
    uint256 public treasuryUSDC; // USDC treasury balance
    
    // Member structure
    struct Member {
        bool isMember;
        uint96 ethDeposited; // ETH deposited as collateral
        uint96 usdcBorrowed; // USDC borrowed amount
    }
    
    mapping(address => Member) public members;
    
    // =============================================================================
    // EVENTS
    // =============================================================================
    
    event Joined(address indexed member, uint256 ethFee);
    event DepositETH(address indexed member, uint256 ethAmount);
    event BorrowUSDC(address indexed member, uint256 usdcAmount);
    event RepayUSDC(address indexed member, uint256 usdcAmount);
    event LimitUp(address indexed member, uint256 newLimit);
    event BigApproved(address indexed member, uint256 amount);
    event RateChange(int16 delta, uint256 newRate);
    
    // =============================================================================
    // MODIFIERS
    // =============================================================================
    
    modifier onlyMember() {
        require(members[msg.sender].isMember, "Not a member");
        _;
    }
    
    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================
    
    constructor(address _govToken, address _usdc) {
        govToken = IERC20(_govToken);
        usdc = IERC20(_usdc);
        globalRateBps = INIT_RATE_BPS;
    }
    
    // =============================================================================
    // EXTERNAL FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Join the SACCO by paying the join fee
     */
    function join() external payable {
        require(msg.value >= JOIN_FEE, "Insufficient join fee");
        require(!members[msg.sender].isMember, "Already a member");
        
        members[msg.sender].isMember = true;
        
        emit Joined(msg.sender, msg.value);
    }
    
    /**
     * @dev Deposit ETH as collateral
     */
    function depositETH() external payable onlyMember {
        require(msg.value > 0, "Must deposit ETH");
        
        members[msg.sender].ethDeposited += uint96(msg.value);
        
        emit DepositETH(msg.sender, msg.value);
    }
    
    /**
     * @dev Borrow USDC against ETH collateral
     * @param usdcAmount Amount of USDC to borrow
     */
    function borrowUSDC(uint256 usdcAmount) external onlyMember nonReentrant {
        require(usdcAmount > 0, "Cannot borrow zero");
        require(usdcAmount <= maxUSDC(msg.sender), "Exceeds borrowing limit");
        require(usdc.balanceOf(address(this)) >= usdcAmount, "Insufficient treasury");
        
        members[msg.sender].usdcBorrowed += uint96(usdcAmount);
        
        // Transfer USDC to borrower
        require(usdc.transfer(msg.sender, usdcAmount), "Transfer failed");
        
        emit BorrowUSDC(msg.sender, usdcAmount);
    }
    
    /**
     * @dev Repay USDC loan
     * @param usdcAmount Amount of USDC to repay
     */
    function repayUSDC(uint256 usdcAmount) external onlyMember nonReentrant {
        require(usdcAmount > 0, "Cannot repay zero");
        require(usdcAmount <= totalUSDCOwed(msg.sender), "Exceeds owed amount");
        
        // Transfer USDC from borrower
        require(usdc.transferFrom(msg.sender, address(this), usdcAmount), "Transfer failed");
        
        members[msg.sender].usdcBorrowed -= uint96(usdcAmount);
        treasuryUSDC += usdcAmount;
        
        emit RepayUSDC(msg.sender, usdcAmount);
    }
    
    /**
     * @dev Withdraw ETH collateral
     * @param ethAmount Amount of ETH to withdraw
     */
    function withdrawETH(uint256 ethAmount) external onlyMember nonReentrant {
        require(ethAmount > 0, "Cannot withdraw zero");
        require(ethAmount <= members[msg.sender].ethDeposited, "Insufficient collateral");
        
        // Check that withdrawal doesn't violate collateral ratio
        uint256 newEthBalance = members[msg.sender].ethDeposited - ethAmount;
        uint256 maxBorrow = (newEthBalance * MAX_LTV_BPS) / 10000;
        require(members[msg.sender].usdcBorrowed <= maxBorrow, "Would exceed collateral ratio");
        
        members[msg.sender].ethDeposited -= uint96(ethAmount);
        
        // Transfer ETH to member
        payable(msg.sender).transfer(ethAmount);
    }
    
    /**
     * @dev Fund the USDC treasury
     * @param amt Amount of USDC to add to treasury
     */
    function fundTreasury(uint256 amt) external {
        require(amt > 0, "Cannot fund zero");
        
        // Transfer USDC to contract
        require(usdc.transferFrom(msg.sender, address(this), amt), "Transfer failed");
        
        treasuryUSDC += amt;
    }
    
    /**
     * @dev Vote on governance proposals
     * @param key Proposal identifier
     * @param yes True for yes vote, false for no vote
     */
    function vote(bytes32 key, bool yes) external onlyMember {
        // Simple voting mechanism - in production this would be more sophisticated
        // For now, just emit an event to track votes
        // Implementation would depend on specific governance requirements
        
        // This is a placeholder - actual implementation would store votes
        // and execute changes based on quorum and majority
    }
    
    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Calculate maximum USDC that can be borrowed by an address
     * @param a Address to check
     * @return Maximum borrowable USDC amount
     */
    function maxUSDC(address a) public view returns (uint256) {
        if (!members[a].isMember) return 0;
        
        uint256 ethDeposited = members[a].ethDeposited;
        uint256 maxBorrow = (ethDeposited * MAX_LTV_BPS) / 10000;
        uint256 alreadyBorrowed = members[a].usdcBorrowed;
        
        if (maxBorrow <= alreadyBorrowed) return 0;
        return maxBorrow - alreadyBorrowed;
    }
    
    /**
     * @dev Calculate total USDC owed by an address (including interest)
     * @param a Address to check
     * @return Total USDC owed
     */
    function totalUSDCOwed(address a) public view returns (uint256) {
        if (!members[a].isMember) return 0;
        
        uint256 principal = members[a].usdcBorrowed;
        if (principal == 0) return 0;
        
        // Simple interest calculation - in production would use compound interest
        // and time-based calculations
        uint256 interest = (principal * globalRateBps) / 10000;
        return principal + interest;
    }
    
    // =============================================================================
    // RECEIVE FUNCTION
    // =============================================================================
    
    /**
     * @dev Receive function to accept ETH deposits
     */
    receive() external payable {
        if (members[msg.sender].isMember) {
            members[msg.sender].ethDeposited += uint96(msg.value);
            emit DepositETH(msg.sender, msg.value);
        }
    }
}
