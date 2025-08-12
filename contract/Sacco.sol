// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MicroSACCO {
    /* === CONSTANTS === */
    uint256 public constant JOIN_FEE        = 0.0001 ether;   // ETH
    uint256 public constant MAX_LTV_BPS     = 5_000;        // 50 %
    uint256 public constant BIG_THRESHOLD   = 1_000 * 1e6;  // 1 000 USDC
    uint256 public constant QUORUM          = 10_000 * 1e18; // 10 k gov tokens
    uint256 public constant INIT_RATE_BPS   = 500;          // 5 % interest

    /* === STORAGE === */
    struct Member {
        bool    isMember;
        uint96  ethDeposited;   // ETH collateral
        uint96  usdcBorrowed;   // USDC debt
    }
    mapping(address => Member) public members;

    IERC20 public immutable govToken;   // jgt voting token
    IERC20 public immutable usdc;       // lending token (6-decimal fake USDC)

    uint256 public treasuryUSDC;        // USDC available to lend
    uint256 public globalRateBps = INIT_RATE_BPS;

    /* lightweight votes: topic → key → Vote */
    struct Vote { uint128 yes; uint128 no; bool done; }
    mapping(bytes32 => Vote) private _vote;

    /* === EVENTS === */
    event Joined(address indexed, uint256 ethFee);
    event DepositETH(address indexed, uint256 ethAmount);
    event BorrowUSDC(address indexed, uint256 usdcAmount);
    event RepayUSDC(address indexed, uint256 usdcAmount);
    event RateChange(int16 delta, uint256 newRate);
    event LimitUp(address indexed, uint256 newLimit);
    event BigApproved(address indexed, uint256 amount);

    /* === CONSTRUCTOR === */
    constructor(address _govToken, address _usdc) {
        require(_govToken != address(0) && _usdc != address(0), "bad");
        govToken = IERC20(_govToken);
        usdc     = IERC20(_usdc);
    }

    /* === MODIFIERS === */
    modifier onlyMember() {
        require(members[msg.sender].isMember, "!member"); _;
    }

    /* === USER ACTIONS === */
    function join() external payable {
        require(!members[msg.sender].isMember && msg.value == JOIN_FEE, "join");
        members[msg.sender].isMember = true;
        emit Joined(msg.sender, msg.value);
    }

    function depositETH() external payable onlyMember {
        require(msg.value > 0, "0");
        members[msg.sender].ethDeposited += uint96(msg.value);
        emit DepositETH(msg.sender, msg.value);
    }

    function borrowUSDC(uint256 usdcAmount) external onlyMember {
        Member storage m = members[msg.sender];
        uint256 max = maxUSDC(msg.sender);
        require(usdcAmount > 0 && usdcAmount <= max, "cap");
        if (usdcAmount >= BIG_THRESHOLD) {
            bytes32 k = keccak256(abi.encodePacked("BIG", msg.sender, usdcAmount));
            require(_vote[k].done && _vote[k].yes > _vote[k].no, "!bigVote");
        }
        require(usdcAmount <= treasuryUSDC, "treasury dry");

        treasuryUSDC -= usdcAmount;
        m.usdcBorrowed += uint96(usdcAmount);
        require(usdc.transfer(msg.sender, usdcAmount), "xfer");
        emit BorrowUSDC(msg.sender, usdcAmount);
    }

    function repayUSDC(uint256 usdcAmount) external onlyMember {
        Member storage m = members[msg.sender];
        require(usdcAmount > 0 && usdcAmount <= totalUSDCOwed(msg.sender), "bad");
        require(usdc.transferFrom(msg.sender, address(this), usdcAmount), "xfer");

        treasuryUSDC += usdcAmount;
        m.usdcBorrowed -= uint96(usdcAmount);
        emit RepayUSDC(msg.sender, usdcAmount);
    }

    function withdrawETH(uint256 ethAmount) external onlyMember {
        Member storage m = members[msg.sender];
        uint256 locked = (m.usdcBorrowed * 10_000) / MAX_LTV_BPS;
        require(ethAmount <= m.ethDeposited - locked, "lock");
        m.ethDeposited -= uint96(ethAmount);
        (bool s,) = msg.sender.call{value: ethAmount}("");
        require(s, "x");
    }

    /* === VIEW HELPERS === */
    function maxUSDC(address a) public view returns (uint256) {
        Member memory m = members[a];
        return (m.ethDeposited * MAX_LTV_BPS) / 10_000 - m.usdcBorrowed;
    }

    function totalUSDCOwed(address a) public view returns (uint256) {
        Member memory m = members[a];
        return m.usdcBorrowed + (m.usdcBorrowed * globalRateBps / 10_000);
    }

    /* === TREASURY === */
    function fundTreasury(uint256 amt) external {
        require(usdc.transferFrom(msg.sender, address(this), amt), "xfer");
        treasuryUSDC += amt;
    }

    /* === GOVERNANCE === */
    function vote(bytes32 key, bool yes) external {
        uint256 w = govToken.balanceOf(msg.sender);
        require(w > 0, "0w");
        Vote storage v = _vote[key];
        require(!v.done, "done");
        if (yes) v.yes += uint128(w); else v.no += uint128(w);
        if (v.yes + v.no >= QUORUM) {
            v.done = true;
            if (v.yes > v.no) _execute(key);
        }
    }

    function _execute(bytes32 key) private {
        bytes4 sel = bytes4(key);
        if (sel == bytes4(keccak256("RATE"))) {
            int16 delta = int16(uint16(uint256(key >> 224)));
            uint256 newRate = uint256(int256(globalRateBps) + delta);
            require(newRate <= 2_000 && newRate >= 100, "range");
            globalRateBps = newRate;
            emit RateChange(delta, newRate);
        } else if (sel == bytes4(keccak256("LIMIT"))) {
            address u = address(uint160(uint256(key >> 96)));
            uint96 l = uint96(uint256(key));
            members[u].ethDeposited = l;
            emit LimitUp(u, l);
        } else if (sel == bytes4(keccak256("BIG"))) {
            (address u,uint256 a) = abi.decode(abi.encodePacked(key), (address,uint256));
            emit BigApproved(u, a);
        }
    }

    /* === SAFETY === */
    receive() external payable { revert("no"); }
}