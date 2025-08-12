// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./ChamaCircle.sol";

contract ChamaFactory {
    using Clones for address;

    address public immutable implementation;
    uint256 public chamaCounter;

    event ChamaCreated(
        uint256 indexed id,
        address indexed creator,
        address indexed chama,
        address token,
        uint256 contribution,
        uint256 securityDeposit,
        uint256 roundDuration,
        uint256 lateWindow,
        uint256 latePenalty,
        uint256 memberTarget
    );

    constructor() {
        implementation = address(new ChamaCircle());
    }

    /// @notice Create a new chama (creator is automatically member #1).
    function createChama(
        IERC20  token,
        uint256 contribution,   // raw amount
        uint256 securityDeposit,
        uint256 roundDuration,  // seconds
        uint256 lateWindow,     // seconds after contributionDeadline
        uint256 latePenalty,    // raw amount to add
        uint256 memberTarget    // max members
    ) external payable returns (address chama) {
        require(memberTarget > 1, "Need >1 member");

        chama = implementation.clone();
        ChamaCircle(payable(chama)).initialize{value: msg.value}(
            msg.sender,
            token,
            contribution,
            securityDeposit,
            roundDuration,
            lateWindow,
            latePenalty,
            memberTarget
        );

        emit ChamaCreated(
            ++chamaCounter,
            msg.sender,
            chama,
            address(token),
            contribution,
            securityDeposit,
            roundDuration,
            lateWindow,
            latePenalty,
            memberTarget
        );
    }
}