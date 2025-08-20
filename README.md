# Jenga - Bitcoin Chama dApp

A modern React-based decentralized application for creating and managing Bitcoin savings circles (Chamas) on the Citrea testnet, built with viem and Dynamic Labs for wallet onboarding.

## 🚀 Features

- **Modern Web3 Stack**: Built with viem for type-safe EVM interactions
- **Wallet Onboarding**: Dynamic Labs integration for seamless, multi-wallet onboarding (social + non-custodial)
- **Smart Contract Integration**: Direct interaction with Jenga/ROSCA smart contracts
- **Real-time Data**: Live balance and contract state updates
- **Type Safety**: Full TypeScript support with contract ABI types
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Web3**: viem, Dynamic Labs
- **State Management**: React Query (TanStack Query)
- **UI Components**: Radix UI primitives
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js 18+ and npm
- Dynamic Labs Environment ID
- Access to Citrea testnet

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jenga-base
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` in the project root and add:
   ```env
   VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_env_id
   # Optional, for higher RPC limits (fallback used if missing)
   VITE_BLAST_API_PROJECT_ID=your_blast_project_id
   # Optional, defaults provided for Citrea testnet
   VITE_ROSCA_FACTORY_ADDRESS=0xYourFactoryAddress
   ```

## 🔑 Getting Dynamic Labs Environment ID

1. Visit the Dynamic Labs dashboard
2. Create a new project/environment
3. Configure your allowed domains:
   - **Development**: `http://localhost:5173`
   - **Production**: your deployed domain
4. Copy the Environment ID into `VITE_DYNAMIC_ENVIRONMENT_ID`

## 🌐 Network Configuration

The app is configured for **Citrea Testnet**:
- **Chain ID**: 5115
- **RPC URL**: https://rpc.testnet.citrea.xyz
- **Explorer**: https://explorer.testnet.citrea.xyz
- **Currency**: cBTC (Citrea Bitcoin)

### Getting Testnet Funds

Visit the [Citrea Faucet](https://faucet.testnet.citrea.xyz) to get testnet cBTC for testing.

## 🚀 Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📱 Usage

### Connecting Your Wallet

1. **Dynamic Labs (Recommended)**: Use the Dynamic widget to sign in with social or non-custodial wallets
2. **Injected Wallets**: Connect with MetaMask or other browser wallets (via Dynamic)
3. (Optional) WalletConnect if enabled in your Dynamic configuration

### Creating a Chama

1. Connect your wallet
2. Click "Create Chama" on the dashboard
3. Fill in the chama details:
   - Name
   - Monthly contribution amount (in cBTC)
   - Cycle duration (3-12 months)
   - Maximum members (3-10)
4. Confirm the transaction in your wallet

### Contract Interactions

The app uses wagmi hooks for all contract interactions:

```typescript
// Reading contract data
const { data: userChamas } = useGetUserChamas(address);
const { data: userScore } = useGetUserScore(address);

// Writing to contract
const { createChama, isPending, isConfirmed } = useCreateChama();
```

## 🏗 Architecture

### Dynamic Labs Integration
The app uses Dynamic Labs for authentication and wallet connection. See `src/config/index.ts` for network configuration and `src/hooks/useRosca.ts` for all on-chain interactions using viem.

### Contract Hooks (`src/hooks/useRosca.ts`)

Key functions exposed by the ROSCA hook:
- `createROSCA(token, contributionAmount, roundDuration, maxMembers)`
- `joinROSCA(roscaAddress)`
- `contribute(roscaAddress)`
- `getROSCAInfo(roscaAddress)`
- `getMemberInfo(roscaAddress, member)`
- `getRoundInfo(roscaAddress, roundNumber)`
- `getMembers(roscaAddress)`

### Smart Contract Configuration

```typescript
export const JENGA_CONTRACT = {
  address: '0xbCd9c60030c34dF782eec0249b931851BD941235',
  abi: JengaABI,
} as const;
```

## 🔒 Security Features

- **Type Safety**: Full TypeScript coverage with contract ABI types
- **Transaction Validation**: Pre-flight checks before contract calls
- **Error Handling**: Comprehensive error states and user feedback
- **Secure Storage**: Wagmi's secure storage for wallet connections

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

## 🏗 Building

Build for production:
```bash
npm run build
```

Build for development:
```bash
npm run build:dev
```

## 📦 Deployment

The app can be deployed to any static hosting service:

1. **Vercel** (Recommended)
   ```bash
   npm run build
   # Then deploy the dist/ folder with Vercel or your platform of choice
   ```

2. **Netlify**
   ```bash
   npm run build
   # Upload dist/ folder
   ```

3. **GitHub Pages**
   ```bash
   npm run build
   # Deploy dist/ folder
   ```

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `VITE_DYNAMIC_ENVIRONMENT_ID`
- `VITE_BLAST_API_PROJECT_ID` (optional)
- `VITE_ROSCA_FACTORY_ADDRESS` (optional if defaults are fine)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Dynamic Labs Connection Issues**
   - Verify your Environment ID is correct
   - Check allowed domains in the Dynamic dashboard
   - Ensure you are on the Citrea testnet configuration

2. **Contract Call Failures**
   - Ensure you have sufficient cBTC for gas fees
   - Verify contract address is correct
   - Check if you're connected to Citrea testnet

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check Node.js version (18+ required)

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Join our [Discord](https://discord.gg/your-discord) community
- Read the [wagmi documentation](https://wagmi.sh)

## 🔗 Links

- [Citrea Testnet](https://citrea.xyz)
- Dynamic Labs: https://www.dynamic.xyz/
- viem: https://viem.sh
- Radix UI: https://radix-ui.com
