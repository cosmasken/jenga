// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title P2PTransfer
 * @dev Handles peer-to-peer transfers and red envelope functionality
 * @notice This contract manages P2P transfers and red envelope distribution
 */
contract P2PTransfer is ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant GAMIFICATION_ROLE = keccak256("GAMIFICATION_ROLE");

    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        uint256 timestamp;
        string transactionType; // "P2P" or "RedEnvelope"
    }

    struct RedEnvelope {
        address sender;
        address[] recipients;
        uint256 totalAmount;
        uint256[] amounts;
        bool isRandom;
        mapping(address => bool) claimed;
        uint256 claimedCount;
        uint256 createdAt;
        string message;
        bool isActive;
    }

    // State variables
    uint256 public redEnvelopeCount;
    uint256 public totalTransactions;
    
    mapping(uint256 => RedEnvelope) public redEnvelopes;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256[]) public userTransactions;
    mapping(address => uint256[]) public userRedEnvelopes;
    mapping(address => uint256) public p2pTransferCount;
    mapping(address => uint256) public redEnvelopeSentCount;

    // Constants
    uint256 public constant MAX_RECIPIENTS = 10;
    uint256 public constant MAX_RED_ENVELOPE_AMOUNT = 0.01 ether;
    uint256 public constant MIN_TRANSFER_AMOUNT = 0.0001 ether;

    // Events
    event P2PSent(address indexed sender, address indexed receiver, uint256 amount);
    event RedEnvelopeSent(uint256 indexed envelopeId, address indexed sender, uint256 totalAmount, uint256 recipientCount);
    event RedEnvelopeClaimed(uint256 indexed envelopeId, address indexed recipient, uint256 amount);
    event RedEnvelopeExpired(uint256 indexed envelopeId);

    // Custom errors
    error InsufficientAmount();
    error InvalidRecipientCount();
    error ExceedsMaxAmount();
    error RedEnvelopeNotFound();
    error RedEnvelopeAlreadyExpired();
    error AlreadyClaimed();
    error NotRecipient();
    error TransferFailed();
    error InvalidRecipient();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Send P2P transfer to another user
     * @param _receiver Address of the receiver
     */
    function sendP2P(address _receiver) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        if (msg.value < MIN_TRANSFER_AMOUNT) revert InsufficientAmount();
        if (_receiver == address(0) || _receiver == msg.sender) revert InvalidRecipient();

        // Record transaction
        totalTransactions++;
        transactions[totalTransactions] = Transaction({
            sender: msg.sender,
            receiver: _receiver,
            amount: msg.value,
            timestamp: block.timestamp,
            transactionType: "P2P"
        });

        // Update user transaction history
        userTransactions[msg.sender].push(totalTransactions);
        userTransactions[_receiver].push(totalTransactions);
        
        // Update P2P count
        p2pTransferCount[msg.sender]++;

        // Transfer funds
        (bool success, ) = payable(_receiver).call{value: msg.value}("");
        if (!success) revert TransferFailed();

        // Notify gamification contract for first P2P achievement
        if (hasRole(GAMIFICATION_ROLE, address(this)) && p2pTransferCount[msg.sender] == 1) {
            // This will be handled by the factory contract
        }

        emit P2PSent(msg.sender, _receiver, msg.value);
    }

    /**
     * @dev Send red envelope to multiple recipients
     * @param _recipients Array of recipient addresses
     * @param _totalAmount Total amount to distribute
     * @param _isRandom Whether to distribute randomly or equally
     * @param _message Message for the red envelope
     */
    function sendRedEnvelope(
        address[] memory _recipients,
        uint256 _totalAmount,
        bool _isRandom,
        string memory _message
    ) external payable whenNotPaused nonReentrant {
        if (_recipients.length == 0 || _recipients.length > MAX_RECIPIENTS) {
            revert InvalidRecipientCount();
        }
        if (msg.value != _totalAmount) revert InsufficientAmount();
        if (_totalAmount > MAX_RED_ENVELOPE_AMOUNT) revert ExceedsMaxAmount();

        redEnvelopeCount++;
        RedEnvelope storage envelope = redEnvelopes[redEnvelopeCount];
        
        envelope.sender = msg.sender;
        envelope.recipients = _recipients;
        envelope.totalAmount = _totalAmount;
        envelope.isRandom = _isRandom;
        envelope.claimedCount = 0;
        envelope.createdAt = block.timestamp;
        envelope.message = _message;
        envelope.isActive = true;

        // Calculate amounts for each recipient
        uint256[] memory amounts = new uint256[](_recipients.length);
        
        if (_isRandom) {
            amounts = _generateRandomAmounts(_totalAmount, _recipients.length);
        } else {
            uint256 equalAmount = _totalAmount / _recipients.length;
            uint256 remainder = _totalAmount % _recipients.length;
            
            for (uint256 i = 0; i < _recipients.length; i++) {
                amounts[i] = equalAmount;
                if (i < remainder) {
                    amounts[i] += 1;
                }
            }
        }
        
        envelope.amounts = amounts;

        // Update user red envelope history
        userRedEnvelopes[msg.sender].push(redEnvelopeCount);
        redEnvelopeSentCount[msg.sender]++;

        // Record transaction
        totalTransactions++;
        transactions[totalTransactions] = Transaction({
            sender: msg.sender,
            receiver: address(0), // Multiple recipients
            amount: _totalAmount,
            timestamp: block.timestamp,
            transactionType: "RedEnvelope"
        });

        userTransactions[msg.sender].push(totalTransactions);

        // Check for red envelope achievements
        if (hasRole(GAMIFICATION_ROLE, address(this))) {
            // This will be handled by the factory contract
        }

        emit RedEnvelopeSent(redEnvelopeCount, msg.sender, _totalAmount, _recipients.length);
    }

    /**
     * @dev Generate random amounts for red envelope distribution
     * @param _totalAmount Total amount to distribute
     * @param _recipientCount Number of recipients
     * @return amounts Array of random amounts
     */
    function _generateRandomAmounts(uint256 _totalAmount, uint256 _recipientCount) 
        internal 
        view 
        returns (uint256[] memory amounts) 
    {
        amounts = new uint256[](_recipientCount);
        uint256 remaining = _totalAmount;
        
        for (uint256 i = 0; i < _recipientCount - 1; i++) {
            // Generate random percentage (10% to 40% of remaining)
            uint256 minAmount = remaining / 10; // 10%
            uint256 maxAmount = (remaining * 4) / 10; // 40%
            
            if (maxAmount > minAmount) {
                uint256 randomAmount = minAmount + (uint256(keccak256(abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    i,
                    msg.sender
                ))) % (maxAmount - minAmount));
                
                amounts[i] = randomAmount;
                remaining -= randomAmount;
            } else {
                amounts[i] = minAmount;
                remaining -= minAmount;
            }
        }
        
        // Last recipient gets remaining amount
        amounts[_recipientCount - 1] = remaining;
        
        return amounts;
    }

    /**
     * @dev Claim red envelope
     * @param _envelopeId ID of the red envelope to claim
     */
    function claimRedEnvelope(uint256 _envelopeId) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        if (_envelopeId == 0 || _envelopeId > redEnvelopeCount) revert RedEnvelopeNotFound();
        
        RedEnvelope storage envelope = redEnvelopes[_envelopeId];
        
        if (!envelope.isActive) revert RedEnvelopeAlreadyExpired();
        if (envelope.claimed[msg.sender]) revert AlreadyClaimed();
        
        // Check if sender is a recipient
        bool isRecipient = false;
        uint256 recipientIndex = 0;
        
        for (uint256 i = 0; i < envelope.recipients.length; i++) {
            if (envelope.recipients[i] == msg.sender) {
                isRecipient = true;
                recipientIndex = i;
                break;
            }
        }
        
        if (!isRecipient) revert NotRecipient();
        
        // Mark as claimed
        envelope.claimed[msg.sender] = true;
        envelope.claimedCount++;
        
        uint256 amount = envelope.amounts[recipientIndex];
        
        // Transfer amount to claimer
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        // Record transaction
        totalTransactions++;
        transactions[totalTransactions] = Transaction({
            sender: envelope.sender,
            receiver: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            transactionType: "RedEnvelope"
        });

        userTransactions[msg.sender].push(totalTransactions);

        emit RedEnvelopeClaimed(_envelopeId, msg.sender, amount);
    }

    /**
     * @dev Expire red envelope and return unclaimed funds to sender
     * @param _envelopeId ID of the red envelope to expire
     */
    function expireRedEnvelope(uint256 _envelopeId) external whenNotPaused nonReentrant {
        if (_envelopeId == 0 || _envelopeId > redEnvelopeCount) revert RedEnvelopeNotFound();
        
        RedEnvelope storage envelope = redEnvelopes[_envelopeId];
        
        // Only sender can expire or after 7 days
        require(
            msg.sender == envelope.sender || 
            block.timestamp >= envelope.createdAt + 7 days,
            "Cannot expire yet"
        );
        
        if (!envelope.isActive) revert RedEnvelopeAlreadyExpired();
        
        envelope.isActive = false;
        
        // Calculate unclaimed amount
        uint256 unclaimedAmount = 0;
        for (uint256 i = 0; i < envelope.recipients.length; i++) {
            if (!envelope.claimed[envelope.recipients[i]]) {
                unclaimedAmount += envelope.amounts[i];
            }
        }
        
        // Return unclaimed funds to sender
        if (unclaimedAmount > 0) {
            (bool success, ) = payable(envelope.sender).call{value: unclaimedAmount}("");
            require(success, "Refund failed");
        }
        
        emit RedEnvelopeExpired(_envelopeId);
    }

    // View functions
    function getRedEnvelopeDetails(uint256 _envelopeId) external view returns (
        address sender,
        address[] memory recipients,
        uint256 totalAmount,
        uint256[] memory amounts,
        bool isRandom,
        uint256 claimedCount,
        uint256 createdAt,
        string memory message,
        bool isActive
    ) {
        RedEnvelope storage envelope = redEnvelopes[_envelopeId];
        return (
            envelope.sender,
            envelope.recipients,
            envelope.totalAmount,
            envelope.amounts,
            envelope.isRandom,
            envelope.claimedCount,
            envelope.createdAt,
            envelope.message,
            envelope.isActive
        );
    }

    function hasClaimedRedEnvelope(uint256 _envelopeId, address _user) 
        external 
        view 
        returns (bool) 
    {
        return redEnvelopes[_envelopeId].claimed[_user];
    }

    function getUserTransactionHistory(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userTransactions[_user];
    }

    function getUserRedEnvelopes(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userRedEnvelopes[_user];
    }

    function getTransactionDetails(uint256 _transactionId) 
        external 
        view 
        returns (Transaction memory) 
    {
        return transactions[_transactionId];
    }

    function getUserP2PCount(address _user) external view returns (uint256) {
        return p2pTransferCount[_user];
    }

    function getUserRedEnvelopeCount(address _user) external view returns (uint256) {
        return redEnvelopeSentCount[_user];
    }

    // Admin functions
    function setMaxRedEnvelopeAmount(uint256 _maxAmount) external onlyRole(ADMIN_ROLE) {
        // This would require updating the constant, which isn't possible
        // Consider using a state variable instead of constant
    }

    function setGamificationContract(address _gamificationContract) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        _grantRole(GAMIFICATION_ROLE, _gamificationContract);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // Emergency function to withdraw stuck funds (admin only)
    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }
}
