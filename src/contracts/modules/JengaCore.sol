// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../libraries/JengaTypes.sol";

contract JengaCore {
    using JengaTypes for JengaTypes.Chama;

    // State variables
    mapping(uint256 => JengaTypes.Chama) public chamas;
    mapping(address => uint256) public scores;
    mapping(address => string[]) public achievements;
    mapping(uint256 => JengaTypes.Contribution[]) public contributions;
    mapping(address => uint256[]) public userChamas;
    mapping(address => mapping(uint256 => uint256)) public userContributions;
    mapping(address => mapping(uint256 => uint256)) public lastContributionTimestamp;
    mapping(address => mapping(uint256 => bool)) public hasContributedThisCycle;

    uint256 public chamaCount = 0;
    address public owner;

    // Events
    event ChamaCreated(uint256 chamaId, string name, address creator, uint256 contributionAmount);
    event ChamaJoined(uint256 chamaId, address member);
    event ChamaStarted(uint256 chamaId, address starter, uint256 timestamp);
    event ContributionMade(uint256 chamaId, address user, uint256 amount);
    event PayoutProcessed(uint256 chamaId, address recipient, uint256 amount, uint256 cycleNumber);
    event ChamaCycleCompleted(uint256 chamaId, uint256 cycleNumber);
    event ChamaCompleted(uint256 chamaId);
    event CollateralDeposited(uint256 chamaId, address member, uint256 amount);
    event CollateralReturned(uint256 chamaId, address member, uint256 amount);
    event CollateralForfeited(uint256 chamaId, address member, uint256 amount);
    event AchievementUnlocked(address user, string achievement);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier chamaExists(uint256 _chamaId) {
        require(_chamaId > 0 && _chamaId <= chamaCount, "Chama does not exist");
        _;
    }

    modifier chamaActive(uint256 _chamaId) {
        require(chamas[_chamaId].active, "Chama not active");
        _;
    }

    modifier onlyChamaMember(uint256 _chamaId) {
        require(chamas[_chamaId].isMember[msg.sender], "Not a chama member");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Create a new chama
    function createChama(
        string memory _name,
        uint256 _contributionAmount,
        uint256 _cycleDuration,
        uint256 _maxMembers
    ) public payable {
        require(_contributionAmount > 0, "Contribution must be > 0");
        require(_cycleDuration >= 7 days, "Cycle must be >= 7 days");
        require(_maxMembers >= 3 && _maxMembers <= 20, "Members: 3-20");
        require(msg.value >= _contributionAmount, "Must deposit collateral equal to contribution amount");

        chamaCount++;
        JengaTypes.Chama storage newChama = chamas[chamaCount];
        
        newChama.name = _name;
        newChama.contributionAmount = _contributionAmount;
        newChama.cycleDuration = _cycleDuration;
        newChama.maxMembers = _maxMembers;
        newChama.active = true;
        newChama.currentCycle = 0;
        newChama.currentRecipientIndex = 0;
        newChama.lastCycleTimestamp = block.timestamp;
        newChama.totalPool = 0;
        newChama.totalCollateral = msg.value;

        // Add creator as first member
        newChama.members.push(msg.sender);
        newChama.isMember[msg.sender] = true;
        newChama.memberIndex[msg.sender] = 0;
        newChama.membersPaid.push(false);
        newChama.memberCollateral[msg.sender] = msg.value;

        userChamas[msg.sender].push(chamaCount);
        scores[msg.sender] += 100; // Reward for creating chama

        emit ChamaCreated(chamaCount, _name, msg.sender, _contributionAmount);
        emit CollateralDeposited(chamaCount, msg.sender, msg.value);
    }

    // Join an existing chama
    function joinChama(uint256 _chamaId) public payable chamaExists(_chamaId) chamaActive(_chamaId) {
        JengaTypes.Chama storage chama = chamas[_chamaId];
        require(!chama.isMember[msg.sender], "Already a member");
        require(chama.members.length < chama.maxMembers, "Chama full");
        require(msg.value >= chama.contributionAmount, "Insufficient collateral");

        uint256 memberIndex = chama.members.length;
        chama.members.push(msg.sender);
        chama.isMember[msg.sender] = true;
        chama.memberIndex[msg.sender] = memberIndex;
        chama.membersPaid.push(false);
        chama.memberCollateral[msg.sender] = msg.value;
        chama.totalCollateral += msg.value;

        userChamas[msg.sender].push(_chamaId);
        scores[msg.sender] += 50; // Reward for joining chama

        emit ChamaJoined(_chamaId, msg.sender);
        emit CollateralDeposited(_chamaId, msg.sender, msg.value);

        // Auto-start if chama is full
        if (chama.members.length == chama.maxMembers) {
            _startChama(_chamaId);
        }
    }

    // Public function for creator to manually start chama (one-time only)
    function startChama(uint256 _chamaId) public chamaExists(_chamaId) chamaActive(_chamaId) {
        JengaTypes.Chama storage chama = chamas[_chamaId];
        require(chama.currentCycle == 0, "Chama already started");
        require(chama.isMember[msg.sender], "Only members can start");
        require(chama.members.length >= 3, "Need at least 3 members");

        _startChama(_chamaId);
    }

    // Internal function to start a chama
    function _startChama(uint256 _chamaId) internal {
        JengaTypes.Chama storage chama = chamas[_chamaId];
        chama.currentCycle = 1;
        chama.lastCycleTimestamp = block.timestamp;
        
        // Shuffle members for payout order
        _shuffleMembers(_chamaId);
        
        emit ChamaStarted(_chamaId, msg.sender, block.timestamp);
    }

    // Simple member shuffling for payout order
    function _shuffleMembers(uint256 _chamaId) internal {
        JengaTypes.Chama storage chama = chamas[_chamaId];
        uint256 length = chama.members.length;
        
        for (uint256 i = 0; i < length; i++) {
            uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, i))) % length;
            
            // Swap members
            address temp = chama.members[i];
            chama.members[i] = chama.members[randomIndex];
            chama.members[randomIndex] = temp;
            
            // Update member indices
            chama.memberIndex[chama.members[i]] = i;
            chama.memberIndex[chama.members[randomIndex]] = randomIndex;
        }
    }

    // Make a contribution (stack BTC)
    function stackBTC(uint256 _chamaId) public payable onlyChamaMember(_chamaId) chamaActive(_chamaId) {
        JengaTypes.Chama storage chama = chamas[_chamaId];
        require(msg.value >= chama.contributionAmount, "Below min contribution");
        require(chama.currentCycle > 0, "Chama not started");
        require(!hasContributedThisCycle[msg.sender][_chamaId], "Already contributed this cycle");

        // Check if enough time has passed since last cycle
        require(
            block.timestamp >= chama.lastCycleTimestamp + chama.cycleDuration || 
            chama.currentCycle == 1, 
            "Cycle not ready"
        );

        // Record contribution
        contributions[_chamaId].push(JengaTypes.Contribution({
            contributor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        userContributions[msg.sender][_chamaId] += msg.value;
        lastContributionTimestamp[msg.sender][_chamaId] = block.timestamp;
        hasContributedThisCycle[msg.sender][_chamaId] = true;
        
        chama.cycleContributions[chama.currentCycle] += msg.value;
        chama.totalPool += msg.value;
        
        scores[msg.sender] += 25; // Reward for contributing

        emit ContributionMade(_chamaId, msg.sender, msg.value);

        // Check if cycle is complete
        _checkCycleCompletion(_chamaId);
    }

    // Check if current cycle is complete and process payout
    function _checkCycleCompletion(uint256 _chamaId) internal {
        JengaTypes.Chama storage chama = chamas[_chamaId];
        
        // Count contributions for current cycle
        uint256 contributionsThisCycle = 0;
        for (uint256 i = 0; i < chama.members.length; i++) {
            if (hasContributedThisCycle[chama.members[i]][_chamaId]) {
                contributionsThisCycle++;
            }
        }
        
        // If all members have contributed, process payout
        if (contributionsThisCycle == chama.members.length) {
            _processCyclePayout(_chamaId);
        }
    }

    // Process payout for completed cycle
    function _processCyclePayout(uint256 _chamaId) internal {
        JengaTypes.Chama storage chama = chamas[_chamaId];
        
        // Calculate payout amount (all contributions for this cycle)
        uint256 payoutAmount = chama.cycleContributions[chama.currentCycle];
        
        // Get current recipient
        address recipient = chama.members[chama.currentRecipientIndex];
        
        // Mark recipient as paid
        chama.membersPaid[chama.currentRecipientIndex] = true;
        chama.cycleRecipient[chama.currentCycle] = recipient;
        chama.cycleCompleted[chama.currentCycle] = true;
        
        // Transfer payout
        payable(recipient).transfer(payoutAmount);
        
        emit PayoutProcessed(_chamaId, recipient, payoutAmount, chama.currentCycle);
        emit ChamaCycleCompleted(_chamaId, chama.currentCycle);
        
        // Check if chama is complete
        if (chama.currentRecipientIndex == chama.members.length - 1) {
            _completeChama(_chamaId);
        } else {
            _resetCycle(_chamaId);
        }
    }

    // Reset cycle state for next round
    function _resetCycle(uint256 _chamaId) internal {
        JengaTypes.Chama storage chama = chamas[_chamaId];
        
        // Move to next recipient
        chama.currentRecipientIndex++;
        chama.currentCycle++;
        chama.lastCycleTimestamp = block.timestamp;
        
        // Reset contribution flags for all members
        for (uint256 i = 0; i < chama.members.length; i++) {
            hasContributedThisCycle[chama.members[i]][_chamaId] = false;
        }
    }

    // Complete chama when all members have received payout
    function _completeChama(uint256 _chamaId) internal {
        JengaTypes.Chama storage chama = chamas[_chamaId];
        chama.active = false;
        
        // Return collateral to all members
        for (uint256 i = 0; i < chama.members.length; i++) {
            address member = chama.members[i];
            uint256 collateralAmount = chama.memberCollateral[member];
            
            if (collateralAmount > 0 && !chama.collateralReturned[member]) {
                chama.collateralReturned[member] = true;
                payable(member).transfer(collateralAmount);
                emit CollateralReturned(_chamaId, member, collateralAmount);
            }
        }
        
        emit ChamaCompleted(_chamaId);
    }

    // Emergency payout function
    function emergencyPayout(uint256 _chamaId, address _recipient) public {
        JengaTypes.Chama storage chama = chamas[_chamaId];
        require(!chama.active, "Chama still active");
        require(chama.isMember[_recipient], "Not a member");
        
        uint256 memberIndex = chama.memberIndex[_recipient];
        require(!chama.membersPaid[memberIndex], "Already paid");
        
        uint256 payoutAmount = chama.contributionAmount * chama.members.length;
        chama.membersPaid[memberIndex] = true;
        payable(_recipient).transfer(payoutAmount);
        
        emit PayoutProcessed(_chamaId, _recipient, payoutAmount, memberIndex + 1);
    }

    // Emergency function to process missed contributions
    function processMissedContributions(uint256 _chamaId) public {
        JengaTypes.Chama storage chama = chamas[_chamaId];
        require(chama.active, "Chama not active");
        require(chama.currentCycle > 0, "Chama not started");
        
        // Check if cycle duration has passed
        require(block.timestamp >= chama.lastCycleTimestamp + chama.cycleDuration, "Cycle not expired");
        
        // Find members who haven't contributed
        for (uint256 i = 0; i < chama.members.length; i++) {
            address member = chama.members[i];
            if (!hasContributedThisCycle[member][_chamaId]) {
                // Forfeit their collateral
                uint256 collateralAmount = chama.memberCollateral[member];
                if (collateralAmount > 0) {
                    chama.memberCollateral[member] = 0;
                    // Add to current cycle contributions
                    chama.cycleContributions[chama.currentCycle] += collateralAmount;
                    emit CollateralForfeited(_chamaId, member, collateralAmount);
                }
            }
        }
        
        // Process payout with available funds
        _processCyclePayout(_chamaId);
    }

    // View functions
    function getChamaInfo(uint256 _chamaId) public view returns (
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
        JengaTypes.Chama storage chama = chamas[_chamaId];
        return (
            chama.name,
            chama.contributionAmount,
            chama.cycleDuration,
            chama.maxMembers,
            chama.active,
            chama.currentCycle,
            chama.currentRecipientIndex,
            chama.lastCycleTimestamp,
            chama.totalPool,
            chama.totalCollateral
        );
    }

    function getChamaMembers(uint256 _chamaId) public view returns (address[] memory) {
        return chamas[_chamaId].members;
    }

    function getMemberCollateral(uint256 _chamaId, address _member) public view returns (uint256) {
        return chamas[_chamaId].memberCollateral[_member];
    }

    function isCollateralReturned(uint256 _chamaId, address _member) public view returns (bool) {
        return chamas[_chamaId].collateralReturned[_member];
    }

    function getTotalCollateral(uint256 _chamaId) public view returns (uint256) {
        return chamas[_chamaId].totalCollateral;
    }

    function getMemberPayoutPosition(uint256 _chamaId, address _member) public view returns (uint256) {
        require(chamas[_chamaId].isMember[_member], "Not a member");
        return chamas[_chamaId].memberIndex[_member];
    }

    function hasMemberReceivedPayout(uint256 _chamaId, address _member) public view returns (bool) {
        require(chamas[_chamaId].isMember[_member], "Not a member");
        uint256 memberIndex = chamas[_chamaId].memberIndex[_member];
        return chamas[_chamaId].membersPaid[memberIndex];
    }

    function getCycleInfo(uint256 _chamaId, uint256 _cycle) public view returns (
        uint256 cycleContributions,
        address recipient,
        bool completed
    ) {
        JengaTypes.Chama storage chama = chamas[_chamaId];
        return (
            chama.cycleContributions[_cycle],
            chama.cycleRecipient[_cycle],
            chama.cycleCompleted[_cycle]
        );
    }

    function isChamaMember(uint256 _chamaId, address _user) public view returns (bool) {
        return chamas[_chamaId].isMember[_user];
    }

    function getUserScore(address _user) public view returns (uint256) {
        return scores[_user];
    }

    function updateUserScore(address _user, uint256 _points) external onlyOwner {
        scores[_user] += _points;
    }
}