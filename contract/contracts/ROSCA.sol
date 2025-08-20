// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ROSCA
 * @dev Enhanced ROSCA with deposits, better round management, and penalties - Native Token Only
 */
contract ROSCA is ReentrancyGuard, Ownable {

    enum ROSCAStatus { 
        RECRUITING,     // Accepting new members
        WAITING,        // All members joined, waiting for start
        ACTIVE,         // Running rounds
        COMPLETED,      // All rounds finished
        CANCELLED       // ROSCA cancelled
    }
    
    struct Member {
        bool isActive;
        uint256 joinTimestamp;
        uint256 depositAmount;      // Security deposit
        uint256 totalContributions;
        uint256 roundsPaid;
        uint256 missedRounds;       // Track missed payments
        bool hasReceivedPayout;
        uint256 payoutRound;
    }
    
    struct Round {
        uint256 roundNumber;
        uint256 startTime;
        uint256 deadline;
        address winner;
        uint256 totalPot;
        uint256 contributionsReceived;
        bool isCompleted;
        mapping(address => bool) hasContributed;
    }

    // Configuration (Native Token Only)
    uint256 public contributionAmount;
    uint256 public roundDuration;
    uint256 public maxMembers;
    uint256 public depositMultiplier = 2; // Deposit = 2x contribution amount
    uint256 public gracePeriod = 2 days;  // Grace period before auto-start
    uint256 public maxMissedRounds = 2;   // Max missed rounds before penalty
    
    // State
    bool private _initialized;
    ROSCAStatus public status = ROSCAStatus.RECRUITING;
    uint256 public currentRound = 0;
    uint256 public totalMembers = 0;
    uint256 public totalRounds = 0;
    uint256 public recruitmentCompleteTime; // When all members joined
    
    // Members and rounds
    address[] public membersList;
    mapping(address => Member) public members;
    mapping(uint256 => Round) public rounds;
    address[] public payoutOrder;
    uint256 public nextPayoutIndex = 0;

    // Events
    event MemberJoined(address indexed member, uint256 timestamp, uint256 depositAmount);
    event RecruitmentComplete(uint256 timestamp, uint256 gracePeriodEnd);
    event ROSCAStarted(uint256 timestamp);
    event RoundStarted(uint256 indexed roundNumber, uint256 deadline, address indexed winner);
    event ContributionMade(address indexed member, uint256 indexed roundNumber, uint256 amount);
    event RoundCompleted(uint256 indexed roundNumber, address indexed winner, uint256 payout);
    event MemberPenalized(address indexed member, uint256 penaltyAmount, string reason);
    event ROSCACompleted(uint256 timestamp);
    event ROSCACancelled(string reason);

    modifier onlyMember() {
        require(members[msg.sender].isActive, "Not an active member");
        _;
    }
    
    modifier whenStatus(ROSCAStatus _status) {
        require(status == _status, "Invalid ROSCA status");
        _;
    }

    constructor(
        uint256 _contributionAmount,
        uint256 _roundDuration,
        uint256 _maxMembers,
        address _creator
    ) Ownable(_creator) {
        require(_maxMembers >= 2, "Need at least 2 members");
        require(_contributionAmount > 0, "Contribution must be > 0");
        require(_roundDuration >= 1 days, "Round too short");
        require(_creator != address(0), "Creator cannot be zero address");
        
        contributionAmount = _contributionAmount;
        roundDuration = _roundDuration;
        maxMembers = _maxMembers;
        totalRounds = _maxMembers;
        
        // Always add creator as the first member
        _addMember(_creator);
        // Creator's deposit will be handled when they call joinROSCA or set during factory deployment
        _initialized = true;
    }
    

    /**
     * @dev Join ROSCA with required security deposit
     */
    function joinROSCA() external payable nonReentrant whenStatus(ROSCAStatus.RECRUITING) {
        uint256 requiredDeposit = contributionAmount * depositMultiplier;
        require(msg.value == requiredDeposit, "Incorrect deposit amount");
        
        if (members[msg.sender].isActive) {
            // Creator paying their deposit
            require(members[msg.sender].depositAmount == 0, "Deposit already paid");
            members[msg.sender].depositAmount = requiredDeposit;
        } else {
            // New member joining
            require(totalMembers < maxMembers, "ROSCA is full");
            _addMember(msg.sender);
            members[msg.sender].depositAmount = requiredDeposit;
        }
        
        emit MemberJoined(msg.sender, block.timestamp, requiredDeposit);
        
        // Check if recruitment is complete
        if (totalMembers == maxMembers) {
            status = ROSCAStatus.WAITING;
            recruitmentCompleteTime = block.timestamp;
            emit RecruitmentComplete(block.timestamp, block.timestamp + gracePeriod);
        }
    }
    
    function _addMember(address _member) private {        
        members[_member] = Member({
            isActive: true,
            joinTimestamp: block.timestamp,
            depositAmount: 0,
            totalContributions: 0,
            roundsPaid: 0,
            missedRounds: 0,
            hasReceivedPayout: false,
            payoutRound: 0
        });
        
        membersList.push(_member);
        payoutOrder.push(_member);
        totalMembers++;
    }

    /**
     * @dev Start ROSCA after grace period
     */
    function startROSCA() external whenStatus(ROSCAStatus.WAITING) {
        require(block.timestamp >= recruitmentCompleteTime + gracePeriod, "Grace period not over");
        require(totalMembers >= 2, "Need at least 2 members");
        
        status = ROSCAStatus.ACTIVE;
        currentRound = 1;
        _initializeRound(currentRound);
        
        emit ROSCAStarted(block.timestamp);
    }
    
    /**
     * @dev Force start by owner (emergency)
     */
    function forceStart() external onlyOwner whenStatus(ROSCAStatus.WAITING) {
        require(totalMembers >= 2, "Need at least 2 members");
        
        status = ROSCAStatus.ACTIVE;
        currentRound = 1;
        _initializeRound(currentRound);
        
        emit ROSCAStarted(block.timestamp);
    }

    function _initializeRound(uint256 roundNumber) private {
        Round storage round = rounds[roundNumber];
        round.roundNumber = roundNumber;
        round.startTime = block.timestamp;
        round.deadline = block.timestamp + roundDuration;
        round.winner = _selectNextWinner();
        
        emit RoundStarted(roundNumber, round.deadline, round.winner);
    }

    function contribute() external payable nonReentrant onlyMember whenStatus(ROSCAStatus.ACTIVE) {
        require(currentRound > 0, "No active round");
        
        Round storage round = rounds[currentRound];
        require(!round.isCompleted, "Round already completed");
        require(!round.hasContributed[msg.sender], "Already contributed this round");
        require(block.timestamp <= round.deadline, "Round deadline passed");
        
        require(msg.value == contributionAmount, "Incorrect payment amount");
        
        // Update state
        round.hasContributed[msg.sender] = true;
        round.contributionsReceived++;
        round.totalPot += contributionAmount;
        
        members[msg.sender].totalContributions += contributionAmount;
        members[msg.sender].roundsPaid++;
        
        emit ContributionMade(msg.sender, currentRound, contributionAmount);
        
        // Auto-complete if everyone paid
        if (round.contributionsReceived == totalMembers) {
            _completeRound();
        }
    }

    /**
     * @dev Complete round after deadline (with penalties)
     */
    function completeRound() external whenStatus(ROSCAStatus.ACTIVE) {
        require(currentRound > 0, "No active round");
        require(block.timestamp > rounds[currentRound].deadline, "Round deadline not passed");
        
        _processNonContributors();
        _completeRound();
    }

    function _processNonContributors() private {
        Round storage round = rounds[currentRound];
        
        for (uint256 i = 0; i < membersList.length; i++) {
            address member = membersList[i];
            if (members[member].isActive && !round.hasContributed[member]) {
                members[member].missedRounds++;
                
                // Apply penalty for excessive missed rounds
                if (members[member].missedRounds > maxMissedRounds) {
                    uint256 penalty = contributionAmount;
                    if (members[member].depositAmount >= penalty) {
                        members[member].depositAmount -= penalty;
                        round.totalPot += penalty; // Add penalty to pot
                        
                        emit MemberPenalized(member, penalty, "Excessive missed contributions");
                    }
                }
            }
        }
    }

    function _completeRound() private {
        Round storage round = rounds[currentRound];
        require(!round.isCompleted, "Round already completed");
        
        address winner = round.winner;
        uint256 payout = round.totalPot;
        
        // Pay out winner (Native ETH)
        (bool success,) = winner.call{value: payout}("");
        require(success, "Payout failed");
        
        members[winner].hasReceivedPayout = true;
        members[winner].payoutRound = currentRound;
        round.isCompleted = true;
        
        emit RoundCompleted(currentRound, winner, payout);
        
        // Progress to next round or complete ROSCA
        if (currentRound >= totalRounds) {
            _completeROSCA();
        } else {
            currentRound++;
            _initializeRound(currentRound);
        }
    }

    function _completeROSCA() private {
        status = ROSCAStatus.COMPLETED;
        
        // Refund remaining deposits to active members (Native ETH)
        for (uint256 i = 0; i < membersList.length; i++) {
            address member = membersList[i];
            if (members[member].isActive && members[member].depositAmount > 0) {
                uint256 refund = members[member].depositAmount;
                members[member].depositAmount = 0;
                
                (bool success,) = member.call{value: refund}("");
                require(success, "Refund failed");
            }
        }
        
        emit ROSCACompleted(block.timestamp);
    }

    function _selectNextWinner() private returns (address) {
        while (nextPayoutIndex < payoutOrder.length) {
            address candidate = payoutOrder[nextPayoutIndex];
            nextPayoutIndex++;
            
            if (members[candidate].isActive && !members[candidate].hasReceivedPayout) {
                return candidate;
            }
        }
        
        revert("No eligible winner found");
    }

    // View functions
    function getTimeUntilStart() external view returns (uint256) {
        if (status != ROSCAStatus.WAITING) return 0;
        uint256 startTime = recruitmentCompleteTime + gracePeriod;
        if (block.timestamp >= startTime) return 0;
        return startTime - block.timestamp;
    }

    function getTimeUntilRoundEnd() external view returns (uint256) {
        if (status != ROSCAStatus.ACTIVE || currentRound == 0) return 0;
        uint256 deadline = rounds[currentRound].deadline;
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }

    function getRequiredDeposit() external view returns (uint256) {
        return contributionAmount * depositMultiplier;
    }

    function getRoundInfo(uint256 roundNumber) external view returns (
        uint256 startTime,
        uint256 deadline,
        address winner,
        uint256 totalPot,
        uint256 contributionsReceived,
        bool isCompleted
    ) {
        Round storage round = rounds[roundNumber];
        return (
            round.startTime,
            round.deadline,
            round.winner,
            round.totalPot,
            round.contributionsReceived,
            round.isCompleted
        );
    }

    // Emergency functions
    function cancelROSCA(string calldata reason) external onlyOwner {
        require(status != ROSCAStatus.COMPLETED, "ROSCA already completed");
        status = ROSCAStatus.CANCELLED;
        emit ROSCACancelled(reason);
    }
    
    receive() external payable {}
}
