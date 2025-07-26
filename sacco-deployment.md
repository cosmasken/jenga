# SACCO Modular Deployment Guide

## Overview
The SACCO system is now split into multiple modules for maintainability, upgradability, and to avoid EVM contract size limits. The orchestrator (`Sacco.sol`) delegates logic to these modules.

---

## Deployment Order

### Phase 1: Deploy Module Contracts (Order Not Strict, but Recommended for Clarity)
1. **SaccoMembers.sol**
2. **SaccoShares.sol**
3. **SaccoSavings.sol**
4. **SaccoLoans.sol**
5. **SaccoGovernance.sol**
6. **SaccoDividends.sol**

> _Deploy each as a separate contract. Record their deployed addresses._

### Phase 2: Deploy Orchestrator
7. **Sacco.sol**
   - The constructor requires the addresses of all module contracts and the admin address.

---

## Deployment Steps

1. **Compile All Contracts**
   - Ensure all contracts compile successfully.
   - Example (Hardhat):  
     ```bash
     npx hardhat compile
     ```

2. **Deploy Each Module**
   - Deploy `SaccoMembers`, `SaccoShares`, `SaccoSavings`, `SaccoLoans`, `SaccoGovernance`, and `SaccoDividends` in any order.
   - Example (Hardhat):  
     ```js
     const SaccoMembers = await ethers.getContractFactory("SaccoMembers");
     const members = await SaccoMembers.deploy(adminAddress);
     await members.deployed();
     // Repeat for each module
     ```
   - Save each contract address for the orchestrator.

3. **Deploy the Orchestrator**
   - Deploy `Sacco.sol` with the addresses of all modules and the admin address:
     ```js
     const Sacco = await ethers.getContractFactory("Sacco");
     const sacco = await Sacco.deploy(
       adminAddress,
       members.address,
       shares.address,
       savings.address,
       loans.address,
       governance.address,
       dividends.address
     );
     await sacco.deployed();
     ```

4. **Verify Contracts (Optional but Recommended)**
   - Use Etherscan/Blockscout verification plugins.

5. **Configure Frontend**
   - Update your frontend config to use the new `Sacco.sol` address as the main contract.
   - If needed, expose module addresses for advanced features.

6. **Test End-to-End**
   - Run integration tests and manual checks to ensure all orchestrator functions work as expected.

---

## Summary Table

| Step | Contract           | Constructor Arguments                | Notes                        |
|------|--------------------|--------------------------------------|------------------------------|
| 1    | SaccoMembers       | `adminAddress`                       | Deploy first                 |
| 2    | SaccoShares        | `adminAddress`                       |                              |
| 3    | SaccoSavings       | —                                    |                              |
| 4    | SaccoLoans         | —                                    |                              |
| 5    | SaccoGovernance    | `adminAddress`                       |                              |
| 6    | SaccoDividends     | —                                    |                              |
| 7    | Sacco (orchestrator)| `adminAddress, members, shares, savings, loans, governance, dividends` | Deploy last, wire modules    |

---

## Best Practices
- Use the same admin address for all modules for unified access control.
- Record all deployed addresses and keep them secure.
- Run security checks and verify contract ownership/roles after deployment.
- Document the deployment addresses and transaction hashes for future reference.

---

Would you like a sample deployment script (e.g., for Hardhat or Foundry) as well?
