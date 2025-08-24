// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ROSCA.sol";

/**
 * @title ROSCAFactory
 * @dev Factory contract for creating native ETH ROSCA contracts
 */
contract ROSCAFactory is Ownable, ReentrancyGuard {

    /* ============================================================================
                                    STRUCTS & EVENTS
    ============================================================================ */
    
    struct DeployedROSCA {
        address roscaAddress;
        address creator;
        uint256 creationTime;
        string name;
        uint256 contributionAmount;
        uint256 maxMembers;
        bool isActive;
    }

    /* ============================================================================
                                    STATE VARIABLES
    ============================================================================ */
    
    uint256 public totalROSCAsCreated;
    mapping(uint256 => DeployedROSCA) public deployedROSCAs;
    mapping(address => uint256[]) public userROSCAs;
    
    uint256 public creationFee = 0.001 ether; // Fee for creating ROSCAs
    address public feeCollector;

    /* ============================================================================
                                    EVENTS
    ============================================================================ */
    
    event ROSCACreated(
        uint256 indexed roscaId,
        address indexed creator,
        address indexed roscaAddress,
        string name,
        address token,
        uint256 contributionAmount,
        uint256 maxMembers
    );
    
    event ROSCADeactivated(uint256 indexed roscaId, string reason);
    event CreationFeeUpdated(uint256 oldFee, uint256 newFee);

    /* ============================================================================
                                    CONSTRUCTOR
    ============================================================================ */
    
    constructor() Ownable(msg.sender) {
        feeCollector = msg.sender; // Set deployer as initial fee collector
    }

    /* ============================================================================
                                    ROSCA CREATION
    ============================================================================ */
    
    function createROSCA(
        uint256 _contributionAmount,
        uint256 _roundDuration,
        uint256 _maxMembers,
        string memory _roscaName
    ) external payable nonReentrant returns (address) {
        require(msg.value >= creationFee, "Insufficient creation fee");
        require(_maxMembers >= 2, "Need at least 2 members");
        require(_roundDuration >= 1 days, "Round duration too short");
        require(_contributionAmount > 0, "Contribution amount must be > 0");
        require(bytes(_roscaName).length > 0, "ROSCA name cannot be empty");
        require(bytes(_roscaName).length <= 50, "ROSCA name too long");
        
        // Create new ROSCA contract with name
        ROSCA roscaContract = new ROSCA(
            _contributionAmount,
            _roundDuration,
            _maxMembers,
            msg.sender,
            _roscaName
        );
        
        address roscaAddress = address(roscaContract);
        
        // Record the deployment
        uint256 roscaId = totalROSCAsCreated++;
        
        deployedROSCAs[roscaId] = DeployedROSCA({
            roscaAddress: roscaAddress,
            creator: msg.sender,
            creationTime: block.timestamp,
            name: _roscaName, // Use the provided name instead of generating one
            contributionAmount: _contributionAmount,
            maxMembers: _maxMembers,
            isActive: true
        });
        
        userROSCAs[msg.sender].push(roscaId);
        
        // Transfer creation fee
        if (msg.value > 0) {
            (bool success,) = feeCollector.call{value: msg.value}("");
            require(success, "Fee transfer failed");
        }
        
        emit ROSCACreated(
            roscaId,
            msg.sender,
            roscaAddress,
            _roscaName, // Emit the actual name
            address(0), // Native ETH - no token address
            _contributionAmount,
            _maxMembers
        );
        
        return roscaAddress;
    }

    /* ============================================================================
                                    ROSCA MANAGEMENT
    ============================================================================ */
    
    function deactivateROSCA(uint256 _roscaId, string calldata _reason) external {
        DeployedROSCA storage rosca = deployedROSCAs[_roscaId];
        require(rosca.roscaAddress != address(0), "ROSCA not found");
        require(
            rosca.creator == msg.sender || msg.sender == owner(),
            "Not authorized"
        );
        
        rosca.isActive = false;
        
        emit ROSCADeactivated(_roscaId, _reason);
    }

    /* ============================================================================
                                    ADMIN FUNCTIONS
    ============================================================================ */
    
    function updateCreationFee(uint256 _newFee) external onlyOwner {
        uint256 oldFee = creationFee;
        creationFee = _newFee;
        
        emit CreationFeeUpdated(oldFee, _newFee);
    }
    
    function updateFeeCollector(address _newFeeCollector) external onlyOwner {
        require(_newFeeCollector != address(0), "Invalid fee collector");
        feeCollector = _newFeeCollector;
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success,) = owner().call{value: balance}("");
            require(success, "Emergency withdrawal failed");
        }
    }

    /* ============================================================================
                                    VIEW FUNCTIONS
    ============================================================================ */
    
    function getUserROSCAs(address _user) external view returns (uint256[] memory) {
        return userROSCAs[_user];
    }
    
    function getROSCADetails(uint256 _roscaId) external view returns (
        address roscaAddress,
        address creator,
        uint256 creationTime,
        string memory name,
        uint256 contributionAmount,
        uint256 maxMembers,
        bool isActive
    ) {
        DeployedROSCA storage rosca = deployedROSCAs[_roscaId];
        return (
            rosca.roscaAddress,
            rosca.creator,
            rosca.creationTime,
            rosca.name,
            rosca.contributionAmount,
            rosca.maxMembers,
            rosca.isActive
        );
    }
    
    function getActiveROSCACount() public view returns (uint256) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < totalROSCAsCreated; i++) {
            if (deployedROSCAs[i].isActive) {
                activeCount++;
            }
        }
        return activeCount;
    }
    
    function getFactoryStats() external view returns (
        uint256 totalCreated,
        uint256 activeCount,
        uint256 creationFeeAmount
    ) {
        return (
            totalROSCAsCreated,
            getActiveROSCACount(),
            creationFee
        );
    }
    
    /**
     * @dev Search ROSCAs by name (case-insensitive partial match)
     * Note: This is a view function that searches through all ROSCAs
     * For better performance in production, consider using events/indexing
     */
    function searchROSCAsByName(string memory searchTerm) external view returns (
        uint256[] memory matchingIds,
        address[] memory matchingAddresses,
        string[] memory matchingNames
    ) {
        require(bytes(searchTerm).length > 0, "Search term cannot be empty");
        
        // First pass: count matches
        uint256 matchCount = 0;
        for (uint256 i = 0; i < totalROSCAsCreated; i++) {
            if (deployedROSCAs[i].isActive && _containsIgnoreCase(deployedROSCAs[i].name, searchTerm)) {
                matchCount++;
            }
        }
        
        // Second pass: collect matches
        matchingIds = new uint256[](matchCount);
        matchingAddresses = new address[](matchCount);
        matchingNames = new string[](matchCount);
        
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < totalROSCAsCreated; i++) {
            if (deployedROSCAs[i].isActive && _containsIgnoreCase(deployedROSCAs[i].name, searchTerm)) {
                matchingIds[currentIndex] = i;
                matchingAddresses[currentIndex] = deployedROSCAs[i].roscaAddress;
                matchingNames[currentIndex] = deployedROSCAs[i].name;
                currentIndex++;
            }
        }
        
        return (matchingIds, matchingAddresses, matchingNames);
    }
    
    /**
     * @dev Get all active ROSCAs with their names (for browsing)
     */
    function getAllActiveROSCAs() external view returns (
        uint256[] memory ids,
        address[] memory addresses,
        string[] memory names,
        address[] memory creators,
        uint256[] memory creationTimes
    ) {
        uint256 activeCount = getActiveROSCACount();
        
        ids = new uint256[](activeCount);
        addresses = new address[](activeCount);
        names = new string[](activeCount);
        creators = new address[](activeCount);
        creationTimes = new uint256[](activeCount);
        
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < totalROSCAsCreated; i++) {
            if (deployedROSCAs[i].isActive) {
                ids[currentIndex] = i;
                addresses[currentIndex] = deployedROSCAs[i].roscaAddress;
                names[currentIndex] = deployedROSCAs[i].name;
                creators[currentIndex] = deployedROSCAs[i].creator;
                creationTimes[currentIndex] = deployedROSCAs[i].creationTime;
                currentIndex++;
            }
        }
        
        return (ids, addresses, names, creators, creationTimes);
    }
    
    /* ============================================================================
                                    UTILITY FUNCTIONS
    ============================================================================ */
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    /**
     * @dev Helper function for case-insensitive string matching
     * Checks if 'source' contains 'searchTerm' (case-insensitive)
     */
    function _containsIgnoreCase(string memory source, string memory searchTerm) internal pure returns (bool) {
        bytes memory sourceBytes = bytes(source);
        bytes memory searchBytes = bytes(searchTerm);
        
        if (searchBytes.length > sourceBytes.length) {
            return false;
        }
        
        if (searchBytes.length == 0) {
            return true;
        }
        
        // Convert both to lowercase and search
        for (uint256 i = 0; i <= sourceBytes.length - searchBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < searchBytes.length; j++) {
                bytes1 sourceByte = sourceBytes[i + j];
                bytes1 searchByte = searchBytes[j];
                
                // Convert to lowercase
                if (sourceByte >= 0x41 && sourceByte <= 0x5A) {
                    sourceByte = bytes1(uint8(sourceByte) + 32);
                }
                if (searchByte >= 0x41 && searchByte <= 0x5A) {
                    searchByte = bytes1(uint8(searchByte) + 32);
                }
                
                if (sourceByte != searchByte) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }
        }
        
        return false;
    }
    
    // Receive function for creation fees
    receive() external payable {}
}
