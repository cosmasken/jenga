// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Jenga {
    struct Chama {
        string name;
        uint256 contributionAmount;
        uint256 cycleDuration; // in seconds
        uint256 maxMembers;
        address[] members;
        bool active;
        uint256 currentCycle;
        uint256 currentRecipientIndex;
        uint256 lastCycleTimestamp;
        uint256 totalPool; // Total accumulated funds
        bool[] membersPaid; // Track which members have received payout
        mapping(address => bool) isMember;
        mapping(address => uint256) memberIndex; // Member's position in rotation
        mapping(uint256 => uint256) cycleContributions; // Track contributions per cycle
        mapping(uint256 => address) cycleRecipient; // Track who received payout each cycle
        mapping(uint256 => bool) cycleCompleted; // Track if cycle payout was made
        mapping(address => uint256) memberCollateral; // Track member collateral deposits
        mapping(address => bool) collateralReturned; // Track if collateral was returned
        uint256 totalCollateral; // Total collateral held by chama
    }

    struct Contribution {
        address contributor;
        uint256 amount;
        uint256 timestamp;
    }

    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        uint256 timestamp;
    }

    struct Profile {
        address userAddress;
        string username;
        bytes32 emailHash;
    }

    struct RedEnvelope {
        address sender;
        address[] recipients;
        uint256 totalAmount;
        uint256[] amounts;
        bool isRandom;
        bool claimed;
    }

    // State variables
    uint256 public chamaCount;
    uint256 public redEnvelopeCount;
    
    mapping(uint256 => Chama) public chamas;
    mapping(uint256 => mapping(address => Contribution[])) public contributions;
    mapping(uint256 => mapping(address => bool)) public hasContributedThisCycle;
    mapping(uint256 => mapping(address => uint256)) public lastContributionTimestamp;
    mapping(address => uint256) public scores;
    mapping(address => string[]) public achievements;
    mapping(address => bytes32) public invitations;
    mapping(bytes32 => address) public inviteHashToAddress;
    mapping(address => Profile) public profiles;
    mapping(uint256 => Transaction[]) public transactions;
    mapping(uint256 => RedEnvelope) public redEnvelopes;

    // Events
    event ChamaCreated(uint256 chamaId, string name, address creator, uint256 contributionAmount);
    event ChamaJoined(uint256 chamaId, address member);
    event ChamaClosed(uint256 chamaId);
    event ChamaCycleCompleted(uint256 chamaId, uint256 cycleNumber);
    event ChamaCyclePayout(uint256 chamaId, address recipient, uint256 amount, uint256 cycleNumber);
    event ChamaContributionMissed(uint256 chamaId, address member, uint256 cycleNumber);
    event ContributionMade(uint256 chamaId, address user, uint256 amount);
    event P2PSent(address sender, address receiver, uint256 amount);
    event InviteGenerated(address user, bytes32 inviteHash);
    event InviteAccepted(address referrer, address newUser);
    event RedEnvelopeSent(uint256 envelopeId, address sender, uint256 amount);
    event RedEnvelopeClaimed(uint256 envelopeId, address recipient, uint256 amount);
    event AchievementUnlocked(address user, string achievement);
    event PayoutProcessed(uint256 chamaId, address recipient, uint256 amount, uint256 cycleNumber);
    event ChamaCompleted(uint256 chamaId);
    event CollateralDeposited(uint256 chamaId, address member, uint256 amount);
    event CollateralReturned(uint256 chamaId, address member, uint256 amount);
    event CollateralForfeited(uint256 chamaId, address member, uint256 amount);

    // Modifiers
    modifier onlyChamaMember(uint256 _chamaId) {
        require(chamas[_chamaId].isMember[msg.sender], "Not a chama member");
        _;
    }

    modifier chamaExists(uint256 _chamaId) {
        require(_chamaId > 0 && _chamaId <= chamaCount, "Chama does not exist");
        _;
    }

    modifier chamaActive(uint256 _chamaId) {
        require(chamas[_chamaId].active, "Chama is not active");
        _;
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
        Chama storage newChama = chamas[chamaCount];
        
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
        
        // Creator automatically joins with collateral
        newChama.members.push(msg.sender);
        newChama.isMember[msg.sender] = true;
        newChama.memberIndex[msg.sender] = 0;
        newChama.membersPaid = new bool[](_maxMembers);
        newChama.memberCollateral[msg.sender] = msg.value;
        newChama.collateralReturned[msg.sender] = false;
        
        scores[msg.sender] += 100;
        emit ChamaCreated(chamaCount, _name, msg.sender, _contributionAmount);
        emit ChamaJoined(chamaCount, msg.sender);
        emit CollateralDeposited(chamaCount, msg.sender, msg.value);
    }

    // Join an existing chama
    function joinChama(uint256 _chamaId) public payable chamaExists(_chamaId) chamaActive(_chamaId) {
        Chama storage chama = chamas[_chamaId];
        require(!chama.isMember[msg.sender], "Already a member");
        require(chama.members.length < chama.maxMembers, "Chama is full");
        require(chama.currentCycle == 0, "Cannot join after chama has started");
        require(msg.value >= chama.contributionAmount, "Must deposit collateral equal to contribution amount");
        
        uint256 memberIndex = chama.members.length;
        chama.members.push(msg.sender);
        chama.isMember[msg.sender] = true;
        chama.memberIndex[msg.sender] = memberIndex;
        chama.memberCollateral[msg.sender] = msg.value;
        chama.collateralReturned[msg.sender] = false;
        chama.totalCollateral += msg.value;
        
        scores[msg.sender] += 50;
        emit ChamaJoined(_chamaId, msg.sender);
        emit CollateralDeposited(_chamaId, msg.sender, msg.value);
        
        // Start the chama if it's full
        if (chama.members.length == chama.maxMembers) {
            _startChama(_chamaId);
        }
    }

    // Internal function to start a chama
    function _startChama(uint256 _chamaId) internal {
        Chama storage chama = chamas[_chamaId];
        chama.currentCycle = 1;
        chama.lastCycleTimestamp = block.timestamp;
        
        // Shuffle member order for fairness (simplified randomization)
        _shuffleMembers(_chamaId);
    }

    // Simple member shuffling for payout order
    function _shuffleMembers(uint256 _chamaId) internal {
        Chama storage chama = chamas[_chamaId];
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
        Chama storage chama = chamas[_chamaId];
        require(msg.value >= chama.contributionAmount, "Below min contribution");
        require(chama.currentCycle > 0, "Chama not started");
        
        // Check if member can contribute this cycle
        require(
            !hasContributedThisCycle[_chamaId][msg.sender],
            "Already contributed this cycle"
        );
        
        // Enforce cycle timing
        uint256 lastTime = lastContributionTimestamp[_chamaId][msg.sender];
        require(
            lastTime == 0 || block.timestamp >= lastTime + chama.cycleDuration,
            "Can only contribute once per cycle"
        );
        
        // Record contribution
        lastContributionTimestamp[_chamaId][msg.sender] = block.timestamp;
        contributions[_chamaId][msg.sender].push(Contribution(msg.sender, msg.value, block.timestamp));
        hasContributedThisCycle[_chamaId][msg.sender] = true;
        
        // Add to total pool
        chama.totalPool += msg.value;
        chama.cycleContributions[chama.currentCycle] += msg.value;
        
        // Update scores and achievements
        scores[msg.sender] += 10;
        if (contributions[_chamaId][msg.sender].length == 1) {
            achievements[msg.sender].push("First Stack");
            emit AchievementUnlocked(msg.sender, "First Stack");
        }
        if (contributions[_chamaId][msg.sender].length == 5) {
            achievements[msg.sender].push("5 Contributions");
            emit AchievementUnlocked(msg.sender, "5 Contributions");
        }
        
        emit ContributionMade(_chamaId, msg.sender, msg.value);
        
        // Check if cycle is complete (all members contributed)
        _checkCycleCompletion(_chamaId);
    }

    // Check if current cycle is complete and process payout
    function _checkCycleCompletion(uint256 _chamaId) internal {
        Chama storage chama = chamas[_chamaId];
        
        // Count contributions for current cycle
        uint256 contributionsThisCycle = 0;
        for (uint256 i = 0; i < chama.members.length; i++) {
            if (hasContributedThisCycle[_chamaId][chama.members[i]]) {
                contributionsThisCycle++;
            }
        }
        
        // If all members contributed, process payout
        if (contributionsThisCycle == chama.members.length) {
            _processCyclePayout(_chamaId);
        }
    }

    // Process payout for completed cycle
    function _processCyclePayout(uint256 _chamaId) internal {
        Chama storage chama = chamas[_chamaId];
        
        // Get current recipient
        address recipient = chama.members[chama.currentRecipientIndex];
        uint256 payoutAmount = chama.cycleContributions[chama.currentCycle];
        
        // Mark recipient as paid
        chama.membersPaid[chama.currentRecipientIndex] = true;
        chama.cycleRecipient[chama.currentCycle] = recipient;
        chama.cycleCompleted[chama.currentCycle] = true;
        
        // Transfer payout
        payable(recipient).transfer(payoutAmount);
        
        // Update recipient score
        scores[recipient] += 25;
        
        emit PayoutProcessed(_chamaId, recipient, payoutAmount, chama.currentCycle);
        emit ChamaCyclePayout(_chamaId, recipient, payoutAmount, chama.currentCycle);
        
        // Reset for next cycle
        _resetCycle(_chamaId);
        
        // Check if chama is complete
        if (chama.currentCycle > chama.members.length) {
            _completeChama(_chamaId);
        }
    }

    // Reset cycle state for next round
    function _resetCycle(uint256 _chamaId) internal {
        Chama storage chama = chamas[_chamaId];
        
        // Reset contribution flags
        for (uint256 i = 0; i < chama.members.length; i++) {
            hasContributedThisCycle[_chamaId][chama.members[i]] = false;
        }
        
        // Move to next cycle and recipient
        chama.currentCycle++;
        chama.currentRecipientIndex = (chama.currentRecipientIndex + 1) % chama.members.length;
        chama.lastCycleTimestamp = block.timestamp;
        chama.cycleContributions[chama.currentCycle] = 0;
        
        emit ChamaCycleCompleted(_chamaId, chama.currentCycle - 1);
    }

    // Complete chama when all members have received payout
    function _completeChama(uint256 _chamaId) internal {
        Chama storage chama = chamas[_chamaId];
        chama.active = false;
        
        // Return collateral to all members who completed the chama
        for (uint256 i = 0; i < chama.members.length; i++) {
            address member = chama.members[i];
            uint256 collateralAmount = chama.memberCollateral[member];
            
            if (collateralAmount > 0 && !chama.collateralReturned[member]) {
                chama.collateralReturned[member] = true;
                chama.totalCollateral -= collateralAmount;
                
                // Return collateral to member
                payable(member).transfer(collateralAmount);
                
                // Bonus scores for completion
                scores[member] += 100;
                achievements[member].push("Chama Completed");
                emit AchievementUnlocked(member, "Chama Completed");
                emit CollateralReturned(_chamaId, member, collateralAmount);
            }
        }
        
        emit ChamaCompleted(_chamaId);
    }

    // Emergency function to process missed contributions
    function processMissedContributions(uint256 _chamaId) public {
        Chama storage chama = chamas[_chamaId];
        require(chama.active, "Chama not active");
        require(block.timestamp >= chama.lastCycleTimestamp + chama.cycleDuration + 1 days, "Grace period not over");
        
        // Find members who missed contribution and forfeit their collateral
        for (uint256 i = 0; i < chama.members.length; i++) {
            address member = chama.members[i];
            if (!hasContributedThisCycle[_chamaId][member]) {
                // Penalize member
                if (scores[member] >= 20) {
                    scores[member] -= 20;
                }
                
                // Forfeit collateral for missed contribution
                uint256 collateralAmount = chama.memberCollateral[member];
                if (collateralAmount > 0 && !chama.collateralReturned[member]) {
                    chama.collateralReturned[member] = true; // Mark as processed
                    chama.totalCollateral -= collateralAmount;
                    
                    // Collateral is forfeited (stays in contract or distributed to other members)
                    // For now, we'll keep it in the contract as penalty
                    emit CollateralForfeited(_chamaId, member, collateralAmount);
                }
                
                emit ChamaContributionMissed(_chamaId, member, chama.currentCycle);
            }
        }
        
        // Force cycle completion with partial contributions
        _processCyclePayout(_chamaId);
    }

    // Get member's collateral amount
    function getMemberCollateral(uint256 _chamaId, address _member) public view returns (uint256) {
        return chamas[_chamaId].memberCollateral[_member];
    }

    // Check if member's collateral has been returned
    function isCollateralReturned(uint256 _chamaId, address _member) public view returns (bool) {
        return chamas[_chamaId].collateralReturned[_member];
    }

    // Get total collateral held by chama
    function getTotalCollateral(uint256 _chamaId) public view returns (uint256) {
        return chamas[_chamaId].totalCollateral;
    }

    // Get chama member list
    function getChamaMembers(uint256 _chamaId) public view returns (address[] memory) {
        return chamas[_chamaId].members;
    }

    // Get member's position in payout rotation
    function getMemberPayoutPosition(uint256 _chamaId, address _member) public view returns (uint256) {
        require(chamas[_chamaId].isMember[_member], "Not a member");
        return chamas[_chamaId].memberIndex[_member];
    }

    // Check if member has received payout
    function hasMemberReceivedPayout(uint256 _chamaId, address _member) public view returns (bool) {
        require(chamas[_chamaId].isMember[_member], "Not a member");
        uint256 memberIndex = chamas[_chamaId].memberIndex[_member];
        return chamas[_chamaId].membersPaid[memberIndex];
    }

    // Get cycle information
    function getCycleInfo(uint256 _chamaId, uint256 _cycle) public view returns (
        uint256 cycleContributions,
        address recipient,
        bool completed
    ) {
        Chama storage chama = chamas[_chamaId];
        return (
            chama.cycleContributions[_cycle],
            chama.cycleRecipient[_cycle],
            chama.cycleCompleted[_cycle]
        );
    }

    // Existing functions (P2P, Red Envelopes, etc.) remain the same...
    function sendP2P(address _receiver) public payable {
        transactions[chamaCount].push(Transaction(msg.sender, _receiver, msg.value, block.timestamp));
        payable(_receiver).transfer(msg.value);
        emit P2PSent(msg.sender, _receiver, msg.value);
    }

    function generateInvite(string memory _username, bytes32 _emailHash) public {
        require(invitations[msg.sender] == bytes32(0), "Invite already generated");
        invitations[msg.sender] = keccak256(abi.encodePacked(msg.sender, block.timestamp));
        inviteHashToAddress[invitations[msg.sender]] = msg.sender;
        profiles[msg.sender] = Profile(msg.sender, _username, _emailHash);
        emit InviteGenerated(msg.sender, invitations[msg.sender]);
    }

    function logInviteAcceptance(bytes32 _referrerHash) public {
        address referrer = findAddressByInviteHash(_referrerHash);
        require(referrer != address(0), "Invalid referrer");
        scores[referrer] += 50;
        uint256 inviteCount = 0;
        inviteCount++;
        if (inviteCount == 3) {
            achievements[referrer].push("Invited 3 Friends");
            emit AchievementUnlocked(referrer, "Invited 3 Friends");
        }
        emit InviteAccepted(referrer, msg.sender);
    }

    function findAddressByInviteHash(bytes32 _inviteHash) internal view returns(address) {
        return inviteHashToAddress[_inviteHash];
    }

    function sendRedEnvelope(address[] memory _recipients, uint256 _totalAmount, bool _isRandom, string memory /*_message*/) public payable {
        require(_recipients.length <= 10, "Max 10");
        require(msg.value == _totalAmount, "Incorrect amount");
        require(_totalAmount <= 0.01 ether, "Max 0.01 BTC");
        redEnvelopeCount++;
        uint256[] memory amounts = new uint256[](_recipients.length);
        if (_isRandom) {
            for (uint256 i = 0; i < _recipients.length; i++) {
                amounts[i] = _totalAmount / _recipients.length;
            }
        } else {
            uint256 equalAmount = _totalAmount / _recipients.length;
            for (uint256 i = 0; i < _recipients.length; i++) {
                amounts[i] = equalAmount;
            }
        }
        redEnvelopes[redEnvelopeCount] = RedEnvelope(msg.sender, _recipients, _totalAmount, amounts, _isRandom, false);
        scores[msg.sender] += 20;
        if (redEnvelopeCount >= 5) {
            achievements[msg.sender].push("Sent 5 Red Envelopes");
            emit AchievementUnlocked(msg.sender, "Sent 5 Red Envelopes");
        }
        emit RedEnvelopeSent(redEnvelopeCount, msg.sender, _totalAmount);
    }

    function claimRedEnvelope(uint256 _envelopeId) public {
        RedEnvelope storage envelope = redEnvelopes[_envelopeId];
        require(!envelope.claimed, "Already claimed");
        bool isRecipient = false;
        uint256 recipientIndex;
        for (uint256 i = 0; i < envelope.recipients.length; i++) {
            if (envelope.recipients[i] == msg.sender) {
                isRecipient = true;
                recipientIndex = i;
                break;
            }
        }
        require(isRecipient, "Not a recipient");
        uint256 amount = envelope.amounts[recipientIndex];
        envelope.claimed = true;
        payable(msg.sender).transfer(amount);
        emit RedEnvelopeClaimed(_envelopeId, msg.sender, amount);
    }
}
