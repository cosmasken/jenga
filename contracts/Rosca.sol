// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    Enhanced ROSCA Contract with Group Joining and Dispute Resolution
    • ETH or ERC-20 support
    • Join existing groups before round starts
    • Dispute resolution system
    • Admin functions for group management
    • Payout distribution tracking
*/

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MiniROSCA is ReentrancyGuard {
    using SafeERC20 for IERC20;
    uint256 constant ROUND_DELAY = 12 hours;
    uint256 constant MAX_MEMBERS = 50;
    uint256 constant DISPUTE_PERIOD = 7 days;

    /* ---------------------------------------------------------- */
    enum DisputeStatus { None, Active, Resolved, Rejected }
    
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
        bool resolved;
    }

    struct Group {
        uint40  id;               // slot 0
        uint40  roundLength;      // seconds
        uint40  nextDue;          // timestamp
        address token;            // address(0) == ETH
        uint96  contribution;     // wei / token units
        uint8   currentRound;     // 1..members.length
        uint8   maxMembers;       // maximum allowed members
        bool    isActive;         // group is accepting new members
        address creator;          // group creator/admin
        address[] members;        // slot 1
        mapping(address => bool) isMember;
        mapping(address => bool) hasPaid;
        mapping(address => bool) hasBeenPaid;
        mapping(address => uint256) joinedRound; // track when member joined
        uint40  newRoundLength;   // slot 2
        uint40  changeActivates;  // 0 = nothing pending
        uint256 totalPaidOut;     // track total payouts
        uint256 disputeCount;     // number of disputes in this group
    }

    uint256 public groupCount;
    uint256 public disputeCount;
    mapping(uint256 => Group) public groups;
    mapping(uint256 => Dispute) public disputes;

    /* ---------------------------------------------------------- */
    event Created (uint256 indexed id, address indexed creator, address indexed token, uint256 contribution, uint256 roundLength, uint8 maxMembers);
    event Joined  (uint256 indexed id, address indexed member);
    event Contrib (uint256 indexed id, address indexed member, uint256 amount);
    event Payout  (uint256 indexed id, address indexed recipient, uint256 amount, uint8 round);
    event Leave   (uint256 indexed id, address indexed member);
    event RoundLenChangeScheduled(uint256 indexed id, uint256 newLength, uint256 activates);
    event GroupStatusChanged(uint256 indexed id, bool isActive);
    event DisputeCreated(uint256 indexed disputeId, uint256 indexed groupId, address indexed complainant, address defendant, string reason);
    event DisputeVoted(uint256 indexed disputeId, address indexed voter, bool support);
    event DisputeResolved(uint256 indexed disputeId, bool upheld);

    /* ---------------------------------------------------------- */
    modifier memberOf(uint256 gid) {
        require(groups[gid].isMember[msg.sender], "!member");
        _;
    }

    modifier onlyCreator(uint256 gid) {
        require(msg.sender == groups[gid].creator, "!creator");
        _;
    }

    modifier groupExists(uint256 gid) {
        require(gid > 0 && gid <= groupCount, "!exists");
        _;
    }

    /* ---------------------------------------------------------- */
    function createGroup(
        address _token,
        uint96  _contribution,
        uint40  _roundLength,
        uint8   _maxMembers
    ) external returns (uint256 gid) {
        require(_contribution > 0 && _roundLength > 0, "bad params");
        require(_maxMembers >= 2 && _maxMembers <= MAX_MEMBERS, "bad max members");

        gid = ++groupCount;
        Group storage g = groups[gid];
        g.id         = uint40(gid);
        g.token      = _token;
        g.contribution = _contribution;
        g.roundLength  = _roundLength;
        g.maxMembers   = _maxMembers;
        g.isActive     = true;
        g.creator      = msg.sender;
        g.nextDue      = uint40(block.timestamp + _roundLength);

        g.members.push(msg.sender);
        g.isMember[msg.sender] = true;
        g.joinedRound[msg.sender] = 1;

        emit Created(gid, msg.sender, _token, _contribution, _roundLength, _maxMembers);
    }

    /* ---------------------------------------------------------- */
    function joinGroup(uint256 gid) external payable groupExists(gid) nonReentrant {
        Group storage g = groups[gid];
        require(g.isActive, "!active");
        require(!g.isMember[msg.sender], "already member");
        require(g.members.length < g.maxMembers, "full");
        require(g.currentRound == 0, "round started"); // Can only join before first round

        // If it's an ETH group and first round hasn't started, collect contribution
        if (g.token == address(0) && g.currentRound == 0) {
            require(msg.value == g.contribution, "bad eth amount");
        } else if (g.token != address(0) && g.currentRound == 0) {
            IERC20(g.token).safeTransferFrom(msg.sender, address(this), g.contribution);
        }

        g.members.push(msg.sender);
        g.isMember[msg.sender] = true;
        g.joinedRound[msg.sender] = g.currentRound == 0 ? 1 : g.currentRound + 1;

        // If group is full, start the first round
        if (g.members.length == g.maxMembers) {
            g.isActive = false;
            g.currentRound = 1;
            // Mark all members as having paid for the first round if they paid to join
            for (uint i = 0; i < g.members.length; i++) {
                g.hasPaid[g.members[i]] = true;
            }
            emit GroupStatusChanged(gid, false);
        }

        emit Joined(gid, msg.sender);
    }

    /* ---------------------------------------------------------- */
    function contribute(uint256 gid) external payable memberOf(gid) nonReentrant {
        Group storage g = groups[gid];
        require(!g.hasPaid[msg.sender], "paid");
        require(block.timestamp <= g.nextDue, "late");
        require(g.currentRound > 0, "round not started");

        uint256 amt = g.contribution;
        if (g.token == address(0)) {
            require(msg.value == amt, "bad eth");
        } else {
            IERC20(g.token).safeTransferFrom(msg.sender, address(this), amt);
        }

        g.hasPaid[msg.sender] = true;
        emit Contrib(gid, msg.sender, amt);

        if (_allPaid(gid)) _nextRound(gid);
    }

    /* ---------------------------------------------------------- */
    function leaveGroup(uint256 gid) external memberOf(gid) {
        Group storage g = groups[gid];
        require(g.hasBeenPaid[msg.sender], "not paid");
        require(block.timestamp > g.nextDue, "round active");
        _removeMember(gid, msg.sender);
        emit Leave(gid, msg.sender);
    }

    /* ---------------------------------------------------------- */
    function scheduleRoundLength(uint256 gid, uint40 newLen) external onlyCreator(gid) {
        Group storage g = groups[gid];
        g.newRoundLength  = newLen;
        g.changeActivates = uint40(block.timestamp + ROUND_DELAY);
        emit RoundLenChangeScheduled(gid, newLen, g.changeActivates);
    }

    function rageQuit(uint256 gid) external memberOf(gid) {
        Group storage g = groups[gid];
        require(g.changeActivates != 0 && block.timestamp < g.changeActivates, "!window");
        _removeMember(gid, msg.sender);
        emit Leave(gid, msg.sender);
    }

    /* ---------------------------------------------------------- */
    // Group Management Functions
    function setGroupStatus(uint256 gid, bool _isActive) external onlyCreator(gid) {
        Group storage g = groups[gid];
        require(g.currentRound == 0, "round started");
        g.isActive = _isActive;
        emit GroupStatusChanged(gid, _isActive);
    }

    function kickMember(uint256 gid, address member) external onlyCreator(gid) {
        Group storage g = groups[gid];
        require(g.isMember[member], "!member");
        require(member != g.creator, "!kick creator");
        require(g.currentRound == 0, "round started");
        _removeMember(gid, member);
        emit Leave(gid, member);
    }

    /* ---------------------------------------------------------- */
    // Dispute Resolution System
    function createDispute(uint256 gid, address defendant, string calldata reason) 
        external memberOf(gid) returns (uint256 disputeId) {
        require(groups[gid].isMember[defendant], "defendant !member");
        require(msg.sender != defendant, "!self dispute");
        require(bytes(reason).length > 0, "!reason");

        disputeId = ++disputeCount;
        Dispute storage d = disputes[disputeId];
        d.groupId = gid;
        d.complainant = msg.sender;
        d.defendant = defendant;
        d.reason = reason;
        d.status = DisputeStatus.Active;
        d.createdAt = block.timestamp;

        groups[gid].disputeCount++;
        emit DisputeCreated(disputeId, gid, msg.sender, defendant, reason);
    }

    function voteOnDispute(uint256 disputeId, bool support) external {
        Dispute storage d = disputes[disputeId];
        require(d.status == DisputeStatus.Active, "!active");
        require(groups[d.groupId].isMember[msg.sender], "!member");
        require(!d.hasVoted[msg.sender], "voted");
        require(msg.sender != d.complainant && msg.sender != d.defendant, "!party vote");

        d.hasVoted[msg.sender] = true;
        if (support) {
            d.votesFor++;
        } else {
            d.votesAgainst++;
        }

        emit DisputeVoted(disputeId, msg.sender, support);

        // Auto-resolve if enough votes
        uint256 totalMembers = groups[d.groupId].members.length;
        uint256 requiredVotes = totalMembers / 2; // Simple majority
        
        if (d.votesFor >= requiredVotes) {
            _resolveDispute(disputeId, true);
        } else if (d.votesAgainst >= requiredVotes) {
            _resolveDispute(disputeId, false);
        }
    }

    function _resolveDispute(uint256 disputeId, bool upheld) internal {
        Dispute storage d = disputes[disputeId];
        d.status = upheld ? DisputeStatus.Resolved : DisputeStatus.Rejected;
        d.resolved = true;

        if (upheld) {
            // Remove defendant from group
            _removeMember(d.groupId, d.defendant);
        }

        emit DisputeResolved(disputeId, upheld);
    }

    /* ---------------------------------------------------------- */
    function _allPaid(uint256 gid) internal view returns (bool) {
        Group storage g = groups[gid];
        for (uint i = 0; i < g.members.length; i++) {
            if (!g.hasPaid[g.members[i]]) return false;
        }
        return true;
    }

    function _nextRound(uint256 gid) internal {
        Group storage g = groups[gid];
        uint256 payoutAmount = uint256(g.contribution) * g.members.length;
        address recipient = g.members[g.currentRound - 1];
        g.hasBeenPaid[recipient] = true;
        g.totalPaidOut += payoutAmount;

        if (g.token == address(0)) {
            (bool ok,) = recipient.call{value: payoutAmount}("");
            require(ok, "payout failed");
        } else {
            IERC20(g.token).safeTransfer(recipient, payoutAmount);
        }
        emit Payout(gid, recipient, payoutAmount, g.currentRound);

        g.currentRound++;
        if (g.currentRound > g.members.length) {
            // ROSCA completed
            g.isActive = false;
        } else {
            if (g.changeActivates != 0 && block.timestamp >= g.changeActivates) {
                g.roundLength = g.newRoundLength;
                g.changeActivates = 0;
            }
            g.nextDue = uint40(block.timestamp + g.roundLength);
            for (uint i = 0; i < g.members.length; i++) {
                g.hasPaid[g.members[i]] = false;
            }
        }
    }

    /* unordered remove, gas O(M) with M <= 50 */
    function _removeMember(uint256 gid, address member) internal {
        Group storage g = groups[gid];
        uint256 len = g.members.length;
        for (uint i = 0; i < len; i++) {
            if (g.members[i] == member) {
                g.members[i] = g.members[len - 1];
                g.members.pop();
                g.isMember[member] = false;
                return;
            }
        }
    }

    /* ---------------------------------------------------------- */
    // View Functions
    function getGroupMembers(uint256 gid) external view returns (address[] memory) {
        return groups[gid].members;
    }

    function getGroupDetails(uint256 gid) external view returns (
        uint40 id,
        uint40 roundLength,
        uint40 nextDue,
        address token,
        uint96 contribution,
        uint8 currentRound,
        uint8 maxMembers,
        bool isActive,
        address creator,
        uint256 memberCount,
        uint256 totalPaidOut,
        uint256 disputeCount
    ) {
        Group storage g = groups[gid];
        return (
            g.id,
            g.roundLength,
            g.nextDue,
            g.token,
            g.contribution,
            g.currentRound,
            g.maxMembers,
            g.isActive,
            g.creator,
            g.members.length,
            g.totalPaidOut,
            g.disputeCount
        );
    }

    function getDispute(uint256 disputeId) external view returns (
        uint256 groupId,
        address complainant,
        address defendant,
        string memory reason,
        DisputeStatus status,
        uint256 createdAt,
        uint256 votesFor,
        uint256 votesAgainst
    ) {
        Dispute storage d = disputes[disputeId];
        return (
            d.groupId,
            d.complainant,
            d.defendant,
            d.reason,
            d.status,
            d.createdAt,
            d.votesFor,
            d.votesAgainst
        );
    }

    function hasVotedOnDispute(uint256 disputeId, address voter) external view returns (bool) {
        return disputes[disputeId].hasVoted[voter];
    }

    /* ---------------------------------------------------------- */
    receive() external payable {}
}