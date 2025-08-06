# Jenga - Bitcoin Chama dApp

A modern React-based decentralized application for creating and managing Bitcoin savings circles (Chamas) on the Citrea testnet,
 built with wagmi, viem and Dynamic.

## 🚀 Features

- **Modern Web3 Stack**: Built with wagmi v2 and viem for type-safe Ethereum interactions
- **Social Login**: Dynamic integration for seamless user onboarding with Google, Facebook, etc.
- **Smart Contract Integration**: Direct interaction with Jenga smart contracts
- **Real-time Data**: Live balance and contract state updates
- **Type Safety**: Full TypeScript support with contract ABI types
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Web3**: wagmi v2, viem, Dynamic
- **State Management**: React Query (TanStack Query)
- **UI Components**: Radix UI primitives
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js 18+ and npm
- Dynamic Enviroment ID (for social login)
- Access to Citrea testnet

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cosmasken/jenga
   cd jenga-base
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   VITE_DYNAMIC_ENVIRONMENT_ID=your_web3auth_client_id_here
   ```

## 🔑 Getting Web3Auth Client ID

1. Visit [Dynamic Dashboard](https://app.dynamic.xyz/dashboard/)
2. Create a new project
3. Configure your domain settings:
   - **Development**: `http://localhost:5173`
   - **Production**: Your deployed domain
4. Copy the Enviroment ID to your `.env` file

## 🌐 Network Configuration

The app is configured for **Citrea Testnet**:
- **Chain ID**: 5115
- **RPC URL**: https://rpc.testnet.citrea.xyz
- **Explorer**: https://explorer.testnet.citrea.xyz
- **Currency**: cBTC (Citrea Bitcoin)

### Getting Testnet Funds

Visit the [Citrea Faucet](https://citrea.xyz/faucet) to get testnet cBTC for testing.

## 🚀 Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📱 Usage

### Connecting Your Wallet

1. **Web3Auth (Recommended)**: Click "Connect" to sign in with Google, Facebook, or wallets

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

### Contract Hooks (`src/hooks/useJengaContract.ts`)

Type-safe hooks for contract interactions:
- `useGetChamaInfo(chamaId)` - Get chama details
- `useGetUserChamas(address)` - Get user's chamas
- `useCreateChama()` - Create new chama
- `useJoinChama()` - Join existing chama
- `useContribute()` - Make contributions

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
   vercel --prod
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

## 🔗 Links

- [Citrea Testnet](https://citrea.xyz)
- [ynamic](https://app.dynamic.xyz)
- [wagmi](https://wagmi.sh)
- [viem](https://viem.sh)
- [Radix UI](https://radix-ui.com)