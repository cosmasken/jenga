# Jenga ROSCA Smart Contracts

This directory contains the smart contracts for the Jenga Bitcoin Chama dApp, specifically the ROSCA (Rotating Savings and Credit Association) contract implementation for Citrea testnet.

## 🏗 Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Access to Citrea testnet

### Installation
```bash
npm install
```

### Environment Configuration
Copy and configure the environment file:
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
# Deployment Configuration
PRIVATE_KEY=your_private_key_here
CITREA_RPC_URL=https://rpc.testnet.citrea.xyz
GAS_PRICE=20000000000
GAS_LIMIT=8000000
```

**⚠️ Security Warning**: Never commit real private keys to version control. Use test keys only.

## 📋 Available Scripts

### Compilation
```bash
npm run compile
```

### Testing
```bash
npm run test
```

### Deployment
```bash
# Deploy to Citrea testnet
npm run deploy

# Deploy to local Hardhat network
npm run deploy:local
```

### Other Commands
```bash
# Clean artifacts
npm run clean

# Start local Hardhat node
npm run node

# Verify contract on explorer (after deployment)
npm run verify <CONTRACT_ADDRESS>
```

## 📁 Project Structure

```
contracts/
├── contracts/
│   └── Rosca.sol          # Main ROSCA contract
├── scripts/
│   └── deploy.js          # Deployment script
├── test/
│   └── ROSCA.test.js      # Contract tests
├── hardhat.config.js      # Hardhat configuration
├── package.json           # Dependencies and scripts
└── .env                   # Environment variables
```

## 🚀 Deployment Process

The deployment script (`scripts/deploy.js`) will:

1. **Validate Environment**: Check private key and network connectivity
2. **Deploy Contract**: Deploy ROSCA contract to Citrea testnet
3. **Verify Deployment**: Test contract functionality
4. **Update Frontend**: Automatically update the contract address in `../src/config.ts`
5. **Save Deployment Info**: Store deployment details in `deployments.json`

### Deployment Output
After successful deployment, you'll see:
```
✅ ROSCA contract deployed to: 0x...
📄 Deployment info saved to: deployments.json
🎉 Deployment completed successfully!

📋 Summary:
- Contract Address: 0x...
- Network: Citrea Testnet (Chain ID: 5115)
- Explorer: https://explorer.testnet.citrea.xyz/address/0x...
- Frontend config updated automatically
```

## 🧪 Testing

The test suite covers:
- ✅ Contract deployment
- ✅ Group creation and validation
- ✅ Member joining and management
- ✅ Access control and permissions
- ✅ Error handling and edge cases

Run tests with:
```bash
npm run test
```

## 🔧 Contract Features

### Core Functionality
- **Group Creation**: Create ROSCA groups with customizable parameters
- **Member Management**: Join, leave, and manage group members
- **Contribution Tracking**: Track member contributions per round
- **Dispute Resolution**: Built-in dispute mechanism
- **Access Control**: Creator-only administrative functions

### Security Features
- **Input Validation**: Comprehensive parameter validation
- **Access Control**: Role-based permissions
- **Reentrancy Protection**: Built-in security measures
- **Gas Optimization**: Optimized for low gas usage

## 🌐 Network Configuration

### Citrea Testnet
- **Chain ID**: 5115
- **RPC URL**: https://rpc.testnet.citrea.xyz
- **Explorer**: https://explorer.testnet.citrea.xyz
- **Faucet**: https://citrea.xyz/faucet
- **Currency**: cBTC (Citrea Bitcoin)

## 📊 Gas Usage

| Function | Gas Usage |
|----------|-----------|
| Deploy | ~1,662,827 |
| createGroup | ~250,871 |
| joinGroup | ~131,313 |
| setGroupStatus | ~28,426 |
| kickMember | ~40,886 |

## 🔍 Contract Verification

After deployment, verify your contract on the Citrea explorer:
```bash
npm run verify <CONTRACT_ADDRESS>
```

## 🐛 Troubleshooting

### Common Issues

1. **"Stack too deep" compilation error**
   - Solution: The config uses `viaIR: true` to resolve this

2. **"Insufficient funds" deployment error**
   - Solution: Fund your account from the [Citrea faucet](https://citrea.xyz/faucet)

3. **"Network connection" errors**
   - Solution: Check your RPC URL and network connectivity

4. **"Private key" errors**
   - Solution: Ensure your `.env` file has a valid private key

### Getting Help

- Check the [Hardhat documentation](https://hardhat.org/docs)
- Visit the [Citrea documentation](https://citrea.xyz/docs)
- Review the contract tests for usage examples

## 📄 License

MIT License - see the main project LICENSE file for details.
