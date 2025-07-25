// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SaccoMembers is AccessControl, Pausable {
    // Member registry and share purchase logic will go here
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }
    // Stub functions matching orchestrator API
    function registerMember() external payable whenNotPaused {}
    function isMember(address user) external view returns (bool) {}
    function getMember(address user) external view returns (address) {}
    function getAllMembers() external view returns (address[] memory) {}
    function purchaseShares(uint256 amount) external payable {}
}
