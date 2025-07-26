// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../JengaModular.sol";

contract DeployModular {
    event DeploymentCompleted(
        address jengaModular,
        address jengaCore,
        address inviteSystem,
        address p2pSystem,
        address redEnvelopeSystem
    );

    function deployAll() public returns (
        address jengaModular,
        address jengaCore,
        address inviteSystem,
        address p2pSystem,
        address redEnvelopeSystem
    ) {
        // Deploy main contract
        JengaModular jenga = new JengaModular();
        
        // Initialize modules
        jenga.initializeModules();
        
        // Get module addresses
        (jengaCore, inviteSystem, p2pSystem, redEnvelopeSystem) = jenga.getModuleAddresses();
        
        emit DeploymentCompleted(
            address(jenga),
            jengaCore,
            inviteSystem,
            p2pSystem,
            redEnvelopeSystem
        );
        
        return (
            address(jenga),
            jengaCore,
            inviteSystem,
            p2pSystem,
            redEnvelopeSystem
        );
    }
}
