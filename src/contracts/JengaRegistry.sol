// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract JengaRegistry is Ownable {
    struct UserProfile {
        string username;
        uint256 stackingScore;
        uint256 totalStacked;
        uint256 joinedSaccos;
        uint256 completedSaccos;
        bool exists; // To check if profile exists
    }

    constructor() Ownable(msg.sender) {}

    mapping(address => UserProfile) public profiles;
    mapping(string => address) public usernameToAddress;
    
    event ProfileCreated(address indexed user, string username);
    event StackingScoreUpdated(address indexed user, uint256 newScore);

    function createProfile(string memory _username) external {
        require(bytes(_username).length > 0, "Invalid username");
        require(usernameToAddress[_username] == address(0), "Username taken");
        require(!profiles[msg.sender].exists, "Profile exists");
        
        profiles[msg.sender] = UserProfile({
            username: _username,
            stackingScore: 100, // Base score
            totalStacked: 0,
            joinedSaccos: 0,
            completedSaccos: 0,
            exists: true
        });
        
        usernameToAddress[_username] = msg.sender;
        emit ProfileCreated(msg.sender, _username);
    }

    function profileExists(address user) external view returns (bool) {
        return profiles[user].exists;
    }
    
    function updateStackingScore(address _user, uint256 _scoreDelta) public onlyOwner {
        profiles[_user].stackingScore += _scoreDelta;
        emit StackingScoreUpdated(_user, profiles[_user].stackingScore);
    }

    function recordSaccoCompletion(address _user) external onlyOwner {
        profiles[_user].completedSaccos++;
        updateStackingScore(_user, 50); // Bonus for completing SACCO
    }
}