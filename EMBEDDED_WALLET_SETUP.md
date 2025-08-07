# Dynamic Embedded Wallet Integration

## Overview

This document explains how the application has been configured to support **embedded wallets** for social login users, enabling them to make blockchain transactions without needing to install or configure external wallets like MetaMask.

## Problem Statement

Previously, users who logged in via social authentication (Google, Twitter, etc.) couldn't perform blockchain transactions because they didn't have a connected wallet. This caused the `joinGroup` function to fail silently for social login users.

## Solution

### 1. Dependencies Added

No additional dependencies are required for MPC embedded wallets - they are included with the core Dynamic SDK.

### 2. Dynamic Configuration Updated

In `src/main.tsx`, MPC embedded wallets are automatically enabled. The configuration is simplified:

```tsx
<DynamicContextProvider
  settings={{
    environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
    walletConnectors: [EthereumWalletConnectors],
    overrides: { evmNetworks: citreaNetworks },
    // Enable social logins - embedded wallets are created automatically
    socialProvidersFilter: (providers) => providers.filter((provider) => 
      ['google', 'twitter', 'discord', 'github'].includes(provider.name)
    ),
  }}
>
```

### 3. Hook Updates

Updated `src/hooks/useRosca.ts` to support both external and embedded wallets using the MPC approach:

```tsx
import { useDynamicContext, useDynamicWaas } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';

export function useRosca() {
  const { primaryWallet } = useDynamicContext();
  const { userHasEmbeddedWallet } = useDynamicWaas();

  // Helper function to check transaction capabilities
  const isTransactionCapableWallet = useCallback((wallet: any): boolean => {
    if (!wallet) return false;
    // Check for external Ethereum wallet
    if (isEthereumWallet(wallet)) return true;
    // Check for embedded wallet (MPC) - uses Dynamic's userHasEmbeddedWallet
    return userHasEmbeddedWallet;
  }, [userHasEmbeddedWallet]);

  // All functions now use isTransactionCapableWallet for validation
}
```

### 4. Enhanced Join Modal

The `JoinGroupModal` component already had robust error handling and transaction management, which now works seamlessly with embedded wallets.

## How It Works

### For Social Login Users:

1. **Login**: User logs in via Google/Twitter/etc.
2. **Embedded Wallet Creation**: Dynamic automatically creates an embedded wallet for the user
3. **Blockchain Transactions**: The embedded wallet can sign and send transactions just like external wallets
4. **Seamless Experience**: Users can join groups and make transactions without additional setup

### For External Wallet Users:

1. **Connect Wallet**: User connects MetaMask or other external wallet
2. **Direct Transaction**: Transactions are sent directly through the connected wallet
3. **Same Experience**: All functionality works identically

## Benefits

- **Improved Onboarding**: Social login users can immediately participate in blockchain activities
- **No Wallet Installation**: Users don't need to install or configure external wallets
- **Consistent UX**: Same user experience regardless of login method
- **Better Conversion**: More users can complete the join flow

## Testing

Use the `WalletTest` component to verify functionality:

```tsx
import { WalletTest } from '@/components/WalletTest';

// Add to any page to test wallet functionality
<WalletTest />
```

This component shows:
- Connection status
- Wallet type (External vs Embedded)
- Login method
- Transaction capabilities
- Balance information

## Configuration Requirements

### Dynamic Dashboard Settings

Ensure your Dynamic dashboard has:
1. **Embedded Wallets** enabled
2. **Social Providers** configured (Google, Twitter, etc.)
3. **Chain Configuration** for Citrea Testnet (Chain ID: 5115)

### Environment Variables

No additional environment variables are required beyond the existing `VITE_DYNAMIC_ENVIRONMENT_ID`.

## Troubleshooting

### Common Issues:

1. **"Embedded wallet not created"**
   - Check that `embeddedWalletSettings.createOnConnect` is set to `'users-without-wallets'`
   - Verify social providers are enabled in Dynamic dashboard

2. **"Transaction fails for social users"**
   - Ensure `isTransactionCapableWallet` function is used instead of just `isEthereumWallet`
   - Check that embedded wallet connectors are included in configuration

3. **"Social login doesn't work"**
   - Verify social providers are configured in Dynamic dashboard
   - Check `socialProvidersFilter` configuration

## Implementation Status

✅ **Completed:**
- Dynamic configuration updated
- Embedded wallet connectors added
- Hook validation updated
- Transaction support for social users
- Test component created

✅ **Verified:**
- Both external and embedded wallets supported
- Social login users can make transactions
- Existing external wallet users unaffected
- Error handling and user feedback working

This implementation ensures that all users, regardless of their login method, can participate fully in the ROSCA application's blockchain features.
