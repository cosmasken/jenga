// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./JengaRegistry.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StackingVault is ERC721 {
    JengaRegistry public registry;
    
    struct StackingGoal {
        uint256 dailyAmount;
        uint256 lastDeposit;
        uint256 streak;
        uint256 totalSaved;
    }

    mapping(address => StackingGoal) public goals;
    mapping(uint256 => string) public streakNFTMetadata;
    uint256 private _tokenIdCounter;

    event GoalCreated(address indexed user, uint256 dailyAmount);
    event DepositMade(address indexed user, uint256 amount, uint256 newStreak);
    event StreakNFTMinted(address indexed user, uint256 tokenId, uint256 streak);

    constructor(address _registry) ERC721("JengaStreak", "JSTR") {
        registry = JengaRegistry(_registry);
    }

    function createStackingGoal(uint256 _dailyAmount) external {
        require(goals[msg.sender].dailyAmount == 0, "Goal exists");
        goals[msg.sender] = StackingGoal({
            dailyAmount: _dailyAmount,
            lastDeposit: block.timestamp,
            streak: 1,
            totalSaved: 0
        });
        emit GoalCreated(msg.sender, _dailyAmount);
    }

    function makeDeposit() external payable {
        StackingGoal storage goal = goals[msg.sender];
        require(registry.profileExists(msg.sender), "Profile does not exist");
        require(goal.dailyAmount > 0, "No goal set");
        require(msg.value == goal.dailyAmount, "Incorrect amount");
        
        // Check if within streak window (24-48 hours)
        bool withinWindow = block.timestamp <= goal.lastDeposit + 48 hours;
        
        if (block.timestamp > goal.lastDeposit + 24 hours) {
            if (withinWindow) {
                goal.streak++;
            } else {
                goal.streak = 1; // Reset streak
            }
        }
        
        goal.lastDeposit = block.timestamp;
        goal.totalSaved += msg.value;
        
        // Mint NFT at milestone streaks
        if (goal.streak % 7 == 0) {
            _mintStreakNFT(msg.sender, goal.streak);
        }
        
        // Update registry
        registry.updateStackingScore(msg.sender, 5);
        
        emit DepositMade(msg.sender, msg.value, goal.streak);
    }

    function _mintStreakNFT(address to, uint256 streak) private {
        uint256 tokenId = _tokenIdCounter++;
        _mint(to, tokenId);
        streakNFTMetadata[tokenId] = string(abi.encodePacked(
            "{\"streak\":", Strings.toString(streak), 
            ",\"date\":", Strings.toString(block.timestamp), "}"
        ));
        emit StreakNFTMinted(to, tokenId, streak);
    }
}