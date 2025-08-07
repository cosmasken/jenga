# Jenga - Bitcoin Chama dApp

A modern React-based decentralized application for creating and managing Bitcoin savings circles (Chamas) on the Citrea testnet. Built with React, TypeScript, and Dynamic wallet integration.

## 🚀 Features

- **Modern Web3 Stack**: Built with Dynamic SDK and viem for type-safe blockchain interactions
- **Social Login**: Dynamic integration for seamless user onboarding with Google, Discord, GitHub, and Twitter
- **ROSCA Smart Contracts**: Direct interaction with ROSCA (Rotating Savings and Credit Association) smart contracts
- **Unit Display Toggle**: Switch between cBTC and satoshi display units
- **Real-time Data**: Live balance and contract state updates
- **Type Safety**: Full TypeScript support with contract ABI types
- **Responsive Design**: Mobile-first UI with Tailwind CSS and Radix UI
- **Error Handling**: Comprehensive error management and user feedback
- **Security**: Environment files and sensitive data protection

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Web3**: Dynamic SDK, viem
- **State Management**: React Query (TanStack Query), Zustand
- **UI Components**: Radix UI primitives, custom components
- **Database**: Supabase (for user profiles and notifications)
- **Build Tool**: Vite
- **Animations**: Framer Motion
- **Routing**: Wouter

## 📋 Prerequisites

- Node.js 18+ and npm
- Dynamic Environment ID (for wallet integration)
- Supabase project (for user data)
- Access to Citrea testnet

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cosmasken/jenga
   cd jenga
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
   # Dynamic Wallet Integration
   VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id
   
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 🔑 Configuration Setup

### Dynamic Wallet Setup
1. Visit [Dynamic Dashboard](https://app.dynamic.xyz/dashboard/)
2. Create a new project
3. Configure your domain settings:
   - **Development**: `http://localhost:5173`
   - **Production**: Your deployed domain
4. Copy the Environment ID to your `.env` file

### Supabase Setup
1. Create a [Supabase](https://supabase.com) project
2. Get your project URL and anon key from the API settings
3. Add them to your `.env` file

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

The app uses the `useRosca` hook for all smart contract interactions:

```typescript
import { useRosca } from '@/hooks/useRosca';

function MyComponent() {
  const {
    // State
    isConnected,
    balance,
    isLoading,
    error,
    
    // Core operations
    createGroup,
    joinGroup,
    contribute,
    leaveGroup,
    
    // View functions
    getGroupInfo,
    getGroupCount,
    isGroupMember,
    isGroupCreator,
    
    // Utilities
    formatContribution,
    getBalance,
  } = useRosca();

  // Create a new ROSCA group
  const handleCreateGroup = async () => {
    try {
      const hash = await createGroup(
        "My Chama",           // group name
        parseEther("0.1"),    // contribution amount in wei
        30 * 24 * 60 * 60,   // round length in seconds (30 days)
        10                    // max members
      );
      console.log('Group created:', hash);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  // Join an existing group
  const handleJoinGroup = async (groupId: number) => {
    try {
      const hash = await joinGroup(groupId);
      console.log('Joined group:', hash);
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  return (
    <div>
      <p>Balance: {balance} cBTC</p>
      <button onClick={handleCreateGroup} disabled={!isConnected}>
        Create Group
      </button>
    </div>
  );
}
```

## 🏠 Architecture

### ROSCA Hook (`src/hooks/useRosca.ts`)

Comprehensive hook for ROSCA contract interactions:

**State Management:**
- `isConnected` - Check if wallet is connected
- `balance` - User's current cBTC balance
- `isLoading` - Loading state for operations
- `error` - Error state with detailed messages

**Core Group Operations:**
- `createGroup(name, contribution, roundLength, maxMembers)` - Create new ROSCA group
- `joinGroup(groupId)` - Join existing group
- `contribute(groupId)` - Make contribution to group
- `leaveGroup(groupId)` - Leave group (if allowed)
- `rageQuit(groupId)` - Emergency exit from group

**Group Management (Creator Only):**
- `setGroupStatus(groupId, isActive)` - Activate/deactivate group
- `kickMember(groupId, member)` - Remove member from group

**View Functions:**
- `getGroupInfo(groupId)` - Get detailed group information
- `getGroupCount()` - Get total number of groups
- `isGroupMember(groupId)` - Check membership status
- `isGroupCreator(groupId)` - Check creator status

**Utility Functions:**
- `formatContribution(amount)` - Format amounts with unit display
- `getBalance()` - Refresh user balance
- `getMaxSpendableAmount()` - Get max spendable amount (minus gas)

### Smart Contract Configuration

```typescript
// From src/config.ts
export const CONTRACT_ADDRESSES = {
  ROSCA: '0xB7AdF792C054976E1F40B45CB768f6D09E42358A' as Address,
} as const;

// Network configuration
export const citreaTestnet = defineChain({
  id: 5115,
  name: 'Citrea Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Citrea Bitcoin',
    symbol: 'cBTC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.citrea.xyz'] },
  },
});
```

### Unit Display System

The app includes a unit display system for switching between cBTC and satoshis:

```typescript
import { useUnitDisplay } from '@/contexts/UnitDisplayContext';
import { formatAmount } from '@/lib/unitConverter';

function AmountDisplay({ amount }: { amount: bigint }) {
  const { displayUnit, setDisplayUnit } = useUnitDisplay();
  
  return (
    <div>
      <p>{formatAmount(amount, displayUnit)}</p>
      <button onClick={() => setDisplayUnit(displayUnit === 'cBTC' ? 'satoshi' : 'cBTC')}>
        Switch to {displayUnit === 'cBTC' ? 'Satoshi' : 'cBTC'}
      </button>
    </div>
  );
}
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/              # Radix UI components
│   ├── CreateChamaModal.tsx
│   ├── JoinChamaModal.tsx
│   └── ...
├── contexts/           # React contexts
│   └── UnitDisplayContext.tsx
├── hooks/              # Custom React hooks
│   ├── useRosca.ts     # Main contract interaction hook
│   ├── useSupabase.ts  # Supabase integration
│   └── ...
├── lib/                # Utility functions
│   └── unitConverter.ts # cBTC/satoshi conversion
├── pages/              # Page components
│   ├── dashboard.tsx
│   ├── browse-chamas.tsx
│   └── ...
├── config.ts           # App configuration
└── main.tsx            # App entry point
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
- [Dynamic](https://app.dynamic.xyz)
- [viem](https://viem.sh)
- [Radix UI](https://radix-ui.com)
- [Supabase](https://supabase.com)
- [Framer Motion](https://www.framer.com/motion/)
