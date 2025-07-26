// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library JengaTypes {
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
        bool claimed;
        uint256 timestamp;
    }

    struct Invite {
        address inviter;
        bytes32 inviteCode;
        uint256 createdAt;
        uint256 expiresAt;
        bool isActive;
        bool isUsed;
        address usedBy;
        uint256 usedAt;
    }

    struct InviteStats {
        uint256 totalGenerated;
        uint256 totalUsed;
        uint256 totalRewards;
        address[] invitees;
    }
}

interface IJengaCore {
    function getChamaInfo(uint256 _chamaId) external view returns (
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
    );
    
    function isChamaMember(uint256 _chamaId, address _user) external view returns (bool);
    function getUserScore(address _user) external view returns (uint256);
    function updateUserScore(address _user, uint256 _points) external;
}

interface IInviteSystem {
    function generateInvite() external returns (bytes32);
    function acceptInvite(bytes32 _inviteCode) external payable;
    function getUserInviteStats(address _user) external view returns (
        uint256 totalGenerated,
        uint256 totalUsed,
        uint256 totalRewards,
        address[] memory invitees
    );
}

interface IP2PSystem {
    function sendP2P(address _receiver) external payable;
    function getTransactionHistory(address _user) external view returns (JengaTypes.Transaction[] memory);
}

interface IRedEnvelopeSystem {
    function sendRedEnvelope(
        address[] memory _recipients,
        uint256 _totalAmount,
        bool _isRandom,
        string memory _message
    ) external payable;
    function claimRedEnvelope(uint256 _envelopeId) external;
}
