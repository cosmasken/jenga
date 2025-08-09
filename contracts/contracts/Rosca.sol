// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ROSCAImproved
 * @dev Enhanced ROSCA (Rotating Savings and Credit Association) smart contract
 * @notice This contract manages Bitcoin-based savings circles with automatic creator membership
 */

 struct GroupView {
    uint40 id;
    uint40 roundLength;
    uint40 nextDue;
    address token;
    uint96 contribution;
    uint8 currentRound;
    uint8 maxMembers;
    bool isActive;
    address creator;
    uint256 memberCount;
    uint256 totalPaidOut;
    uint256 groupDisputeCount;
}
contract ROSCA {
    struct Group {
        uint40 id;
        uint40 roundLength;
        uint40 nextDue;
        address token;
        uint96 contribution;
        uint8 currentRound;
        uint8 maxMembers;
        bool isActive;
        address creator;
        uint256 memberCount;
        uint256 totalPaidOut;
        uint256 groupDisputeCount;
        uint40 newRoundLength;
        uint40 changeActivates;
        mapping(address => bool) isMember;
        mapping(address => uint256) contributions;
        mapping(address => bool) hasContributedThisRound;
        address[] members;
    }

    struct Dispute {
        uint256 groupId;
        address complainant;
        address defendant;
        string reason;
        DisputeStatus status;
        uint256 createdAt;
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(address => bool) hasVoted;
    }

    enum DisputeStatus { None, Active, Resolved, Rejected }

    mapping(uint256 => Group) public groups;
    mapping(uint256 => Dispute) public disputes;
    
    uint256 public groupCount;
    uint256 public disputeCount;

    // Events
    event Created(uint256 indexed id, address indexed creator, address indexed token, uint256 contribution, uint256 roundLength, uint8 maxMembers);
    event Joined(uint256 indexed id, address indexed member);
    event Contrib(uint256 indexed id, address indexed member, uint256 amount);
    event Payout(uint256 indexed id, address indexed recipient, uint256 amount, uint8 round);
    event Leave(uint256 indexed id, address indexed member);
    event RoundLenChangeScheduled(uint256 indexed id, uint256 newLength, uint256 activates);
    event GroupStatusChanged(uint256 indexed id, bool isActive);
    event DisputeCreated(uint256 indexed disputeId, uint256 indexed groupId, address indexed complainant, address defendant, string reason);
    event DisputeVoted(uint256 indexed disputeId, address indexed voter, bool support);
    event DisputeResolved(uint256 indexed disputeId, bool upheld);

    modifier onlyGroupMember(uint256 gid) {
        require(groups[gid].isMember[msg.sender], "Not a group member");
        _;
    }

    modifier onlyGroupCreator(uint256 gid) {
        require(groups[gid].creator == msg.sender, "Not the group creator");
        _;
    }

    modifier groupExists(uint256 gid) {
        require(gid < groupCount, "Group does not exist");
        _;
    }

    /**
     * @dev Create a new ROSCA group and automatically add creator as first member
     * @param _token Token address (use address(0) for native ETH/cBTC)
     * @param _contribution Contribution amount per round
     * @param _roundLength Duration of each round in seconds
     * @param _maxMembers Maximum number of members (2-50)
     * @return gid The ID of the created group
     */
    function createGroup(
        address _token,
        uint96 _contribution,
        uint40 _roundLength,
        uint8 _maxMembers
    ) external payable returns (uint256 gid) {
        require(_contribution > 0, "Contribution must be > 0");
        require(_roundLength > 0, "Round length must be > 0");
        require(_maxMembers >= 2 && _maxMembers <= 50, "Invalid max members");
        
        // For native token, ensure creator sends the contribution
        if (_token == address(0)) {
            require(msg.value == _contribution, "Must send exact contribution amount");
        }

        gid = groupCount++;
        Group storage group = groups[gid];
        
        group.id = uint40(gid);
        group.roundLength = _roundLength;
        group.nextDue = uint40(block.timestamp + _roundLength);
        group.token = _token;
        group.contribution = _contribution;
        group.currentRound = 1; // Start at round 1 since creator joins immediately
        group.maxMembers = _maxMembers;
        group.isActive = true;
        group.creator = msg.sender;
        group.memberCount = 1; // Creator is first member
        
        // Automatically add creator as first member
        group.isMember[msg.sender] = true;
        group.members.push(msg.sender);
        group.contributions[msg.sender] = _contribution;
        group.hasContributedThisRound[msg.sender] = true;

        emit Created(gid, msg.sender, _token, _contribution, _roundLength, _maxMembers);
        emit Joined(gid, msg.sender);
        emit Contrib(gid, msg.sender, _contribution);
    }

    /**
     * @dev Join an existing group
     * @param gid Group ID to join
     */
    function joinGroup(uint256 gid) external payable groupExists(gid) {
        Group storage group = groups[gid];
        
        require(group.isActive, "Group is not active");
        require(!group.isMember[msg.sender], "Already a member");
        require(group.memberCount < group.maxMembers, "Group is full");
        
        // For native token, ensure user sends the contribution
        if (group.token == address(0)) {
            require(msg.value == group.contribution, "Must send exact contribution amount");
        }
        
        group.isMember[msg.sender] = true;
        group.members.push(msg.sender);
        group.memberCount++;
        group.contributions[msg.sender] += group.contribution;
        group.hasContributedThisRound[msg.sender] = true;

        emit Joined(gid, msg.sender);
        emit Contrib(gid, msg.sender, group.contribution);
    }

    /**
     * @dev Make a contribution to the group
     * @param gid Group ID
     */
    function contribute(uint256 gid) external payable onlyGroupMember(gid) {
        Group storage group = groups[gid];
        
        require(group.isActive, "Group is not active");
        require(!group.hasContributedThisRound[msg.sender], "Already contributed this round");
        
        // For native token, ensure user sends the contribution
        if (group.token == address(0)) {
            require(msg.value == group.contribution, "Must send exact contribution amount");
        }
        
        group.contributions[msg.sender] += group.contribution;
        group.hasContributedThisRound[msg.sender] = true;

        emit Contrib(gid, msg.sender, group.contribution);
    }

    /**
     * @dev Leave a group (only before rounds start or in emergency)
     * @param gid Group ID to leave
     */
    function leaveGroup(uint256 gid) external onlyGroupMember(gid) {
        Group storage group = groups[gid];
        
        // Can only leave if rounds haven't started or in emergency
        require(group.currentRound <= 1, "Cannot leave after rounds have started");
        
        group.isMember[msg.sender] = false;
        group.memberCount--;
        
        // Remove from members array
        for (uint i = 0; i < group.members.length; i++) {
            if (group.members[i] == msg.sender) {
                group.members[i] = group.members[group.members.length - 1];
                group.members.pop();
                break;
            }
        }
        
        // Refund contribution if paid
        uint256 refundAmount = group.contributions[msg.sender];
        if (refundAmount > 0) {
            group.contributions[msg.sender] = 0;
            if (group.token == address(0)) {
                payable(msg.sender).transfer(refundAmount);
            }
        }

        emit Leave(gid, msg.sender);
    }

    /**
     * @dev Emergency exit with penalties
     * @param gid Group ID
     */
    function rageQuit(uint256 gid) external onlyGroupMember(gid) {
        Group storage group = groups[gid];
        
        group.isMember[msg.sender] = false;
        group.memberCount--;
        
        // Remove from members array
        for (uint i = 0; i < group.members.length; i++) {
            if (group.members[i] == msg.sender) {
                group.members[i] = group.members[group.members.length - 1];
                group.members.pop();
                break;
            }
        }
        
        // Forfeit contributions (penalty for rage quitting)
        group.contributions[msg.sender] = 0;

        emit Leave(gid, msg.sender);
    }

  
function getGroupDetails(uint256 gid)
    external
    view
    groupExists(gid)
    returns (GroupView memory)
{
    Group storage g = groups[gid];
    return GroupView({
        id: g.id,
        roundLength: g.roundLength,
        nextDue: g.nextDue,
        token: g.token,
        contribution: g.contribution,
        currentRound: g.currentRound,
        maxMembers: g.maxMembers,
        isActive: g.isActive,
        creator: g.creator,
        memberCount: g.memberCount,
        totalPaidOut: g.totalPaidOut,
        groupDisputeCount: g.groupDisputeCount
    });
}

    /**
     * @dev Get group members
     * @param gid Group ID
     * @return Array of member addresses
     */
    function getGroupMembers(uint256 gid) external view groupExists(gid) returns (address[] memory) {
        return groups[gid].members;
    }

    /**
     * @dev Set group status (only creator)
     * @param gid Group ID
     * @param _isActive New status
     */
    function setGroupStatus(uint256 gid, bool _isActive) external onlyGroupCreator(gid) {
        groups[gid].isActive = _isActive;
        emit GroupStatusChanged(gid, _isActive);
    }

    /**
     * @dev Schedule round length change
     * @param gid Group ID
     * @param newLen New round length
     */
    function scheduleRoundLength(uint256 gid, uint40 newLen) external onlyGroupCreator(gid) {
        require(newLen > 0, "Invalid round length");
        
        Group storage group = groups[gid];
        group.newRoundLength = newLen;
        group.changeActivates = uint40(block.timestamp + group.roundLength);
        
        emit RoundLenChangeScheduled(gid, newLen, group.changeActivates);
    }

    /**
     * @dev Kick a member (only creator, with dispute protection)
     * @param gid Group ID
     * @param member Member to kick
     */
    function kickMember(uint256 gid, address member) external onlyGroupCreator(gid) {
        Group storage group = groups[gid];
        
        require(group.isMember[member], "Not a member");
        require(member != msg.sender, "Cannot kick yourself");
        
        group.isMember[member] = false;
        group.memberCount--;
        
        // Remove from members array
        for (uint i = 0; i < group.members.length; i++) {
            if (group.members[i] == member) {
                group.members[i] = group.members[group.members.length - 1];
                group.members.pop();
                break;
            }
        }

        emit Leave(gid, member);
    }

    /**
     * @dev Create a dispute
     * @param gid Group ID
     * @param defendant Address being disputed
     * @param reason Reason for dispute
     * @return disputeId The created dispute ID
     */
    function createDispute(
        uint256 gid,
        address defendant,
        string calldata reason
    ) external onlyGroupMember(gid) returns (uint256 disputeId) {
        require(groups[gid].isMember[defendant], "Defendant not a member");
        require(defendant != msg.sender, "Cannot dispute yourself");
        
        disputeId = disputeCount++;
        Dispute storage dispute = disputes[disputeId];
        
        dispute.groupId = gid;
        dispute.complainant = msg.sender;
        dispute.defendant = defendant;
        dispute.reason = reason;
        dispute.status = DisputeStatus.Active;
        dispute.createdAt = block.timestamp;
        
        groups[gid].groupDisputeCount++;

        emit DisputeCreated(disputeId, gid, msg.sender, defendant, reason);
    }

    /**
     * @dev Vote on a dispute
     * @param disputeId Dispute ID
     * @param support True to support complainant, false to support defendant
     */
    function voteOnDispute(uint256 disputeId, bool support) external {
        require(disputeId < disputeCount, "Dispute does not exist");
        
        Dispute storage dispute = disputes[disputeId];
        require(dispute.status == DisputeStatus.Active, "Dispute not active");
        require(!dispute.hasVoted[msg.sender], "Already voted");
        require(groups[dispute.groupId].isMember[msg.sender], "Not a group member");
        require(msg.sender != dispute.complainant && msg.sender != dispute.defendant, "Cannot vote on own dispute");
        
        dispute.hasVoted[msg.sender] = true;
        
        if (support) {
            dispute.votesFor++;
        } else {
            dispute.votesAgainst++;
        }

        emit DisputeVoted(disputeId, msg.sender, support);
    }

 
    function getDispute(uint256 disputeId) external view returns (
        uint256 groupId,
        address complainant,
        address defendant,
        string memory reason,
        uint8 status,
        uint256 createdAt,
        uint256 votesFor,
        uint256 votesAgainst
    ) {
        require(disputeId < disputeCount, "Dispute does not exist");
        
        Dispute storage dispute = disputes[disputeId];
        return (
            dispute.groupId,
            dispute.complainant,
            dispute.defendant,
            dispute.reason,
            uint8(dispute.status),
            dispute.createdAt,
            dispute.votesFor,
            dispute.votesAgainst
        );
    }

    /**
     * @dev Check if address has voted on dispute
     * @param disputeId Dispute ID
     * @param voter Voter address
     * @return True if has voted
     */
    function hasVotedOnDispute(uint256 disputeId, address voter) external view returns (bool) {
        require(disputeId < disputeCount, "Dispute does not exist");
        return disputes[disputeId].hasVoted[voter];
    }
}
