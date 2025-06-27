// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./JengaRegistry.sol";

contract SaccoFactory {
    JengaRegistry public registry;
    
    enum PoolState { ACTIVE, COMPLETED }
    
    struct SaccoPool {
        address creator;
        uint256 contributionAmount;
        uint256 cycleDuration;
        uint256 currentCycle;
        uint256 totalCycles;
        uint256 lastPayout;
        PoolState state;
        address[] members;
        address[] winners;
    }

    uint256 public poolCount;
    mapping(uint256 => SaccoPool) public pools;
    mapping(uint256 => mapping(address => bool)) public memberContributions;

    event PoolCreated(uint256 indexed poolId, address creator);
    event MemberJoined(uint256 indexed poolId, address member);
    event WinnerSelected(uint256 indexed poolId, address winner, uint256 amount);

    constructor(address _registry) {
        registry = JengaRegistry(_registry);
    }

    function createPool(
        uint256 _contribution,
        uint256 _cycleDuration,
        uint256 _totalCycles,
        address[] memory _initialMembers
    ) external returns (uint256) {
        require(registry.profileExists(msg.sender), "Profile does not exist");
        require(_contribution > 0, "Invalid contribution");
        require(_cycleDuration > 0, "Invalid duration");
        require(_totalCycles > 0, "Invalid cycles");
        
        uint256 poolId = poolCount++;
        pools[poolId] = SaccoPool({
            creator: msg.sender,
            contributionAmount: _contribution,
            cycleDuration: _cycleDuration,
            currentCycle: 0,
            totalCycles: _totalCycles,
            lastPayout: block.timestamp,
            state: PoolState.ACTIVE,
            members: _initialMembers,
            winners: new address[](0)
        });
        
        // Add creator if not included
        bool creatorAdded = false;
        for (uint i = 0; i < _initialMembers.length; i++) {
            if (_initialMembers[i] == msg.sender) creatorAdded = true;
            registry.updateStackingScore(_initialMembers[i], 10);
        }
        if (!creatorAdded) {
            pools[poolId].members.push(msg.sender);
        }
        
        emit PoolCreated(poolId, msg.sender);
        return poolId;
    }

    function joinPool(uint256 poolId) external payable {
        SaccoPool storage pool = pools[poolId];
        require(pool.state == PoolState.ACTIVE, "Pool not active");
        require(registry.profileExists(msg.sender), "Profile does not exist");
        require(msg.value == pool.contributionAmount, "Incorrect amount");
        require(!_isMember(pool, msg.sender), "Already member");
        
        pool.members.push(msg.sender);
        registry.updateStackingScore(msg.sender, 10);
        emit MemberJoined(poolId, msg.sender);
    }

    function contributeToCycle(uint256 poolId) external payable {
        require(registry.profileExists(msg.sender), "Profile does not exist");
        SaccoPool storage pool = pools[poolId];
        require(pool.state == PoolState.ACTIVE, "Pool not active");
        require(_isMember(pool, msg.sender), "Not member");
        require(msg.value == pool.contributionAmount, "Incorrect amount");
        require(!memberContributions[poolId][msg.sender], "Already contributed");
        
        memberContributions[poolId][msg.sender] = true;
        
        // Check if all contributed
        if (_allMembersContributed(poolId)) {
            _selectWinner(poolId);
        }
    }

    function _selectWinner(uint256 poolId) private {
        SaccoPool storage pool = pools[poolId];
        require(block.timestamp >= pool.lastPayout + pool.cycleDuration, "Cycle not ended");

        uint256 winnerIndex = uint256(
        keccak256(abi.encodePacked(block.prevrandao, block.timestamp, poolId))
        ) % pool.members.length;
        
        address winner = pool.members[winnerIndex];
        uint256 prize = pool.contributionAmount * pool.members.length;
        
        payable(winner).transfer(prize);
        pool.winners.push(winner);
        pool.currentCycle++;
        pool.lastPayout = block.timestamp;
        
        // Reset contributions
        for (uint i = 0; i < pool.members.length; i++) {
            memberContributions[poolId][pool.members[i]] = false;
        }
        
        // Complete pool if finished
        if (pool.currentCycle >= pool.totalCycles) {
            pool.state = PoolState.COMPLETED;
            for (uint i = 0; i < pool.members.length; i++) {
                registry.recordSaccoCompletion(pool.members[i]);
            }
        }
        
        emit WinnerSelected(poolId, winner, prize);
    }

    function _isMember(SaccoPool memory pool, address user) private pure returns (bool) {
        for (uint i = 0; i < pool.members.length; i++) {
            if (pool.members[i] == user) return true;
        }
        return false;
    }

    function _allMembersContributed(uint256 poolId) private view returns (bool) {
        SaccoPool memory pool = pools[poolId];
        for (uint i = 0; i < pool.members.length; i++) {
            if (!memberContributions[poolId][pool.members[i]]) return false;
        }
        return true;
    }
}