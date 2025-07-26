// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./modules/JengaCore.sol";
import "./modules/InviteSystem.sol";
import "./modules/P2PSystem.sol";
import "./modules/RedEnvelopeSystem.sol";
import "./libraries/JengaTypes.sol";

contract JengaModular {
    // Module contracts
    JengaCore public jengaCore;
    InviteSystem public inviteSystem;
    P2PSystem public p2pSystem;
    RedEnvelopeSystem public redEnvelopeSystem;
    
    address public owner;
    bool public initialized = false;

    // Events
    event ModulesInitialized(
        address jengaCore,
        address inviteSystem,
        address p2pSystem,
        address redEnvelopeSystem
    );
    event ModuleUpdated(string moduleName, address oldAddress, address newAddress);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyInitialized() {
        require(initialized, "Contract not initialized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Initialize all modules
    function initializeModules() public onlyOwner {
        require(!initialized, "Already initialized");
        
        // Deploy core module
        jengaCore = new JengaCore();
        
        // Deploy other modules with core reference
        inviteSystem = new InviteSystem(address(jengaCore));
        p2pSystem = new P2PSystem(address(jengaCore));
        redEnvelopeSystem = new RedEnvelopeSystem(address(jengaCore));
        
        initialized = true;
        
        emit ModulesInitialized(
            address(jengaCore),
            address(inviteSystem),
            address(p2pSystem),
            address(redEnvelopeSystem)
        );
    }

    // Initialize with existing module addresses (for upgrades)
    function initializeWithAddresses(
        address _jengaCore,
        address _inviteSystem,
        address _p2pSystem,
        address _redEnvelopeSystem
    ) public onlyOwner {
        require(!initialized, "Already initialized");
        
        jengaCore = JengaCore(_jengaCore);
        inviteSystem = InviteSystem(_inviteSystem);
        p2pSystem = P2PSystem(_p2pSystem);
        redEnvelopeSystem = RedEnvelopeSystem(_redEnvelopeSystem);
        
        initialized = true;
        
        emit ModulesInitialized(_jengaCore, _inviteSystem, _p2pSystem, _redEnvelopeSystem);
    }

    // ========== CHAMA FUNCTIONS (JengaCore) ==========
    
    function createChama(
        string memory _name,
        uint256 _contributionAmount,
        uint256 _cycleDuration,
        uint256 _maxMembers
    ) public payable onlyInitialized {
        jengaCore.createChama{value: msg.value}(_name, _contributionAmount, _cycleDuration, _maxMembers);
    }

    function joinChama(uint256 _chamaId) public payable onlyInitialized {
        jengaCore.joinChama{value: msg.value}(_chamaId);
    }

    function startChama(uint256 _chamaId) public onlyInitialized {
        jengaCore.startChama(_chamaId);
    }

    function stackBTC(uint256 _chamaId) public payable onlyInitialized {
        jengaCore.stackBTC{value: msg.value}(_chamaId);
    }

    function emergencyPayout(uint256 _chamaId, address _recipient) public onlyInitialized {
        jengaCore.emergencyPayout(_chamaId, _recipient);
    }

    function processMissedContributions(uint256 _chamaId) public onlyInitialized {
        jengaCore.processMissedContributions(_chamaId);
    }

    // Chama view functions
    function getChamaInfo(uint256 _chamaId) public view onlyInitialized returns (
        string memory name,
        uint256 contributionAmount,
        uint256 cycleDuration,
        uint256 maxMembers,
        bool active,
        uint256 currentCycle,
        uint256 currentRecipientIndex,
        uint256 lastCycleTimestamp,
        uint256 totalPool,
        uint256 totalCollateral
    ) {
        return jengaCore.getChamaInfo(_chamaId);
    }

    function getChamaMembers(uint256 _chamaId) public view onlyInitialized returns (address[] memory) {
        return jengaCore.getChamaMembers(_chamaId);
    }

    function getUserScore(address _user) public view onlyInitialized returns (uint256) {
        return jengaCore.getUserScore(_user);
    }

    function chamaCount() public view onlyInitialized returns (uint256) {
        return jengaCore.chamaCount();
    }

    // ========== INVITE FUNCTIONS (InviteSystem) ==========
    
    function generateInvite() public onlyInitialized returns (bytes32) {
        return inviteSystem.generateInvite();
    }

    function acceptInvite(bytes32 _inviteCode) public payable onlyInitialized {
        inviteSystem.acceptInvite{value: msg.value}(_inviteCode);
    }

    function createProfile(string memory _username, bytes32 _emailHash) public onlyInitialized {
        inviteSystem.createProfile(_username, _emailHash);
    }

    function getUserInviteStats(address _user) public view onlyInitialized returns (
        uint256 totalGenerated,
        uint256 totalUsed,
        uint256 totalRewards,
        address[] memory invitees
    ) {
        return inviteSystem.getUserInviteStats(_user);
    }

    function getUserActiveInvites(address _user) public view onlyInitialized returns (bytes32[] memory) {
        return inviteSystem.getUserActiveInvites(_user);
    }

    function getReferrer(address _user) public view onlyInitialized returns (address) {
        return inviteSystem.getReferrer(_user);
    }

    // ========== P2P FUNCTIONS (P2PSystem) ==========
    
    function sendP2P(address _receiver) public payable onlyInitialized {
        p2pSystem.sendP2P{value: msg.value}(_receiver);
    }

    function sendBatchP2P(address[] memory _receivers, uint256[] memory _amounts) public payable onlyInitialized {
        p2pSystem.sendBatchP2P{value: msg.value}(_receivers, _amounts);
    }

    function getTransactionHistory(address _user) public view onlyInitialized returns (JengaTypes.Transaction[] memory) {
        return p2pSystem.getTransactionHistory(_user);
    }

    function getUserTotals(address _user) public view onlyInitialized returns (uint256 sent, uint256 received) {
        return p2pSystem.getUserTotals(_user);
    }

    // ========== RED ENVELOPE FUNCTIONS (RedEnvelopeSystem) ==========
    
    function sendRedEnvelope(
        address[] memory _recipients,
        uint256 _totalAmount,
        bool _isRandom,
        string memory _message
    ) public payable onlyInitialized {
        redEnvelopeSystem.sendRedEnvelope{value: msg.value}(_recipients, _totalAmount, _isRandom, _message);
    }

    function claimRedEnvelope(uint256 _envelopeId) public onlyInitialized {
        redEnvelopeSystem.claimRedEnvelope(_envelopeId);
    }

    function batchClaimRedEnvelopes(uint256[] memory _envelopeIds) public onlyInitialized {
        redEnvelopeSystem.batchClaimRedEnvelopes(_envelopeIds);
    }

    function getUserClaimableEnvelopes(address _user) public view onlyInitialized returns (uint256[] memory) {
        return redEnvelopeSystem.getUserClaimableEnvelopes(_user);
    }

    function getRedEnvelopeDetails(uint256 _envelopeId) public view onlyInitialized returns (
        address sender,
        address[] memory recipients,
        uint256 totalAmount,
        uint256[] memory amounts,
        bool claimed,
        uint256 timestamp,
        uint256 claimedCount
    ) {
        return redEnvelopeSystem.getRedEnvelopeDetails(_envelopeId);
    }

    // ========== ADMIN FUNCTIONS ==========
    
    function updateModule(string memory _moduleName, address _newAddress) public onlyOwner onlyInitialized {
        address oldAddress;
        
        if (keccak256(bytes(_moduleName)) == keccak256(bytes("jengaCore"))) {
            oldAddress = address(jengaCore);
            jengaCore = JengaCore(_newAddress);
        } else if (keccak256(bytes(_moduleName)) == keccak256(bytes("inviteSystem"))) {
            oldAddress = address(inviteSystem);
            inviteSystem = InviteSystem(_newAddress);
        } else if (keccak256(bytes(_moduleName)) == keccak256(bytes("p2pSystem"))) {
            oldAddress = address(p2pSystem);
            p2pSystem = P2PSystem(_newAddress);
        } else if (keccak256(bytes(_moduleName)) == keccak256(bytes("redEnvelopeSystem"))) {
            oldAddress = address(redEnvelopeSystem);
            redEnvelopeSystem = RedEnvelopeSystem(_newAddress);
        } else {
            revert("Invalid module name");
        }
        
        emit ModuleUpdated(_moduleName, oldAddress, _newAddress);
    }

    function getModuleAddresses() public view onlyInitialized returns (
        address jengaCoreAddr,
        address inviteSystemAddr,
        address p2pSystemAddr,
        address redEnvelopeSystemAddr
    ) {
        return (
            address(jengaCore),
            address(inviteSystem),
            address(p2pSystem),
            address(redEnvelopeSystem)
        );
    }

    // Fund modules for rewards/fees
    function fundInviteSystem() public payable onlyInitialized {
        inviteSystem.fundRewards{value: msg.value}();
    }

    // Emergency functions
    function pause() public onlyOwner {
        // Could implement pausable functionality across all modules
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }

    // Fallback function to handle direct payments
    receive() external payable {
        // Could route to appropriate module based on context
        revert("Use specific functions");
    }

    fallback() external payable {
        revert("Function not found");
    }
}
