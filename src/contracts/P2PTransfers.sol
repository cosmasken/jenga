// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./JengaRegistry.sol";

contract P2PTransfers {
    JengaRegistry public registry;
    
    struct RedEnvelope {
        address creator;
        uint256 totalAmount;
        uint256 recipientCount;
        uint256 claimedCount;
        mapping(address => bool) claimed;
    }
    
    mapping(bytes32 => RedEnvelope) public redEnvelopes;
    
    event TransferSent(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        string message
    );
    
    event RedEnvelopeCreated(
        bytes32 indexed envelopeId,
        address creator,
        uint256 totalAmount,
        uint256 recipientCount
    );
    
    event RedEnvelopeClaimed(
        bytes32 indexed envelopeId,
        address claimer,
        uint256 amount
    );

    constructor(address _registry) {
        registry = JengaRegistry(_registry);
    }

    function sendBTC(
        address _receiver,
        string memory _message
    ) external payable {
        require(registry.profileExists(msg.sender), "Profile does not exist");
        require(msg.value > 0, "Amount required");
        payable(_receiver).transfer(msg.value);
        
        // Update stacking scores
        registry.updateStackingScore(msg.sender, 1);
        registry.updateStackingScore(_receiver, 1);
        
        emit TransferSent(msg.sender, _receiver, msg.value, _message);
    }

    function createRedEnvelope(
        address[] memory _recipients
    ) external payable returns (bytes32) {
        require(registry.profileExists(msg.sender), "Profile does not exist");
        require(msg.value > 0, "Amount required");
        require(_recipients.length > 0, "Recipients required");
        
        bytes32 envelopeId = keccak256(abi.encodePacked(
            msg.sender, 
            block.timestamp,
            msg.value
        ));
        
        RedEnvelope storage envelope = redEnvelopes[envelopeId];
        envelope.creator = msg.sender;
        envelope.totalAmount = msg.value;
        envelope.recipientCount = _recipients.length;
        
        emit RedEnvelopeCreated(envelopeId, msg.sender, msg.value, _recipients.length);
        return envelopeId;
    }

    function claimRedEnvelope(bytes32 _envelopeId) external {
        RedEnvelope storage envelope = redEnvelopes[_envelopeId];
        require(registry.profileExists(msg.sender), "Profile does not exist");
        require(envelope.creator != address(0), "Invalid envelope");
        require(!envelope.claimed[msg.sender], "Already claimed");
        require(envelope.claimedCount < envelope.recipientCount, "All claimed");
        
        uint256 share = envelope.totalAmount / envelope.recipientCount;
        envelope.claimed[msg.sender] = true;
        envelope.claimedCount++;
        
        payable(msg.sender).transfer(share);
        registry.updateStackingScore(msg.sender, 2);
        
        emit RedEnvelopeClaimed(_envelopeId, msg.sender, share);
    }
}