// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../libraries/JengaTypes.sol";

contract RedEnvelopeSystem {
    using JengaTypes for JengaTypes.RedEnvelope;

    // State variables
    mapping(uint256 => JengaTypes.RedEnvelope) public redEnvelopes;
    mapping(address => uint256[]) public userSentEnvelopes;
    mapping(address => uint256[]) public userReceivedEnvelopes;
    mapping(uint256 => mapping(address => bool)) public hasClaimedEnvelope;
    mapping(uint256 => mapping(address => uint256)) public claimedAmounts;
    
    uint256 public envelopeCount = 0;
    address public owner;
    address public jengaCore;
    uint256 public maxRecipients = 20;
    uint256 public minAmount = 0.0001 ether;

    // Events
    event RedEnvelopeSent(
        uint256 indexed envelopeId, 
        address indexed sender, 
        uint256 totalAmount, 
        uint256 recipientCount,
        bool isRandom
    );
    event RedEnvelopeClaimed(
        uint256 indexed envelopeId, 
        address indexed recipient, 
        uint256 amount
    );
    event RedEnvelopeExpired(uint256 indexed envelopeId);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier validEnvelope(uint256 _envelopeId) {
        require(_envelopeId > 0 && _envelopeId <= envelopeCount, "Invalid envelope ID");
        require(!redEnvelopes[_envelopeId].claimed, "Envelope already fully claimed");
        _;
    }

    modifier canClaim(uint256 _envelopeId) {
        require(!hasClaimedEnvelope[_envelopeId][msg.sender], "Already claimed");
        require(_isRecipient(_envelopeId, msg.sender), "Not a recipient");
        _;
    }

    constructor(address _jengaCore) {
        owner = msg.sender;
        jengaCore = _jengaCore;
    }

    // Send red envelope
    function sendRedEnvelope(
        address[] memory _recipients,
        uint256 _totalAmount,
        bool _isRandom,
        string memory _message
    ) public payable {
        require(_recipients.length > 0, "No recipients");
        require(_recipients.length <= maxRecipients, "Too many recipients");
        require(msg.value == _totalAmount, "Incorrect amount sent");
        require(_totalAmount >= minAmount, "Amount too small");
        
        // Validate recipients
        for (uint256 i = 0; i < _recipients.length; i++) {
            require(_recipients[i] != address(0), "Invalid recipient");
            require(_recipients[i] != msg.sender, "Cannot send to yourself");
            
            // Check for duplicates
            for (uint256 j = i + 1; j < _recipients.length; j++) {
                require(_recipients[i] != _recipients[j], "Duplicate recipient");
            }
        }
        
        envelopeCount++;
        
        // Calculate amounts
        uint256[] memory amounts = new uint256[](_recipients.length);
        if (_isRandom) {
            amounts = _calculateRandomAmounts(_totalAmount, _recipients.length);
        } else {
            uint256 equalAmount = _totalAmount / _recipients.length;
            for (uint256 i = 0; i < _recipients.length; i++) {
                amounts[i] = equalAmount;
            }
        }
        
        // Create red envelope
        redEnvelopes[envelopeCount] = JengaTypes.RedEnvelope({
            sender: msg.sender,
            recipients: _recipients,
            totalAmount: _totalAmount,
            amounts: amounts,
            claimed: false,
            timestamp: block.timestamp
        });
        
        // Update user records
        userSentEnvelopes[msg.sender].push(envelopeCount);
        for (uint256 i = 0; i < _recipients.length; i++) {
            userReceivedEnvelopes[_recipients[i]].push(envelopeCount);
        }
        
        emit RedEnvelopeSent(envelopeCount, msg.sender, _totalAmount, _recipients.length, _isRandom);
    }

    // Claim red envelope
    function claimRedEnvelope(uint256 _envelopeId) 
        public 
        validEnvelope(_envelopeId) 
        canClaim(_envelopeId) 
    {
        JengaTypes.RedEnvelope storage envelope = redEnvelopes[_envelopeId];
        
        // Find recipient index and amount
        uint256 recipientIndex = _findRecipientIndex(_envelopeId, msg.sender);
        uint256 claimAmount = envelope.amounts[recipientIndex];
        
        // Mark as claimed
        hasClaimedEnvelope[_envelopeId][msg.sender] = true;
        claimedAmounts[_envelopeId][msg.sender] = claimAmount;
        
        // Check if all recipients have claimed
        bool allClaimed = true;
        for (uint256 i = 0; i < envelope.recipients.length; i++) {
            if (!hasClaimedEnvelope[_envelopeId][envelope.recipients[i]]) {
                allClaimed = false;
                break;
            }
        }
        
        if (allClaimed) {
            envelope.claimed = true;
        }
        
        // Transfer amount
        payable(msg.sender).transfer(claimAmount);
        
        emit RedEnvelopeClaimed(_envelopeId, msg.sender, claimAmount);
    }

    // Batch claim multiple envelopes
    function batchClaimRedEnvelopes(uint256[] memory _envelopeIds) public {
        require(_envelopeIds.length <= 10, "Max 10 envelopes per batch");
        
        for (uint256 i = 0; i < _envelopeIds.length; i++) {
            uint256 envelopeId = _envelopeIds[i];
            
            // Check if can claim
            if (envelopeId > 0 && 
                envelopeId <= envelopeCount && 
                !redEnvelopes[envelopeId].claimed &&
                !hasClaimedEnvelope[envelopeId][msg.sender] &&
                _isRecipient(envelopeId, msg.sender)) {
                
                claimRedEnvelope(envelopeId);
            }
        }
    }

    // Reclaim unclaimed envelope (sender only, after 30 days)
    function reclaimRedEnvelope(uint256 _envelopeId) public validEnvelope(_envelopeId) {
        JengaTypes.RedEnvelope storage envelope = redEnvelopes[_envelopeId];
        require(envelope.sender == msg.sender, "Not the sender");
        require(block.timestamp >= envelope.timestamp + 30 days, "Too early to reclaim");
        
        // Calculate unclaimed amount
        uint256 unclaimedAmount = 0;
        for (uint256 i = 0; i < envelope.recipients.length; i++) {
            if (!hasClaimedEnvelope[_envelopeId][envelope.recipients[i]]) {
                unclaimedAmount += envelope.amounts[i];
            }
        }
        
        require(unclaimedAmount > 0, "Nothing to reclaim");
        
        // Mark as claimed to prevent further claims
        envelope.claimed = true;
        
        // Transfer unclaimed amount back to sender
        payable(msg.sender).transfer(unclaimedAmount);
        
        emit RedEnvelopeExpired(_envelopeId);
    }

    // View functions
    function getRedEnvelopeDetails(uint256 _envelopeId) public view returns (
        address sender,
        address[] memory recipients,
        uint256 totalAmount,
        uint256[] memory amounts,
        bool claimed,
        uint256 timestamp,
        uint256 claimedCount
    ) {
        JengaTypes.RedEnvelope memory envelope = redEnvelopes[_envelopeId];
        
        uint256 claimedCount_ = 0;
        for (uint256 i = 0; i < envelope.recipients.length; i++) {
            if (hasClaimedEnvelope[_envelopeId][envelope.recipients[i]]) {
                claimedCount_++;
            }
        }
        
        return (
            envelope.sender,
            envelope.recipients,
            envelope.totalAmount,
            envelope.amounts,
            envelope.claimed,
            envelope.timestamp,
            claimedCount_
        );
    }

    function getUserSentEnvelopes(address _user) public view returns (uint256[] memory) {
        return userSentEnvelopes[_user];
    }

    function getUserReceivedEnvelopes(address _user) public view returns (uint256[] memory) {
        return userReceivedEnvelopes[_user];
    }

    function getUserClaimableEnvelopes(address _user) public view returns (uint256[] memory) {
        uint256[] memory receivedEnvelopes = userReceivedEnvelopes[_user];
        uint256 claimableCount = 0;
        
        // Count claimable envelopes
        for (uint256 i = 0; i < receivedEnvelopes.length; i++) {
            uint256 envelopeId = receivedEnvelopes[i];
            if (!redEnvelopes[envelopeId].claimed && 
                !hasClaimedEnvelope[envelopeId][_user]) {
                claimableCount++;
            }
        }
        
        // Create claimable array
        uint256[] memory claimableEnvelopes = new uint256[](claimableCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < receivedEnvelopes.length; i++) {
            uint256 envelopeId = receivedEnvelopes[i];
            if (!redEnvelopes[envelopeId].claimed && 
                !hasClaimedEnvelope[envelopeId][_user]) {
                claimableEnvelopes[index] = envelopeId;
                index++;
            }
        }
        
        return claimableEnvelopes;
    }

    function getClaimedAmount(uint256 _envelopeId, address _user) public view returns (uint256) {
        return claimedAmounts[_envelopeId][_user];
    }

    function hasUserClaimed(uint256 _envelopeId, address _user) public view returns (bool) {
        return hasClaimedEnvelope[_envelopeId][_user];
    }

    // Internal functions
    function _isRecipient(uint256 _envelopeId, address _user) internal view returns (bool) {
        address[] memory recipients = redEnvelopes[_envelopeId].recipients;
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == _user) {
                return true;
            }
        }
        return false;
    }

    function _findRecipientIndex(uint256 _envelopeId, address _user) internal view returns (uint256) {
        address[] memory recipients = redEnvelopes[_envelopeId].recipients;
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == _user) {
                return i;
            }
        }
        revert("Recipient not found");
    }

    function _calculateRandomAmounts(uint256 _totalAmount, uint256 _recipientCount) internal view returns (uint256[] memory) {
        uint256[] memory amounts = new uint256[](_recipientCount);
        uint256 remaining = _totalAmount;
        
        // Generate random amounts ensuring everyone gets something
        uint256 minPerRecipient = _totalAmount / (_recipientCount * 10); // Minimum 10% of equal share
        
        for (uint256 i = 0; i < _recipientCount - 1; i++) {
            uint256 maxAmount = remaining - (minPerRecipient * (_recipientCount - i - 1));
            uint256 randomAmount = minPerRecipient + (uint256(keccak256(abi.encodePacked(
                block.timestamp, 
                block.prevrandao, 
                i
            ))) % (maxAmount - minPerRecipient + 1));
            
            amounts[i] = randomAmount;
            remaining -= randomAmount;
        }
        
        // Last recipient gets remaining amount
        amounts[_recipientCount - 1] = remaining;
        
        return amounts;
    }

    // Admin functions
    function setMaxRecipients(uint256 _maxRecipients) public onlyOwner {
        maxRecipients = _maxRecipients;
    }

    function setMinAmount(uint256 _minAmount) public onlyOwner {
        minAmount = _minAmount;
    }

    function getSettings() public view returns (uint256 maxRec, uint256 minAmt) {
        return (maxRecipients, minAmount);
    }

    function updateJengaCore(address _newJengaCore) public onlyOwner {
        jengaCore = _newJengaCore;
    }

    // Emergency withdrawal (owner only)
    function emergencyWithdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
