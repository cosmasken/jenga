// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FakeUSDC
 * @dev Fake USDC token for testing purposes on Citrea testnet
 * @notice This is a test token with 6 decimals like real USDC
 */
contract FakeUSDC is ERC20, Ownable {
    uint8 private _decimals = 6;
    mapping(address => uint256) public lastFaucetClaim;
    uint256 public constant FAUCET_AMOUNT = 1000; // 1000 USDC per claim
    uint256 public constant FAUCET_COOLDOWN = 24 hours; // 24 hour cooldown
    
    constructor() ERC20("Fake USD Coin", "fUSDC") Ownable(msg.sender) {
        // Mint initial supply to deployer (1 million USDC)
        _mint(msg.sender, 1_000_000 * 10**_decimals);
    }
    
    /**
     * @dev Returns the number of decimals used to get its user representation
     * USDC uses 6 decimals
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Mint tokens to any address (for testing purposes)
     * @param to Address to mint tokens to
     * @param amount Amount to mint (in token units, not wei)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount * 10**_decimals);
    }
    
    /**
     * @dev Faucet function - anyone can get 1000 USDC for testing
     * Can only be called once per 24 hours per address
     */
    function faucet() external {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "Faucet cooldown not met"
        );
        
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT * 10**_decimals);
    }
    
    /**
     * @dev Check if address can claim from faucet
     * @param user Address to check
     * @return canClaim Whether user can claim
     * @return timeUntilNextClaim Seconds until next claim (0 if can claim now)
     */
    function canClaimFaucet(address user) external view returns (bool canClaim, uint256 timeUntilNextClaim) {
        uint256 nextClaimTime = lastFaucetClaim[user] + FAUCET_COOLDOWN;
        if (block.timestamp >= nextClaimTime) {
            return (true, 0);
        } else {
            return (false, nextClaimTime - block.timestamp);
        }
    }
    
    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount to burn (in token units)
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount * 10**_decimals);
    }
}
