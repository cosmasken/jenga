# Jenga Contract Deployment Guide

## Prerequisites

1. Install Hardhat or Foundry for contract deployment
2. Set up Citrea testnet RPC in your deployment configuration
3. Fund your deployer wallet with testnet cBTC

## Deployment Order

Deploy contracts in this specific order due to dependencies:

### 1. Deploy JengaRegistry
```bash
# This contract manages user profiles and reputation
# No constructor parameters needed
```

### 2. Deploy SaccoFactory
```bash
# Constructor parameter: JengaRegistry address from step 1
# Example: constructor(0x123...abc)
```

### 3. Deploy StackingVault
```bash
# No constructor parameters needed
```

### 4. Deploy P2PTransfers
```bash
# No constructor parameters needed
```

### 5. Deploy MultiSignWallet
```bash
# Constructor parameters: owners array, required confirmations
# Example: constructor([0x123...abc, 0x456...def], 2)
```

## Post-Deployment Steps

1. Update `src/config.ts` with deployed contract addresses:
```typescript
export const CONTRACT_ADDRESSES = {
  JENGA_REGISTRY: '0xYOUR_DEPLOYED_REGISTRY_ADDRESS',
  SACCO_FACTORY: '0xYOUR_DEPLOYED_SACCO_FACTORY_ADDRESS',
  STACKING_VAULT: '0xYOUR_DEPLOYED_STACKING_VAULT_ADDRESS',
  P2P_TRANSFERS: '0xYOUR_DEPLOYED_P2P_TRANSFERS_ADDRESS',
  MULTISIG: '0xYOUR_DEPLOYED_MULTISIG_ADDRESS',
} as const;
```

2. Set SaccoFactory as authorized contract in JengaRegistry:
```solidity
// Call this on JengaRegistry contract
setAuthorizedContract(SACCO_FACTORY_ADDRESS, true)
```

3. Test contract interactions through the frontend

## Citrea Testnet Configuration

- RPC URL: https://rpc.testnet.citrea.xyz
- Chain ID: 5115
- Explorer: https://explorer.testnet.citrea.xyz
- Native Token: cBTC (18 decimals)

## Verification

After deployment, verify contracts on Citrea explorer for transparency and easier interaction.
