// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../libraries/JengaTypes.sol";

contract InviteSystem {
    using JengaTypes for JengaTypes.Invite;
    using JengaTypes for JengaTypes.InviteStats;

    // State variables
    mapping(bytes32 => JengaTypes.Invite) public invites;
    mapping(address => JengaTypes.InviteStats) public inviteStats;
    mapping(address => bytes32[]) public userInvites;
    mapping(address => address) public referredBy;
    mapping(address => JengaTypes.Profile) public profiles;

    // Rewards
    uint256 public inviterReward = 0.001 ether;
    uint256 public inviteeReward = 0.0005 ether;
    uint256 public inviteExpiration = 30 days;
    
    address public owner;
    address public jengaCore;

    // Events
    event InviteGenerated(address indexed inviter, bytes32 indexed inviteCode, uint256 expiresAt);
    event InviteUsed(bytes32 indexed inviteCode, address indexed inviter, address indexed invitee);
    event InviteExpired(bytes32 indexed inviteCode, address indexed inviter);
    event RewardPaid(address indexed recipient, uint256 amount, string reason);
    event ProfileCreated(address indexed user, string username);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier validInvite(bytes32 _inviteCode) {
        require(invites[_inviteCode].inviter != address(0), "Invite does not exist");
        require(invites[_inviteCode].isActive, "Invite is not active");
        require(!invites[_inviteCode].isUsed, "Invite already used");
        require(block.timestamp <= invites[_inviteCode].expiresAt, "Invite expired");
        _;
    }

    modifier notAlreadyReferred() {
        require(referredBy[msg.sender] == address(0), "Already referred by someone");
        _;
    }

    constructor(address _jengaCore) {
        owner = msg.sender;
        jengaCore = _jengaCore;
    }

    // Generate a new invite code
    function generateInvite() public returns (bytes32) {
        return generateInviteWithExpiration(inviteExpiration);
    }

    // Generate invite with custom expiration
    function generateInviteWithExpiration(uint256 _duration) public returns (bytes32) {
        bytes32 inviteCode = keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            block.prevrandao,
            inviteStats[msg.sender].totalGenerated
        ));
        
        uint256 expiresAt = block.timestamp + _duration;
        
        invites[inviteCode] = JengaTypes.Invite({
            inviter: msg.sender,
            inviteCode: inviteCode,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            isActive: true,
            isUsed: false,
            usedBy: address(0),
            usedAt: 0
        });
        
        userInvites[msg.sender].push(inviteCode);
        inviteStats[msg.sender].totalGenerated++;
        
        emit InviteGenerated(msg.sender, inviteCode, expiresAt);
        return inviteCode;
    }

    // Accept an invite (use invite code)
    function acceptInvite(bytes32 _inviteCode) 
        public 
        payable 
        validInvite(_inviteCode) 
        notAlreadyReferred 
    {
        JengaTypes.Invite storage invite = invites[_inviteCode];
        address inviter = invite.inviter;
        
        require(inviter != msg.sender, "Cannot use your own invite");
        
        // Mark invite as used
        invite.isUsed = true;
        invite.usedBy = msg.sender;
        invite.usedAt = block.timestamp;
        
        // Update stats
        inviteStats[inviter].totalUsed++;
        inviteStats[inviter].invitees.push(msg.sender);
        referredBy[msg.sender] = inviter;
        
        // Pay rewards if contract has funds
        if (address(this).balance >= inviterReward + inviteeReward) {
            payable(inviter).transfer(inviterReward);
            inviteStats[inviter].totalRewards += inviterReward;
            emit RewardPaid(inviter, inviterReward, "Invite reward");
            
            payable(msg.sender).transfer(inviteeReward);
            emit RewardPaid(msg.sender, inviteeReward, "Welcome bonus");
        }
        
        emit InviteUsed(_inviteCode, inviter, msg.sender);
    }

    // Create user profile with invite generation
    function createProfile(string memory _username, bytes32 _emailHash) public {
        require(profiles[msg.sender].userAddress == address(0), "Profile already exists");
        
        profiles[msg.sender] = JengaTypes.Profile({
            userAddress: msg.sender,
            username: _username,
            emailHash: _emailHash
        });
        
        emit ProfileCreated(msg.sender, _username);
        
        // Auto-generate first invite
        generateInvite();
    }

    // Deactivate an invite
    function deactivateInvite(bytes32 _inviteCode) public {
        require(invites[_inviteCode].inviter == msg.sender, "Not your invite");
        require(invites[_inviteCode].isActive, "Already inactive");
        require(!invites[_inviteCode].isUsed, "Already used");
        
        invites[_inviteCode].isActive = false;
    }

    // View functions
    function getInviteDetails(bytes32 _inviteCode) public view returns (
        address inviter,
        uint256 createdAt,
        uint256 expiresAt,
        bool isActive,
        bool isUsed,
        address usedBy,
        bool isExpired
    ) {
        JengaTypes.Invite memory invite = invites[_inviteCode];
        return (
            invite.inviter,
            invite.createdAt,
            invite.expiresAt,
            invite.isActive,
            invite.isUsed,
            invite.usedBy,
            block.timestamp > invite.expiresAt
        );
    }

    function getUserInviteStats(address _user) public view returns (
        uint256 totalGenerated,
        uint256 totalUsed,
        uint256 totalRewards,
        address[] memory invitees
    ) {
        JengaTypes.InviteStats memory stats = inviteStats[_user];
        return (
            stats.totalGenerated,
            stats.totalUsed,
            stats.totalRewards,
            stats.invitees
        );
    }

    function getUserInvites(address _user) public view returns (bytes32[] memory) {
        return userInvites[_user];
    }

    function getUserActiveInvites(address _user) public view returns (bytes32[] memory) {
        bytes32[] memory allInvites = userInvites[_user];
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < allInvites.length; i++) {
            JengaTypes.Invite memory invite = invites[allInvites[i]];
            if (invite.isActive && !invite.isUsed && block.timestamp <= invite.expiresAt) {
                activeCount++;
            }
        }
        
        bytes32[] memory activeInvites = new bytes32[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allInvites.length; i++) {
            JengaTypes.Invite memory invite = invites[allInvites[i]];
            if (invite.isActive && !invite.isUsed && block.timestamp <= invite.expiresAt) {
                activeInvites[index] = allInvites[i];
                index++;
            }
        }
        
        return activeInvites;
    }

    function getReferrer(address _user) public view returns (address) {
        return referredBy[_user];
    }

    function getUserProfile(address _user) public view returns (
        address userAddress,
        string memory username,
        bytes32 emailHash
    ) {
        JengaTypes.Profile memory profile = profiles[_user];
        return (profile.userAddress, profile.username, profile.emailHash);
    }

    // Admin functions
    function setRewards(uint256 _inviterReward, uint256 _inviteeReward) public onlyOwner {
        inviterReward = _inviterReward;
        inviteeReward = _inviteeReward;
    }

    function setDefaultExpiration(uint256 _duration) public onlyOwner {
        inviteExpiration = _duration;
    }

    function fundRewards() public payable {
        // Anyone can fund the contract for rewards
    }

    function withdraw(uint256 _amount) public onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        payable(owner).transfer(_amount);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Emergency cleanup of expired invites
    function cleanupExpiredInvites(bytes32[] memory _inviteCodes) public {
        for (uint256 i = 0; i < _inviteCodes.length; i++) {
            bytes32 inviteCode = _inviteCodes[i];
            JengaTypes.Invite storage invite = invites[inviteCode];
            
            if (invite.inviter != address(0) && 
                invite.isActive && 
                !invite.isUsed && 
                block.timestamp > invite.expiresAt) {
                
                invite.isActive = false;
                emit InviteExpired(inviteCode, invite.inviter);
            }
        }
    }
}
