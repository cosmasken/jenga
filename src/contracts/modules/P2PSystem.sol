// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../libraries/JengaTypes.sol";

contract P2PSystem {
    using JengaTypes for JengaTypes.Transaction;

    // State variables
    mapping(address => JengaTypes.Transaction[]) public userTransactions;
    mapping(address => uint256) public totalSent;
    mapping(address => uint256) public totalReceived;
    JengaTypes.Transaction[] public allTransactions;
    
    address public owner;
    address public jengaCore;
    uint256 public transactionFee = 0.0001 ether; // Small fee for P2P transfers
    bool public feesEnabled = false;

    // Events
    event P2PSent(address indexed sender, address indexed receiver, uint256 amount, uint256 fee);
    event FeeCollected(address indexed sender, uint256 fee);
    event FeesToggled(bool enabled);
    event FeeUpdated(uint256 newFee);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier validAmount() {
        require(msg.value > 0, "Amount must be greater than 0");
        _;
    }

    modifier validReceiver(address _receiver) {
        require(_receiver != address(0), "Invalid receiver address");
        require(_receiver != msg.sender, "Cannot send to yourself");
        _;
    }

    constructor(address _jengaCore) {
        owner = msg.sender;
        jengaCore = _jengaCore;
    }

    // Send P2P transfer
    function sendP2P(address _receiver) 
        public 
        payable 
        validAmount 
        validReceiver(_receiver) 
    {
        uint256 fee = 0;
        uint256 transferAmount = msg.value;
        
        // Calculate fee if enabled
        if (feesEnabled && msg.value > transactionFee) {
            fee = transactionFee;
            transferAmount = msg.value - fee;
        }
        
        // Create transaction record
        JengaTypes.Transaction memory transaction = JengaTypes.Transaction({
            sender: msg.sender,
            receiver: _receiver,
            amount: transferAmount,
            timestamp: block.timestamp
        });
        
        // Store transaction
        userTransactions[msg.sender].push(transaction);
        userTransactions[_receiver].push(transaction);
        allTransactions.push(transaction);
        
        // Update totals
        totalSent[msg.sender] += transferAmount;
        totalReceived[_receiver] += transferAmount;
        
        // Transfer funds
        payable(_receiver).transfer(transferAmount);
        
        // Collect fee if applicable
        if (fee > 0) {
            payable(owner).transfer(fee);
            emit FeeCollected(msg.sender, fee);
        }
        
        emit P2PSent(msg.sender, _receiver, transferAmount, fee);
    }

    // Batch P2P transfer to multiple recipients
    function sendBatchP2P(address[] memory _receivers, uint256[] memory _amounts) 
        public 
        payable 
    {
        require(_receivers.length == _amounts.length, "Arrays length mismatch");
        require(_receivers.length <= 10, "Max 10 recipients");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalAmount += _amounts[i];
        }
        
        uint256 totalFees = feesEnabled ? (transactionFee * _receivers.length) : 0;
        require(msg.value >= totalAmount + totalFees, "Insufficient funds");
        
        // Process each transfer
        for (uint256 i = 0; i < _receivers.length; i++) {
            require(_receivers[i] != address(0), "Invalid receiver");
            require(_receivers[i] != msg.sender, "Cannot send to yourself");
            require(_amounts[i] > 0, "Amount must be greater than 0");
            
            // Create transaction record
            JengaTypes.Transaction memory transaction = JengaTypes.Transaction({
                sender: msg.sender,
                receiver: _receivers[i],
                amount: _amounts[i],
                timestamp: block.timestamp
            });
            
            // Store transaction
            userTransactions[msg.sender].push(transaction);
            userTransactions[_receivers[i]].push(transaction);
            allTransactions.push(transaction);
            
            // Update totals
            totalSent[msg.sender] += _amounts[i];
            totalReceived[_receivers[i]] += _amounts[i];
            
            // Transfer funds
            payable(_receivers[i]).transfer(_amounts[i]);
            
            emit P2PSent(msg.sender, _receivers[i], _amounts[i], feesEnabled ? transactionFee : 0);
        }
        
        // Collect total fees
        if (totalFees > 0) {
            payable(owner).transfer(totalFees);
            emit FeeCollected(msg.sender, totalFees);
        }
        
        // Refund excess
        uint256 excess = msg.value - totalAmount - totalFees;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
    }

    // View functions
    function getTransactionHistory(address _user) public view returns (JengaTypes.Transaction[] memory) {
        return userTransactions[_user];
    }

    function getUserTransactionCount(address _user) public view returns (uint256) {
        return userTransactions[_user].length;
    }

    function getUserTotals(address _user) public view returns (uint256 sent, uint256 received) {
        return (totalSent[_user], totalReceived[_user]);
    }

    function getAllTransactions() public view returns (JengaTypes.Transaction[] memory) {
        return allTransactions;
    }

    function getTotalTransactionCount() public view returns (uint256) {
        return allTransactions.length;
    }

    function getRecentTransactions(uint256 _count) public view returns (JengaTypes.Transaction[] memory) {
        uint256 totalCount = allTransactions.length;
        uint256 returnCount = _count > totalCount ? totalCount : _count;
        
        JengaTypes.Transaction[] memory recentTransactions = new JengaTypes.Transaction[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            recentTransactions[i] = allTransactions[totalCount - 1 - i];
        }
        
        return recentTransactions;
    }

    function getUserRecentTransactions(address _user, uint256 _count) public view returns (JengaTypes.Transaction[] memory) {
        JengaTypes.Transaction[] memory userTxs = userTransactions[_user];
        uint256 totalCount = userTxs.length;
        uint256 returnCount = _count > totalCount ? totalCount : _count;
        
        JengaTypes.Transaction[] memory recentTransactions = new JengaTypes.Transaction[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            recentTransactions[i] = userTxs[totalCount - 1 - i];
        }
        
        return recentTransactions;
    }

    // Get transactions between two addresses
    function getTransactionsBetween(address _user1, address _user2) public view returns (JengaTypes.Transaction[] memory) {
        JengaTypes.Transaction[] memory user1Txs = userTransactions[_user1];
        uint256 matchCount = 0;
        
        // Count matching transactions
        for (uint256 i = 0; i < user1Txs.length; i++) {
            if ((user1Txs[i].sender == _user1 && user1Txs[i].receiver == _user2) ||
                (user1Txs[i].sender == _user2 && user1Txs[i].receiver == _user1)) {
                matchCount++;
            }
        }
        
        // Create result array
        JengaTypes.Transaction[] memory result = new JengaTypes.Transaction[](matchCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < user1Txs.length; i++) {
            if ((user1Txs[i].sender == _user1 && user1Txs[i].receiver == _user2) ||
                (user1Txs[i].sender == _user2 && user1Txs[i].receiver == _user1)) {
                result[index] = user1Txs[i];
                index++;
            }
        }
        
        return result;
    }

    // Admin functions
    function setTransactionFee(uint256 _fee) public onlyOwner {
        transactionFee = _fee;
        emit FeeUpdated(_fee);
    }

    function toggleFees(bool _enabled) public onlyOwner {
        feesEnabled = _enabled;
        emit FeesToggled(_enabled);
    }

    function withdrawFees() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner).transfer(balance);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getFeeSettings() public view returns (uint256 fee, bool enabled) {
        return (transactionFee, feesEnabled);
    }

    // Emergency functions
    function pause() public onlyOwner {
        // Could implement pausable functionality if needed
    }

    function updateJengaCore(address _newJengaCore) public onlyOwner {
        jengaCore = _newJengaCore;
    }
}
