// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ChamaCore
 * @dev Core chama functionality - creation, joining, contributions, and payouts
 * @notice This contract handles the core rotating savings circle (chama) logic
 */
contract ChamaCore is ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant GAMIFICATION_ROLE = keccak256("GAMIFICATION_ROLE");

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

    // State variables
    uint256 public chamaCount;
    mapping(uint256 => Chama) public chamas;
    mapping(uint256 => mapping(address => Contribution[])) public contributions;
    mapping(uint256 => mapping(address => bool)) public hasContributedThisCycle;
    mapping(uint256 => mapping(address => uint256)) public lastContributionTimestamp;

    // Events
    event ChamaCreated(uint256 indexed chamaId, string name, address indexed creator, uint256 contributionAmount);
    event ChamaJoined(uint256 indexed chamaId, address indexed member);
    event ChamaStarted(uint256 indexed chamaId, address indexed starter, uint256 timestamp);
    event ChamaClosed(uint256 indexed chamaId);
    event ChamaCycleCompleted(uint256 indexed chamaId, uint256 cycleNumber);
    event ChamaCyclePayout(uint256 indexed chamaId, address indexed recipient, uint256 amount, uint256 cycleNumber);
    event ChamaContributionMissed(uint256 indexed chamaId, address indexed member, uint256 cycleNumber);
    event ContributionMade(uint256 indexed chamaId, address indexed user, uint256 amount);
    event PayoutProcessed(uint256 indexed chamaId, address indexed recipient, uint256 amount, uint256 cycleNumber);
    event ChamaCompleted(uint256 indexed chamaId);
    event CollateralDeposited(uint256 indexed chamaId, address indexed member, uint256 amount);
    event CollateralReturned(uint256 indexed chamaId, address indexed member, uint256 amount);
    event CollateralForfeited(uint256 indexed chamaId, address indexed member, uint256 amount);

    // Custom errors
    error InvalidContributionAmount();
    error InvalidCycleDuration();
    error InvalidMemberCount();
    error InsufficientCollateral();
    error ChamaNotFound();
    error ChamaNotActive();
    error AlreadyMember();
    error NotMember();
    error ChamaFull();
    error ChamaAlreadyStarted();
    error NotChamaCreator();
    error BelowMinimumContribution();
    error AlreadyContributedThisCycle();
    error GracePeriodNotOver();
    error CycleNotComplete();

    // Modifiers
    modifier onlyChamaMember(uint256 _chamaId) {
        if (!chamas[_chamaId].isMember[msg.sender]) revert NotMember();
        _;
    }

    modifier chamaExists(uint256 _chamaId) {
        if (_chamaId == 0 || _chamaId > chamaCount) revert ChamaNotFound();
        _;
    }

    modifier chamaActive(uint256 _chamaId) {
        if (!chamas[_chamaId].active) revert ChamaNotActive();
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Create a new chama
     * @param _name Name of the chama
     * @param _contributionAmount Required contribution amount per cycle
     * @param _cycleDuration Duration of each cycle in seconds
     * @param _maxMembers Maximum number of members allowed
     */
    function createChama(
        string memory _name,
        uint256 _contributionAmount,
        uint256 _cycleDuration,
        uint256 _maxMembers
    ) external payable whenNotPaused nonReentrant {
        if (_contributionAmount == 0) revert InvalidContributionAmount();
        if (_cycleDuration < 7 minutes) revert InvalidCycleDuration();
        if (_maxMembers < 3 || _maxMembers > 20) revert InvalidMemberCount();
        if (msg.value < _contributionAmount) revert InsufficientCollateral();

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
        
        // Initialize membersPaid array
        newChama.membersPaid = new bool[](_maxMembers);
        
        // Add creator as first member
        newChama.members.push(msg.sender);
        newChama.isMember[msg.sender] = true;
        newChama.memberIndex[msg.sender] = 0;
        newChama.memberCollateral[msg.sender] = msg.value;
        
        // Notify gamification contract about chama creation
        if (hasRole(GAMIFICATION_ROLE, msg.sender)) {
            // This will be called by the factory contract
        }
        
        emit ChamaCreated(chamaCount, _name, msg.sender, _contributionAmount);
        emit ChamaJoined(chamaCount, msg.sender);
        emit CollateralDeposited(chamaCount, msg.sender, msg.value);
    }

    /**
     * @dev Join an existing chama
     * @param _chamaId ID of the chama to join
     */
    function joinChama(uint256 _chamaId) 
        external 
        payable 
        chamaExists(_chamaId) 
        chamaActive(_chamaId) 
        whenNotPaused 
        nonReentrant 
    {
        Chama storage chama = chamas[_chamaId];
        
        if (chama.isMember[msg.sender]) revert AlreadyMember();
        if (chama.members.length >= chama.maxMembers) revert ChamaFull();
        if (msg.value < chama.contributionAmount) revert InsufficientCollateral();
        
        // Add member
        uint256 memberIndex = chama.members.length;
        chama.members.push(msg.sender);
        chama.isMember[msg.sender] = true;
        chama.memberIndex[msg.sender] = memberIndex;
        chama.memberCollateral[msg.sender] = msg.value;
        chama.totalCollateral += msg.value;
        
        emit ChamaJoined(_chamaId, msg.sender);
        emit CollateralDeposited(_chamaId, msg.sender, msg.value);
        
        // Start the chama if it's full
        if (chama.members.length == chama.maxMembers) {
            _startChama(_chamaId);
        }
    }

    /**
     * @dev Manually start chama (one-time only, by creator)
     * @param _chamaId ID of the chama to start
     */
    function startChama(uint256 _chamaId) 
        external 
        chamaExists(_chamaId) 
        chamaActive(_chamaId) 
        whenNotPaused 
    {
        Chama storage chama = chamas[_chamaId];
        
        if (chama.currentCycle != 0) revert ChamaAlreadyStarted();
        if (chama.members[0] != msg.sender) revert NotChamaCreator();
        
        _startChama(_chamaId);
    }

    /**
     * @dev Internal function to start chama
     * @param _chamaId ID of the chama to start
     */
    function _startChama(uint256 _chamaId) internal {
        Chama storage chama = chamas[_chamaId];
        
        chama.currentCycle = 1;
        chama.lastCycleTimestamp = block.timestamp;
        
        // Shuffle member order for fairness
        _shuffleMembers(_chamaId);
        
        emit ChamaStarted(_chamaId, msg.sender, block.timestamp);
    }

    /**
     * @dev Simple member shuffling for payout order
     * @param _chamaId ID of the chama
     */
    function _shuffleMembers(uint256 _chamaId) internal {
        Chama storage chama = chamas[_chamaId];
        uint256 length = chama.members.length;
        
        for (uint256 i = 0; i < length; i++) {
            // Simple pseudo-random shuffle (not cryptographically secure)
            uint256 randomIndex = (uint256(keccak256(abi.encodePacked(
                block.timestamp, 
                block.prevrandao, 
                i
            ))) % (length - i)) + i;
            
            // Swap members
            address temp = chama.members[i];
            chama.members[i] = chama.members[randomIndex];
            chama.members[randomIndex] = temp;
            
            // Update member indices
            chama.memberIndex[chama.members[i]] = i;
            chama.memberIndex[chama.members[randomIndex]] = randomIndex;
        }
    }

    /**
     * @dev Make a contribution (stack BTC)
     * @param _chamaId ID of the chama
     */
    function stackBTC(uint256 _chamaId) 
        external 
        payable 
        onlyChamaMember(_chamaId) 
        chamaActive(_chamaId) 
        whenNotPaused 
        nonReentrant 
    {
        Chama storage chama = chamas[_chamaId];
        
        if (msg.value < chama.contributionAmount) revert BelowMinimumContribution();
        if (hasContributedThisCycle[_chamaId][msg.sender]) revert AlreadyContributedThisCycle();
        
        // Record contribution
        contributions[_chamaId][msg.sender].push(Contribution({
            contributor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        
        hasContributedThisCycle[_chamaId][msg.sender] = true;
        lastContributionTimestamp[_chamaId][msg.sender] = block.timestamp;
        chama.totalPool += msg.value;
        chama.cycleContributions[chama.currentCycle] += msg.value;
        
        emit ContributionMade(_chamaId, msg.sender, msg.value);
        
        // Check if cycle is complete
        _checkCycleCompletion(_chamaId);
    }

    /**
     * @dev Check if current cycle is complete and process payout
     * @param _chamaId ID of the chama
     */
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

    /**
     * @dev Process payout for completed cycle
     * @param _chamaId ID of the chama
     */
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
        (bool success, ) = payable(recipient).call{value: payoutAmount}("");
        require(success, "Payout transfer failed");
        
        emit ChamaCyclePayout(_chamaId, recipient, payoutAmount, chama.currentCycle);
        emit PayoutProcessed(_chamaId, recipient, payoutAmount, chama.currentCycle);
        
        // Reset cycle
        _resetCycle(_chamaId);
        
        // Check if chama is complete
        if (chama.currentCycle > chama.members.length) {
            _completeChama(_chamaId);
        }
    }

    /**
     * @dev Reset cycle state for next round
     * @param _chamaId ID of the chama
     */
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

    /**
     * @dev Complete chama when all members have received payout
     * @param _chamaId ID of the chama
     */
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
                (bool success, ) = payable(member).call{value: collateralAmount}("");
                require(success, "Collateral return failed");
                
                emit CollateralReturned(_chamaId, member, collateralAmount);
            }
        }
        
        emit ChamaCompleted(_chamaId);
    }

    /**
     * @dev Emergency function to process missed contributions
     * @param _chamaId ID of the chama
     */
    function processMissedContributions(uint256 _chamaId) 
        external 
        chamaExists(_chamaId) 
        whenNotPaused 
    {
        Chama storage chama = chamas[_chamaId];
        
        if (!chama.active) revert ChamaNotActive();
        if (block.timestamp < chama.lastCycleTimestamp + chama.cycleDuration + 1 days) {
            revert GracePeriodNotOver();
        }
        
        // Find members who missed contribution and forfeit their collateral
        for (uint256 i = 0; i < chama.members.length; i++) {
            address member = chama.members[i];
            if (!hasContributedThisCycle[_chamaId][member]) {
                // Forfeit collateral for missed contribution
                uint256 collateralAmount = chama.memberCollateral[member];
                if (collateralAmount > 0 && !chama.collateralReturned[member]) {
                    chama.collateralReturned[member] = true; // Mark as processed
                    chama.totalCollateral -= collateralAmount;
                    
                    // Collateral is forfeited (stays in contract)
                    emit CollateralForfeited(_chamaId, member, collateralAmount);
                }
                
                emit ChamaContributionMissed(_chamaId, member, chama.currentCycle);
            }
        }
        
        // Force cycle completion with partial contributions
        _processCyclePayout(_chamaId);
    }

    // View functions
    function getChamaDetails(uint256 _chamaId) external view returns (
        string memory name,
        uint256 contributionAmount,
        uint256 cycleDuration,
        uint256 maxMembers,
        uint256 currentMembers,
        bool active,
        uint256 currentCycle,
        uint256 totalPool,
        uint256 totalCollateral
    ) {
        Chama storage chama = chamas[_chamaId];
        return (
            chama.name,
            chama.contributionAmount,
            chama.cycleDuration,
            chama.maxMembers,
            chama.members.length,
            chama.active,
            chama.currentCycle,
            chama.totalPool,
            chama.totalCollateral
        );
    }

    function getChamaMembers(uint256 _chamaId) external view returns (address[] memory) {
        return chamas[_chamaId].members;
    }

    function getMemberContributions(uint256 _chamaId, address _member) 
        external 
        view 
        returns (Contribution[] memory) 
    {
        return contributions[_chamaId][_member];
    }

    function getCycleInfo(uint256 _chamaId, uint256 _cycle) external view returns (
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

    function getMemberCollateral(uint256 _chamaId, address _member) 
        external 
        view 
        returns (uint256) 
    {
        return chamas[_chamaId].memberCollateral[_member];
    }

    function isCollateralReturned(uint256 _chamaId, address _member) 
        external 
        view 
        returns (bool) 
    {
        return chamas[_chamaId].collateralReturned[_member];
    }

    function getTotalCollateral(uint256 _chamaId) external view returns (uint256) {
        return chamas[_chamaId].totalCollateral;
    }

    function getMemberPayoutPosition(uint256 _chamaId, address _member) 
        external 
        view 
        returns (uint256) 
    {
        if (!chamas[_chamaId].isMember[_member]) revert NotMember();
        return chamas[_chamaId].memberIndex[_member];
    }

    function hasMemberReceivedPayout(uint256 _chamaId, address _member) 
        external 
        view 
        returns (bool) 
    {
        if (!chamas[_chamaId].isMember[_member]) revert NotMember();
        uint256 memberIndex = chamas[_chamaId].memberIndex[_member];
        return chamas[_chamaId].membersPaid[memberIndex];
    }

    // Admin functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function setGamificationContract(address _gamificationContract) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        _grantRole(GAMIFICATION_ROLE, _gamificationContract);
    }
}
