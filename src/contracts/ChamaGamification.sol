// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ChamaGamification
 * @dev Handles scoring, achievements, profiles, and invitation system
 * @notice This contract manages user engagement features for the chama system
 */
contract ChamaGamification is ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CHAMA_CORE_ROLE = keccak256("CHAMA_CORE_ROLE");

    struct Profile {
        address userAddress;
        string username;
        bytes32 emailHash;
        uint256 createdAt;
        bool isActive;
    }

    struct Achievement {
        string name;
        string description;
        uint256 points;
        uint256 unlockedAt;
    }

    // State variables
    mapping(address => uint256) public scores;
    mapping(address => Achievement[]) public achievements;
    mapping(address => bytes32) public invitations;
    mapping(bytes32 => address) public inviteHashToAddress;
    mapping(address => Profile) public profiles;
    mapping(address => uint256) public inviteCount;
    mapping(address => address[]) public referrals;

    // Achievement definitions
    mapping(string => uint256) public achievementPoints;
    mapping(string => bool) public validAchievements;

    // Events
    event AchievementUnlocked(address indexed user, string achievement, uint256 points);
    event InviteGenerated(address indexed user, bytes32 inviteHash);
    event InviteAccepted(address indexed referrer, address indexed newUser);
    event ProfileCreated(address indexed user, string username);
    event ProfileUpdated(address indexed user, string username);
    event ScoreUpdated(address indexed user, uint256 newScore, string reason);

    // Custom errors
    error ProfileAlreadyExists();
    error ProfileNotFound();
    error InviteAlreadyGenerated();
    error InvalidReferrer();
    error AchievementNotValid();
    error UnauthorizedCaller();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Initialize default achievements
        _initializeAchievements();
    }

    /**
     * @dev Initialize default achievement definitions
     */
    function _initializeAchievements() internal {
        // Chama achievements
        achievementPoints["Chama Creator"] = 100;
        achievementPoints["First Stack"] = 25;
        achievementPoints["5 Contributions"] = 50;
        achievementPoints["Chama Completed"] = 100;
        achievementPoints["Perfect Attendance"] = 75;
        
        // Social achievements
        achievementPoints["Invited 3 Friends"] = 75;
        achievementPoints["Invited 10 Friends"] = 150;
        achievementPoints["Social Butterfly"] = 200;
        
        // P2P achievements
        achievementPoints["First P2P"] = 20;
        achievementPoints["Sent 5 Red Envelopes"] = 50;
        achievementPoints["Red Envelope Master"] = 100;
        
        // Mark as valid
        validAchievements["Chama Creator"] = true;
        validAchievements["First Stack"] = true;
        validAchievements["5 Contributions"] = true;
        validAchievements["Chama Completed"] = true;
        validAchievements["Perfect Attendance"] = true;
        validAchievements["Invited 3 Friends"] = true;
        validAchievements["Invited 10 Friends"] = true;
        validAchievements["Social Butterfly"] = true;
        validAchievements["First P2P"] = true;
        validAchievements["Sent 5 Red Envelopes"] = true;
        validAchievements["Red Envelope Master"] = true;
    }

    /**
     * @dev Create user profile
     * @param _username Username for the profile
     * @param _emailHash Hashed email for privacy
     */
    function createProfile(string memory _username, bytes32 _emailHash) 
        external 
        whenNotPaused 
    {
        if (profiles[msg.sender].userAddress != address(0)) revert ProfileAlreadyExists();
        
        profiles[msg.sender] = Profile({
            userAddress: msg.sender,
            username: _username,
            emailHash: _emailHash,
            createdAt: block.timestamp,
            isActive: true
        });
        
        emit ProfileCreated(msg.sender, _username);
    }

    /**
     * @dev Update user profile
     * @param _username New username
     */
    function updateProfile(string memory _username) external whenNotPaused {
        if (profiles[msg.sender].userAddress == address(0)) revert ProfileNotFound();
        
        profiles[msg.sender].username = _username;
        emit ProfileUpdated(msg.sender, _username);
    }

    /**
     * @dev Generate invitation hash for user
     * @param _username Username for profile creation
     * @param _emailHash Hashed email
     */
    function generateInvite(string memory _username, bytes32 _emailHash) 
        external 
        whenNotPaused 
    {
        if (invitations[msg.sender] != bytes32(0)) revert InviteAlreadyGenerated();
        
        // Create profile if it doesn't exist
        if (profiles[msg.sender].userAddress == address(0)) {
            profiles[msg.sender] = Profile({
                userAddress: msg.sender,
                username: _username,
                emailHash: _emailHash,
                createdAt: block.timestamp,
                isActive: true
            });
            emit ProfileCreated(msg.sender, _username);
        }
        
        bytes32 inviteHash = keccak256(abi.encodePacked(msg.sender, block.timestamp, block.prevrandao));
        invitations[msg.sender] = inviteHash;
        inviteHashToAddress[inviteHash] = msg.sender;
        
        emit InviteGenerated(msg.sender, inviteHash);
    }

    /**
     * @dev Accept invitation and reward referrer
     * @param _referrerHash Hash of the referrer's invitation
     */
    function acceptInvite(bytes32 _referrerHash) external whenNotPaused {
        address referrer = inviteHashToAddress[_referrerHash];
        if (referrer == address(0)) revert InvalidReferrer();
        
        // Add to referrer's referral list
        referrals[referrer].push(msg.sender);
        inviteCount[referrer]++;
        
        // Award points to referrer
        _addScore(referrer, 50, "Successful Referral");
        
        // Check for invite achievements
        if (inviteCount[referrer] == 3) {
            _unlockAchievement(referrer, "Invited 3 Friends");
        } else if (inviteCount[referrer] == 10) {
            _unlockAchievement(referrer, "Invited 10 Friends");
        } else if (inviteCount[referrer] == 25) {
            _unlockAchievement(referrer, "Social Butterfly");
        }
        
        emit InviteAccepted(referrer, msg.sender);
    }

    /**
     * @dev Add score to user (only callable by authorized contracts)
     * @param _user User address
     * @param _points Points to add
     * @param _reason Reason for score addition
     */
    function addScore(address _user, uint256 _points, string memory _reason) 
        external 
        onlyRole(CHAMA_CORE_ROLE) 
    {
        _addScore(_user, _points, _reason);
    }

    /**
     * @dev Internal function to add score
     * @param _user User address
     * @param _points Points to add
     * @param _reason Reason for score addition
     */
    function _addScore(address _user, uint256 _points, string memory _reason) internal {
        scores[_user] += _points;
        emit ScoreUpdated(_user, scores[_user], _reason);
    }

    /**
     * @dev Subtract score from user (only callable by authorized contracts)
     * @param _user User address
     * @param _points Points to subtract
     * @param _reason Reason for score subtraction
     */
    function subtractScore(address _user, uint256 _points, string memory _reason) 
        external 
        onlyRole(CHAMA_CORE_ROLE) 
    {
        if (scores[_user] >= _points) {
            scores[_user] -= _points;
        } else {
            scores[_user] = 0;
        }
        emit ScoreUpdated(_user, scores[_user], _reason);
    }

    /**
     * @dev Unlock achievement for user (only callable by authorized contracts)
     * @param _user User address
     * @param _achievementName Name of the achievement
     */
    function unlockAchievement(address _user, string memory _achievementName) 
        external 
        onlyRole(CHAMA_CORE_ROLE) 
    {
        _unlockAchievement(_user, _achievementName);
    }

    /**
     * @dev Internal function to unlock achievement
     * @param _user User address
     * @param _achievementName Name of the achievement
     */
    function _unlockAchievement(address _user, string memory _achievementName) internal {
        if (!validAchievements[_achievementName]) revert AchievementNotValid();
        
        // Check if user already has this achievement
        Achievement[] storage userAchievements = achievements[_user];
        for (uint256 i = 0; i < userAchievements.length; i++) {
            if (keccak256(bytes(userAchievements[i].name)) == keccak256(bytes(_achievementName))) {
                return; // Already has achievement
            }
        }
        
        uint256 points = achievementPoints[_achievementName];
        
        achievements[_user].push(Achievement({
            name: _achievementName,
            description: _getAchievementDescription(_achievementName),
            points: points,
            unlockedAt: block.timestamp
        }));
        
        // Add points to user's score
        _addScore(_user, points, string(abi.encodePacked("Achievement: ", _achievementName)));
        
        emit AchievementUnlocked(_user, _achievementName, points);
    }

    /**
     * @dev Get achievement description
     * @param _achievementName Name of the achievement
     * @return description Description of the achievement
     */
    function _getAchievementDescription(string memory _achievementName) 
        internal 
        pure 
        returns (string memory description) 
    {
        bytes32 nameHash = keccak256(bytes(_achievementName));
        
        if (nameHash == keccak256("Chama Creator")) {
            return "Created your first chama";
        } else if (nameHash == keccak256("First Stack")) {
            return "Made your first contribution";
        } else if (nameHash == keccak256("5 Contributions")) {
            return "Made 5 contributions";
        } else if (nameHash == keccak256("Chama Completed")) {
            return "Successfully completed a chama cycle";
        } else if (nameHash == keccak256("Perfect Attendance")) {
            return "Never missed a contribution";
        } else if (nameHash == keccak256("Invited 3 Friends")) {
            return "Invited 3 friends to join";
        } else if (nameHash == keccak256("Invited 10 Friends")) {
            return "Invited 10 friends to join";
        } else if (nameHash == keccak256("Social Butterfly")) {
            return "Invited 25+ friends to join";
        } else if (nameHash == keccak256("First P2P")) {
            return "Sent your first P2P transfer";
        } else if (nameHash == keccak256("Sent 5 Red Envelopes")) {
            return "Sent 5 red envelopes";
        } else if (nameHash == keccak256("Red Envelope Master")) {
            return "Sent 20+ red envelopes";
        } else {
            return "Special achievement unlocked";
        }
    }

    // View functions
    function getUserScore(address _user) external view returns (uint256) {
        return scores[_user];
    }

    function getUserAchievements(address _user) external view returns (Achievement[] memory) {
        return achievements[_user];
    }

    function getUserProfile(address _user) external view returns (Profile memory) {
        return profiles[_user];
    }

    function getUserInviteHash(address _user) external view returns (bytes32) {
        return invitations[_user];
    }

    function getReferralCount(address _user) external view returns (uint256) {
        return inviteCount[_user];
    }

    function getUserReferrals(address _user) external view returns (address[] memory) {
        return referrals[_user];
    }

    function getAchievementPoints(string memory _achievementName) external view returns (uint256) {
        return achievementPoints[_achievementName];
    }

    function isValidAchievement(string memory _achievementName) external view returns (bool) {
        return validAchievements[_achievementName];
    }

    // Admin functions
    function addAchievement(
        string memory _name, 
        uint256 _points
    ) external onlyRole(ADMIN_ROLE) {
        achievementPoints[_name] = _points;
        validAchievements[_name] = true;
    }

    function updateAchievementPoints(
        string memory _name, 
        uint256 _points
    ) external onlyRole(ADMIN_ROLE) {
        if (!validAchievements[_name]) revert AchievementNotValid();
        achievementPoints[_name] = _points;
    }

    function setChamaCore(address _chamaCoreContract) external onlyRole(ADMIN_ROLE) {
        _grantRole(CHAMA_CORE_ROLE, _chamaCoreContract);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // Internal function to find address by invite hash
    function findAddressByInviteHash(bytes32 _inviteHash) external view returns (address) {
        return inviteHashToAddress[_inviteHash];
    }
}
