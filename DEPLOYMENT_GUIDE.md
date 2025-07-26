# Jenga SACCO - Smart Contract Deployment Guide

## 🚀 Overview

This guide provides step-by-step instructions for deploying all Jenga SACCO smart contracts in the correct order and integrating them with the frontend configuration.

## 📋 Prerequisites

### Required Tools
- **Node.js** (v18+)
- **Hardhat** or **Foundry** for deployment
- **Wallet** with sufficient funds for deployment
- **RPC Access** to target blockchain network

### Environment Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Required Environment Variables
```env
# Network Configuration
PRIVATE_KEY=your_deployer_private_key
RPC_URL=https://rpc.testnet.citrea.xyz
CHAIN_ID=5115

# Optional: Block Explorer API Key for verification
EXPLORER_API_KEY=your_explorer_api_key

# Gas Configuration
GAS_PRICE=20000000000  # 20 gwei
GAS_LIMIT=8000000
```

---

## 📦 Contract Dependencies & Deployment Order

### Phase 1: Core Infrastructure Contracts
These contracts have no dependencies and can be deployed independently.

#### 1.1 **ChamaCore.sol** (Independent)
```solidity
// No constructor dependencies
// Deploys standalone chama functionality
```

#### 1.2 **ChamaGamification.sol** (Independent)
```solidity
// No constructor dependencies
// Deploys gamification system
```

#### 1.3 **P2PTransfer.sol** (Independent)
```solidity
// No constructor dependencies
// Deploys P2P transfer functionality
```

#### 1.4 **Sacco.sol** (Independent)
```solidity
// No constructor dependencies
// Deploys SACCO governance system
```

### Phase 2: Factory Contract
This contract depends on Phase 1 contracts.

#### 2.1 **JengaFactory.sol** (Depends on: ChamaCore, ChamaGamification, P2PTransfer)
```solidity
constructor(
    address _chamaCoreAddress,
    address _chamaGamificationAddress,
    address _p2pTransferAddress
)
```

### Phase 3: Legacy Contract (Optional)
#### 3.1 **Jenga.sol** (Monolithic - Optional)
```solidity
// Legacy contract - can be deployed independently
// Contains all functionality in one contract
// Use either this OR the modular approach (Phase 1 + 2)
```

---

## 🔧 Deployment Scripts

### Hardhat Deployment Script

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Jenga SACCO Deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const deployedContracts = {};

  // PHASE 1: Deploy Core Infrastructure Contracts
  console.log("\n📦 PHASE 1: Deploying Core Infrastructure...");

  // 1.1 Deploy ChamaCore
  console.log("Deploying ChamaCore...");
  const ChamaCore = await hre.ethers.getContractFactory("ChamaCore");
  const chamaCore = await ChamaCore.deploy();
  await chamaCore.deployed();
  deployedContracts.chamaCore = chamaCore.address;
  console.log("✅ ChamaCore deployed to:", chamaCore.address);

  // 1.2 Deploy ChamaGamification
  console.log("Deploying ChamaGamification...");
  const ChamaGamification = await hre.ethers.getContractFactory("ChamaGamification");
  const chamaGamification = await ChamaGamification.deploy();
  await chamaGamification.deployed();
  deployedContracts.chamaGamification = chamaGamification.address;
  console.log("✅ ChamaGamification deployed to:", chamaGamification.address);

  // 1.3 Deploy P2PTransfer
  console.log("Deploying P2PTransfer...");
  const P2PTransfer = await hre.ethers.getContractFactory("P2PTransfer");
  const p2pTransfer = await P2PTransfer.deploy();
  await p2pTransfer.deployed();
  deployedContracts.p2pTransfer = p2pTransfer.address;
  console.log("✅ P2PTransfer deployed to:", p2pTransfer.address);

  // 1.4 Deploy SACCO
  console.log("Deploying SACCO...");
  const SACCO = await hre.ethers.getContractFactory("SACCO");
  const sacco = await SACCO.deploy();
  await sacco.deployed();
  deployedContracts.sacco = sacco.address;
  console.log("✅ SACCO deployed to:", sacco.address);

  // PHASE 2: Deploy Factory Contract
  console.log("\n🏭 PHASE 2: Deploying Factory Contract...");

  // 2.1 Deploy JengaFactory
  console.log("Deploying JengaFactory...");
  const JengaFactory = await hre.ethers.getContractFactory("JengaFactory");
  const jengaFactory = await JengaFactory.deploy(
    chamaCore.address,
    chamaGamification.address,
    p2pTransfer.address
  );
  await jengaFactory.deployed();
  deployedContracts.jengaFactory = jengaFactory.address;
  console.log("✅ JengaFactory deployed to:", jengaFactory.address);

  // PHASE 3: Deploy Legacy Contract (Optional)
  console.log("\n📜 PHASE 3: Deploying Legacy Contract (Optional)...");

  // 3.1 Deploy Jenga (Legacy)
  console.log("Deploying Jenga (Legacy)...");
  const Jenga = await hre.ethers.getContractFactory("Jenga");
  const jenga = await Jenga.deploy();
  await jenga.deployed();
  deployedContracts.jenga = jenga.address;
  console.log("✅ Jenga (Legacy) deployed to:", jenga.address);

  // Display deployment summary
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=====================================");
  console.log("📋 Contract Addresses:");
  console.log("=====================================");
  Object.entries(deployedContracts).forEach(([name, address]) => {
    console.log(`${name.padEnd(20)}: ${address}`);
  });

  // Generate config update
  console.log("\n📝 Configuration Update:");
  console.log("Update src/config.ts with these addresses:");
  console.log("=====================================");
  console.log(`smartContracts: {`);
  console.log(`  chamaCore: '${deployedContracts.chamaCore}',`);
  console.log(`  chamaGamification: '${deployedContracts.chamaGamification}',`);
  console.log(`  p2pTransfer: '${deployedContracts.p2pTransfer}',`);
  console.log(`  jengaFactory: '${deployedContracts.jengaFactory}',`);
  console.log(`  sacco: '${deployedContracts.sacco}',`);
  console.log(`  jenga: '${deployedContracts.jenga}', // Legacy`);
  console.log(`},`);

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployedContracts,
    gasUsed: {
      // Add gas tracking if needed
    }
  };

  fs.writeFileSync(
    `deployments/${hre.network.name}-deployment.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\n💾 Deployment info saved to: deployments/${hre.network.name}-deployment.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
```

### Foundry Deployment Script

Create `script/Deploy.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/contracts/ChamaCore.sol";
import "../src/contracts/ChamaGamification.sol";
import "../src/contracts/P2PTransfer.sol";
import "../src/contracts/SACCO.sol";
import "../src/contracts/JengaFactory.sol";
import "../src/contracts/Jenga.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("🚀 Starting Jenga SACCO Deployment...");

        // PHASE 1: Deploy Core Infrastructure
        console.log("📦 PHASE 1: Deploying Core Infrastructure...");
        
        ChamaCore chamaCore = new ChamaCore();
        console.log("✅ ChamaCore deployed to:", address(chamaCore));

        ChamaGamification chamaGamification = new ChamaGamification();
        console.log("✅ ChamaGamification deployed to:", address(chamaGamification));

        P2PTransfer p2pTransfer = new P2PTransfer();
        console.log("✅ P2PTransfer deployed to:", address(p2pTransfer));

        SACCO sacco = new SACCO();
        console.log("✅ SACCO deployed to:", address(sacco));

        // PHASE 2: Deploy Factory
        console.log("🏭 PHASE 2: Deploying Factory Contract...");
        
        JengaFactory jengaFactory = new JengaFactory(
            address(chamaCore),
            address(chamaGamification),
            address(p2pTransfer)
        );
        console.log("✅ JengaFactory deployed to:", address(jengaFactory));

        // PHASE 3: Deploy Legacy (Optional)
        console.log("📜 PHASE 3: Deploying Legacy Contract...");
        
        Jenga jenga = new Jenga();
        console.log("✅ Jenga (Legacy) deployed to:", address(jenga));

        vm.stopBroadcast();

        // Output configuration
        console.log("\n📝 Update src/config.ts with these addresses:");
        console.log("smartContracts: {");
        console.log("  chamaCore: '%s',", address(chamaCore));
        console.log("  chamaGamification: '%s',", address(chamaGamification));
        console.log("  p2pTransfer: '%s',", address(p2pTransfer));
        console.log("  jengaFactory: '%s',", address(jengaFactory));
        console.log("  sacco: '%s',", address(sacco));
        console.log("  jenga: '%s', // Legacy", address(jenga));
        console.log("},");
    }
}
```

---

## 🔧 Deployment Commands

### Using Hardhat

```bash
# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to Citrea Testnet
npx hardhat run scripts/deploy.js --network citrea-testnet

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Verify contracts (optional)
npx hardhat verify --network citrea-testnet <CONTRACT_ADDRESS>
```

### Using Foundry

```bash
# Deploy to local network
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# Deploy to Citrea Testnet
forge script script/Deploy.s.sol --rpc-url https://rpc.testnet.citrea.xyz --broadcast --verify

# Deploy to mainnet
forge script script/Deploy.s.sol --rpc-url <MAINNET_RPC> --broadcast --verify
```

---

## ⚙️ Configuration Integration

### 1. Update `src/config.ts`

After successful deployment, update the configuration file:

```typescript
export const citreaTestnet = {
  id: 5115,
  name: 'Citrea Testnet',
  network: 'citrea-testnet',
  nativeCurrency: {
    decimals: 8,
    name: 'Citrea Bitcoin',
    symbol: 'cBTC',
  },
  rpcUrls: {
    public: { http: ['https://rpc.testnet.citrea.xyz'] },
    default: { http: ['https://rpc.testnet.citrea.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.testnet.citrea.xyz' },
  },
  smartContracts: {
    // UPDATE THESE ADDRESSES AFTER DEPLOYMENT
    chamaCore: '0x1234567890123456789012345678901234567890',
    chamaGamification: '0x2345678901234567890123456789012345678901',
    p2pTransfer: '0x3456789012345678901234567890123456789012',
    jengaFactory: '0x4567890123456789012345678901234567890123',
    sacco: '0x5678901234567890123456789012345678901234',
    jenga: '0x6789012345678901234567890123456789012345', // Legacy (optional)
  },
} as const;
```

### 2. Update Contract TypeScript Files

Update each contract file with the deployed addresses:

#### `src/contracts/sacco-contract.ts`
```typescript
import { Address } from 'viem';
import { TESTNET_CONFIG } from '../config';
import SACCOABI from '../abi/Sacco.json';

export const SACCO_CONTRACT = {
  address: TESTNET_CONFIG.smartContracts.sacco as Address,
  abi: SACCOABI,
} as const;
```

#### `src/contracts/jenga-factory-contract.ts`
```typescript
import { Address } from 'viem';
import { TESTNET_CONFIG } from '../config';
import JENGAFACTORYABI from '../abi/JengaFactory.json';

export const JENGA_FACTORY_CONTRACT = {
  address: TESTNET_CONFIG.smartContracts.jengaFactory as Address,
  abi: JENGAFACTORYABI,
} as const;
```

### 3. Environment Variables for Production

Create production environment file `.env.production`:

```env
# Production Network Configuration
VITE_CHAIN_ID=5115
VITE_RPC_URL=https://rpc.testnet.citrea.xyz
VITE_EXPLORER_URL=https://explorer.testnet.citrea.xyz

# Contract Addresses (from deployment)
VITE_CHAMA_CORE_ADDRESS=0x1234567890123456789012345678901234567890
VITE_CHAMA_GAMIFICATION_ADDRESS=0x2345678901234567890123456789012345678901
VITE_P2P_TRANSFER_ADDRESS=0x3456789012345678901234567890123456789012
VITE_JENGA_FACTORY_ADDRESS=0x4567890123456789012345678901234567890123
VITE_SACCO_ADDRESS=0x5678901234567890123456789012345678901234
VITE_JENGA_ADDRESS=0x6789012345678901234567890123456789012345

# Web3Auth Configuration
VITE_WEB3AUTH_CLIENT_ID=your_production_client_id
VITE_WEB3AUTH_NETWORK=testnet
```

---

## 🧪 Post-Deployment Testing

### 1. Contract Verification

Verify all contracts are deployed correctly:

```bash
# Check contract code
cast code <CONTRACT_ADDRESS> --rpc-url https://rpc.testnet.citrea.xyz

# Check contract owner/admin
cast call <CONTRACT_ADDRESS> "owner()" --rpc-url https://rpc.testnet.citrea.xyz
```

### 2. Integration Testing

Test contract interactions:

```bash
# Test SACCO contract
cast call <SACCO_ADDRESS> "MINIMUM_SHARES()" --rpc-url https://rpc.testnet.citrea.xyz

# Test JengaFactory
cast call <FACTORY_ADDRESS> "chamaCore()" --rpc-url https://rpc.testnet.citrea.xyz
```

### 3. Frontend Integration Test

```bash
# Start development server
npm run dev

# Test wallet connection
# Test contract interactions
# Verify all features work correctly
```

---

## 🔒 Security Checklist

### Pre-Deployment Security
- [ ] All contracts compiled without warnings
- [ ] OpenZeppelin dependencies up to date
- [ ] ReentrancyGuard implemented on payable functions
- [ ] Access control properly configured
- [ ] Input validation implemented
- [ ] Gas limits tested

### Post-Deployment Security
- [ ] Contract ownership transferred to multisig (if applicable)
- [ ] Admin roles properly configured
- [ ] Emergency pause mechanisms tested
- [ ] Contract verification completed
- [ ] Deployment addresses documented securely

---

## 📊 Gas Estimation

### Estimated Gas Costs (Citrea Testnet)

| Contract | Deployment Gas | Estimated Cost (20 gwei) |
|----------|----------------|--------------------------|
| ChamaCore | ~2,500,000 | ~0.05 ETH |
| ChamaGamification | ~1,800,000 | ~0.036 ETH |
| P2PTransfer | ~1,600,000 | ~0.032 ETH |
| SACCO | ~3,200,000 | ~0.064 ETH |
| JengaFactory | ~2,000,000 | ~0.04 ETH |
| Jenga (Legacy) | ~4,500,000 | ~0.09 ETH |
| **Total** | **~15,600,000** | **~0.312 ETH** |

### Gas Optimization Tips
- Deploy during low network congestion
- Use CREATE2 for deterministic addresses
- Consider proxy patterns for upgradability
- Batch multiple operations when possible

---

## 🚨 Troubleshooting

### Common Deployment Issues

#### 1. **Out of Gas Error**
```bash
# Increase gas limit
--gas-limit 8000000
```

#### 2. **Nonce Too Low**
```bash
# Reset nonce
cast nonce <YOUR_ADDRESS> --rpc-url <RPC_URL>
```

#### 3. **Contract Size Too Large**
```bash
# Enable optimizer in hardhat.config.js
optimizer: {
  enabled: true,
  runs: 200
}
```

#### 4. **Constructor Parameter Error**
- Verify constructor parameters match contract requirements
- Check address format (checksummed)
- Ensure dependent contracts are deployed first

### Recovery Procedures

#### Failed Deployment
1. Check transaction hash for error details
2. Verify account balance and nonce
3. Retry with higher gas limit
4. Check network connectivity

#### Partial Deployment
1. Note successfully deployed contracts
2. Update deployment script to skip completed deployments
3. Continue from failed point
4. Update configuration incrementally

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Deployer account funded
- [ ] Network configuration verified
- [ ] Contract compilation successful
- [ ] Dependencies installed

### During Deployment
- [ ] Monitor gas prices
- [ ] Save transaction hashes
- [ ] Verify each deployment step
- [ ] Note contract addresses
- [ ] Check deployment logs

### Post-Deployment
- [ ] Update configuration files
- [ ] Verify contracts on explorer
- [ ] Test contract interactions
- [ ] Update frontend configuration
- [ ] Document deployment details
- [ ] Backup deployment information

---

## 📋 Deployment Summary Template

```markdown
# Deployment Summary

**Network**: Citrea Testnet
**Date**: 2025-01-XX
**Deployer**: 0x...
**Total Gas Used**: X,XXX,XXX
**Total Cost**: X.XXX ETH

## Contract Addresses
- ChamaCore: 0x...
- ChamaGamification: 0x...
- P2PTransfer: 0x...
- SACCO: 0x...
- JengaFactory: 0x...
- Jenga (Legacy): 0x...

## Transaction Hashes
- ChamaCore: 0x...
- ChamaGamification: 0x...
- P2PTransfer: 0x...
- SACCO: 0x...
- JengaFactory: 0x...
- Jenga (Legacy): 0x...

## Verification Status
- [ ] All contracts verified on explorer
- [ ] Frontend integration tested
- [ ] Basic functionality confirmed
```

---

**🎉 Congratulations! Your Jenga SACCO contracts are now deployed and ready for use.**

For support or questions, refer to the main documentation or create an issue in the project repository.
