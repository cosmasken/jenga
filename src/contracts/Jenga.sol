// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Jenga {



// --- Modifiers ---
modifier onlyChamaMember(uint256 chamaId) {
    bool isMember = false;
    for (uint256 i = 0; i < chamas[chamaId].members.length; i++) {
        if (chamas[chamaId].members[i] == msg.sender) {
            isMember = true;
            break;
        }
    }
    require(isMember, "Not a member of this chama");
    _;
}

// --- State for stacking cycles ---
// Tracks last time a member contributed to a chama
mapping(uint256 => mapping(address => uint256)) public lastContributionTimestamp;
// Tracks if a member has contributed in the current cycle
mapping(uint256 => mapping(address => bool)) public hasContributedThisCycle;

struct Contribution {
    address user;
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
    address user;
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

struct Chama {
    string name;
    uint256 contributionAmount;
    uint256 cycleDuration;
    uint256 maxMembers;
    address[] members;
    bool active;
    uint256 currentCycle;
    uint256 currentRecipientIndex;
    uint256 lastCycleTimestamp;
}

mapping(uint256 => Chama) public chamas;
mapping(uint256 => mapping(address => Contribution[])) public contributions;
mapping(uint256 => Transaction[]) public transactions;
mapping(address => Profile) public profiles;
mapping(address => bytes32) public invitations;
mapping(bytes32 => address) public inviteHashToAddress;
mapping(address => uint256) public scores;
mapping(address => string[]) public achievements;
mapping(uint256 => RedEnvelope) public redEnvelopes;
uint256 public chamaCount;
uint256 public redEnvelopeCount;

event ChamaCreated(uint256 chamaId, string name, address creator);
event ChamaJoined(uint256 chamaId, address member);
event ChamaMemberRemoved(uint256 chamaId, address member);
event ChamaClosed(uint256 chamaId);
event ChamaCycleCompleted(uint256 chamaId, uint256 cycleNumber);
event ChamaCyclePayout(uint256 chamaId, address recipient, uint256 amount, uint256 cycleNumber);
event ChamaContributionMissed(uint256 chamaId, address member, uint256 cycleNumber);
event ContributionMade(uint256 chamaId, address user, uint256 amount);
event P2PSent(address sender, address receiver, uint256 amount);
event InviteGenerated(address user, bytes32 inviteHash);
event InviteAccepted(address referrer, address newUser);
event AchievementUnlocked(address user, string achievement);
event RedEnvelopeSent(uint256 envelopeId, address sender, uint256 totalAmount);
event RedEnvelopeClaimed(uint256 envelopeId, address recipient, uint256 amount);

function createChama(string memory _name, uint256 _contributionAmount, uint256 _cycleDuration, uint256 _maxMembers) public {
    chamaCount++;
    chamas[chamaCount] = Chama(_name, _contributionAmount, _cycleDuration, _maxMembers, new address[](0), true, 0, 0, 0);
    chamas[chamaCount].members.push(msg.sender);
    profiles[msg.sender].user = msg.sender;
    emit ChamaCreated(chamaCount, _name, msg.sender);
}

function joinChama(uint256 _chamaId) public {
    require(chamas[_chamaId].active, "Chama closed");
    require(chamas[_chamaId].members.length < chamas[_chamaId].maxMembers, "Chama full");
    chamas[_chamaId].members.push(msg.sender);
    emit ChamaJoined(_chamaId, msg.sender);
}

function stackBTC(uint256 _chamaId) public payable onlyChamaMember(_chamaId) {
    require(msg.value >= chamas[_chamaId].contributionAmount, "Below min contribution");
    require(chamas[_chamaId].active, "Chama closed");
    // Enforce cycle logic: only one contribution per cycleDuration
    uint256 lastTime = lastContributionTimestamp[_chamaId][msg.sender];
    require(
        lastTime == 0 || block.timestamp >= lastTime + chamas[_chamaId].cycleDuration,
        "Can only contribute once per cycle"
    );
    lastContributionTimestamp[_chamaId][msg.sender] = block.timestamp;

    contributions[_chamaId][msg.sender].push(Contribution(msg.sender, msg.value, block.timestamp));
    hasContributedThisCycle[_chamaId][msg.sender] = true;
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
}

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
    // Logic to track invite count per user
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
        // Simplified random split logic
        for (uint256 i = 0; i < _recipients.length; i++) {
            amounts[i] = _totalAmount / _recipients.length; // Simplified for MVP
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

} // end of contract Jenga