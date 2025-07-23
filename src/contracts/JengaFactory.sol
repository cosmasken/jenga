// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ChamaCore.sol";
import "./ChamaGamification.sol";
import "./P2PTransfer.sol";

/**
 * @title JengaFactory
 * @dev Main contract that orchestrates all Jenga modules
 * @notice This contract provides a unified interface for all Jenga functionality
 */
contract JengaFactory is ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Module contracts
    ChamaCore public chamaCore;
    ChamaGamification public chamaGamification;
    P2PTransfer public p2pTransfer;

    // Events
    event ModuleUpdated(string indexed moduleName, address indexed oldAddress, address indexed newAddress);
    event CrossModuleInteraction(address indexed user, string action, uint256 points);

    // Custom errors
    error ModuleNotSet();
    error InvalidModule();

    constructor(
        address _chamaCoreAddress,
        address _chamaGamificationAddress,
        address _p2pTransferAddress
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        // Set module addresses
        chamaCore = ChamaCore(_chamaCoreAddress);
        chamaGamification = ChamaGamification(_chamaGamificationAddress);
        p2pTransfer = P2PTransfer(_p2pTransferAddress);

        // Set up cross-module permissions
        _setupModulePermissions();
    }

    /**
     * @dev Set up permissions between modules
     */
    function _setupModulePermissions() internal {
        // Grant ChamaCore permission to interact with Gamification
        chamaGamification.setChamaCore(address(chamaCore));
        
        // Grant P2PTransfer permission to interact with Gamification
        p2pTransfer.setGamificationContract(address(chamaGamification));
    }

    // ============ CHAMA CORE FUNCTIONS ============

    /**
     * @dev Create a new chama with gamification integration
     */
    function createChama(
        string memory _name,
        uint256 _contributionAmount,
        uint256 _cycleDuration,
        uint256 _maxMembers
    ) external payable whenNotPaused {
        // Create chama through core contract
        chamaCore.createChama{value: msg.value}(_name, _contributionAmount, _cycleDuration, _maxMembers);
        
        // Award gamification points
        chamaGamification.addScore(msg.sender, 100, "Chama Created");
        chamaGamification.unlockAchievement(msg.sender, "Chama Creator");
        
        emit CrossModuleInteraction(msg.sender, "Chama Created", 100);
    }

    /**
     * @dev Join chama with gamification integration
     */
    function joinChama(uint256 _chamaId) external payable whenNotPaused {
        chamaCore.joinChama{value: msg.value}(_chamaId);
        
        // Award points for joining
        chamaGamification.addScore(msg.sender, 25, "Joined Chama");
        
        emit CrossModuleInteraction(msg.sender, "Joined Chama", 25);
    }

    /**
     * @dev Make contribution with gamification tracking
     */
    function stackBTC(uint256 _chamaId) external payable whenNotPaused {
        // Get contribution count before stacking
        ChamaCore.Contribution[] memory contributions = chamaCore.getMemberContributions(_chamaId, msg.sender);
        uint256 contributionsBefore = contributions.length;
        
        // Make contribution
        chamaCore.stackBTC{value: msg.value}(_chamaId);
        
        // Award points
        chamaGamification.addScore(msg.sender, 10, "Contribution Made");
        
        // Check for achievements
        if (contributionsBefore == 0) {
            chamaGamification.unlockAchievement(msg.sender, "First Stack");
        } else if (contributionsBefore + 1 == 5) {
            chamaGamification.unlockAchievement(msg.sender, "5 Contributions");
        }
        
        emit CrossModuleInteraction(msg.sender, "Contribution Made", 10);
    }

    /**
     * @dev Start chama
     */
    function startChama(uint256 _chamaId) external whenNotPaused {
        chamaCore.startChama(_chamaId);
    }

    /**
     * @dev Process missed contributions
     */
    function processMissedContributions(uint256 _chamaId) external whenNotPaused {
        chamaCore.processMissedContributions(_chamaId);
        
        // Penalize users who missed contributions
        address[] memory members = chamaCore.getChamaMembers(_chamaId);
        for (uint256 i = 0; i < members.length; i++) {
            // This would need additional logic to check who missed
            // For now, we'll handle this in the core contract
        }
    }

    // ============ GAMIFICATION FUNCTIONS ============

    /**
     * @dev Create user profile
     */
    function createProfile(string memory _username, bytes32 _emailHash) external whenNotPaused {
        chamaGamification.createProfile(_username, _emailHash);
    }

    /**
     * @dev Update user profile
     */
    function updateProfile(string memory _username) external whenNotPaused {
        chamaGamification.updateProfile(_username);
    }

    /**
     * @dev Generate invitation
     */
    function generateInvite(string memory _username, bytes32 _emailHash) external whenNotPaused {
        chamaGamification.generateInvite(_username, _emailHash);
    }

    /**
     * @dev Accept invitation
     */
    function acceptInvite(bytes32 _referrerHash) external whenNotPaused {
        chamaGamification.acceptInvite(_referrerHash);
    }

    // ============ P2P TRANSFER FUNCTIONS ============

    /**
     * @dev Send P2P transfer with gamification integration
     */
    function sendP2P(address _receiver) external payable whenNotPaused {
        // Get P2P count before transfer
        uint256 p2pCountBefore = p2pTransfer.getUserP2PCount(msg.sender);
        
        // Send P2P transfer
        p2pTransfer.sendP2P{value: msg.value}(_receiver);
        
        // Award points
        chamaGamification.addScore(msg.sender, 5, "P2P Transfer");
        
        // Check for first P2P achievement
        if (p2pCountBefore == 0) {
            chamaGamification.unlockAchievement(msg.sender, "First P2P");
        }
        
        emit CrossModuleInteraction(msg.sender, "P2P Transfer", 5);
    }

    /**
     * @dev Send red envelope with gamification integration
     */
    function sendRedEnvelope(
        address[] memory _recipients,
        uint256 _totalAmount,
        bool _isRandom,
        string memory _message
    ) external payable whenNotPaused {
        // Get red envelope count before sending
        uint256 redEnvelopeCountBefore = p2pTransfer.getUserRedEnvelopeCount(msg.sender);
        
        // Send red envelope
        p2pTransfer.sendRedEnvelope{value: msg.value}(_recipients, _totalAmount, _isRandom, _message);
        
        // Award points
        chamaGamification.addScore(msg.sender, 20, "Red Envelope Sent");
        
        // Check for achievements
        if (redEnvelopeCountBefore + 1 == 5) {
            chamaGamification.unlockAchievement(msg.sender, "Sent 5 Red Envelopes");
        } else if (redEnvelopeCountBefore + 1 == 20) {
            chamaGamification.unlockAchievement(msg.sender, "Red Envelope Master");
        }
        
        emit CrossModuleInteraction(msg.sender, "Red Envelope Sent", 20);
    }

    /**
     * @dev Claim red envelope
     */
    function claimRedEnvelope(uint256 _envelopeId) external whenNotPaused {
        p2pTransfer.claimRedEnvelope(_envelopeId);
        
        // Award small points for claiming
        chamaGamification.addScore(msg.sender, 2, "Red Envelope Claimed");
        
        emit CrossModuleInteraction(msg.sender, "Red Envelope Claimed", 2);
    }

    /**
     * @dev Expire red envelope
     */
    function expireRedEnvelope(uint256 _envelopeId) external whenNotPaused {
        p2pTransfer.expireRedEnvelope(_envelopeId);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get user's complete profile including all modules
     */
    function getUserCompleteProfile(address _user) external view returns (
        ChamaGamification.Profile memory profile,
        uint256 score,
        ChamaGamification.Achievement[] memory achievements,
        uint256 p2pCount,
        uint256 redEnvelopeCount
    ) {
        profile = chamaGamification.getUserProfile(_user);
        score = chamaGamification.getUserScore(_user);
        achievements = chamaGamification.getUserAchievements(_user);
        p2pCount = p2pTransfer.getUserP2PCount(_user);
        redEnvelopeCount = p2pTransfer.getUserRedEnvelopeCount(_user);
    }

    /**
     * @dev Get chama details
     */
    function getChamaDetails(uint256 _chamaId) external view returns (
        string memory name,
        uint256 contributionAmount,
        uint256 cycleDuration,
        uint256 maxMembers,
        uint256 currentMembers,
        bool active,
        uint256 currentCycle,
        uint256 totalPool,
        uint256 totalCollateral
    ) {
        return chamaCore.getChamaDetails(_chamaId);
    }

    /**
     * @dev Get module addresses
     */
    function getModuleAddresses() external view returns (
        address chamaCoreAddress,
        address chamaGamificationAddress,
        address p2pTransferAddress
    ) {
        return (
            address(chamaCore),
            address(chamaGamification),
            address(p2pTransfer)
        );
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Update ChamaCore module
     */
    function updateChamaCore(address _newChamaCore) external onlyRole(ADMIN_ROLE) {
        if (_newChamaCore == address(0)) revert InvalidModule();
        
        address oldAddress = address(chamaCore);
        chamaCore = ChamaCore(_newChamaCore);
        
        // Update permissions
        chamaGamification.setChamaCore(_newChamaCore);
        
        emit ModuleUpdated("ChamaCore", oldAddress, _newChamaCore);
    }

    /**
     * @dev Update ChamaGamification module
     */
    function updateChamaGamification(address _newChamaGamification) external onlyRole(ADMIN_ROLE) {
        if (_newChamaGamification == address(0)) revert InvalidModule();
        
        address oldAddress = address(chamaGamification);
        chamaGamification = ChamaGamification(_newChamaGamification);
        
        // Update permissions
        chamaCore.setGamificationContract(_newChamaGamification);
        p2pTransfer.setGamificationContract(_newChamaGamification);
        
        emit ModuleUpdated("ChamaGamification", oldAddress, _newChamaGamification);
    }

    /**
     * @dev Update P2PTransfer module
     */
    function updateP2PTransfer(address _newP2PTransfer) external onlyRole(ADMIN_ROLE) {
        if (_newP2PTransfer == address(0)) revert InvalidModule();
        
        address oldAddress = address(p2pTransfer);
        p2pTransfer = P2PTransfer(_newP2PTransfer);
        
        emit ModuleUpdated("P2PTransfer", oldAddress, _newP2PTransfer);
    }

    /**
     * @dev Pause all modules
     */
    function pauseAll() external onlyRole(ADMIN_ROLE) {
        _pause();
        chamaCore.pause();
        chamaGamification.pause();
        p2pTransfer.pause();
    }

    /**
     * @dev Unpause all modules
     */
    function unpauseAll() external onlyRole(ADMIN_ROLE) {
        _unpause();
        chamaCore.unpause();
        chamaGamification.unpause();
        p2pTransfer.unpause();
    }

    /**
     * @dev Emergency function to handle chama completion rewards
     */
    function handleChamaCompletion(uint256 _chamaId) external onlyRole(ADMIN_ROLE) {
        address[] memory members = chamaCore.getChamaMembers(_chamaId);
        
        for (uint256 i = 0; i < members.length; i++) {
            if (chamaCore.hasMemberReceivedPayout(_chamaId, members[i])) {
                chamaGamification.addScore(members[i], 100, "Chama Completed");
                chamaGamification.unlockAchievement(members[i], "Chama Completed");
            }
        }
    }

    // ============ FALLBACK FUNCTIONS ============

    /**
     * @dev Fallback function to handle direct payments
     */
    receive() external payable {
        // Direct payments not allowed
        revert("Direct payments not allowed");
    }

    /**
     * @dev Fallback function
     */
    fallback() external payable {
        revert("Function not found");
    }
}
