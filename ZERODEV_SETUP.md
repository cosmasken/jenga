# ZeroDev Setup Guide for Citrea

## 🚨 Current Issue
ZeroDev doesn't natively support Citrea testnet (Chain ID: 5115) in their dashboard, which causes the "Transaction expected to fail" warning. However, transactions still work because we're using regular Wagmi as fallback.

## 🛠️ Setup Instructions

### Step 1: Create ZeroDev Project
1. Go to [ZeroDev Dashboard](https://dashboard.zerodev.app/)
2. Create a new project
3. **Select Sepolia testnet** (Chain ID: 11155111) - this is the closest supported network
4. Copy your Project ID

### Step 2: Configure Environment Variables
Add to your `.env` file:
```bash
VITE_ZERODEV_PROJECT_ID=your-project-id-here
VITE_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id
```

### Step 3: Configure Paymaster (Optional)
In the ZeroDev dashboard:
1. Go to Paymaster settings
2. Set spending limits (e.g., $10/day)
3. Configure gas policies
4. Enable sponsorship for your project

## 🔧 How It Currently Works

### Without ZeroDev Configuration:
- ✅ **Regular transactions work** - Uses Wagmi + Dynamic on Citrea
- ❌ **No gas sponsorship** - Users pay their own gas fees
- ✅ **Full functionality** - All features work normally

### With ZeroDev Configuration:
- ✅ **Hybrid approach** - ZeroDev for sponsorship, Wagmi for fallback
- ⚠️ **Network mismatch warnings** - ZeroDev expects Sepolia, gets Citrea
- ✅ **Graceful fallback** - Falls back to regular transactions if ZeroDev fails
- 🎯 **Gas sponsorship** - Works for eligible operations

## 🎯 Recommended Approach

### Option 1: Disable ZeroDev (Simplest)
```typescript
// In src/config/zerodev.ts
export const ZERODEV_CONFIG = {
  projectId: "disabled",
  enableGasSponsorship: false,
  // ... rest of config
};
```

**Pros:**
- ✅ No configuration needed
- ✅ No network mismatch warnings
- ✅ All transactions work perfectly
- ✅ Simple and reliable

**Cons:**
- ❌ No gas sponsorship
- ❌ Users pay their own fees

### Option 2: Use ZeroDev with Fallback (Current)
```typescript
// In src/config/zerodev.ts
export const ZERODEV_CONFIG = {
  projectId: process.env.VITE_ZERODEV_PROJECT_ID,
  enableGasSponsorship: true,
  // ... rest of config
};
```

**Pros:**
- ✅ Gas sponsorship for eligible users
- ✅ Graceful fallback to regular transactions
- ✅ Enhanced user experience for sponsored operations

**Cons:**
- ⚠️ Network mismatch warnings in wallet
- 🔧 Requires ZeroDev project setup
- 🐛 Potential edge cases with unsupported network

### Option 3: Wait for Native Citrea Support
Monitor ZeroDev's roadmap for native Citrea support.

## 🔍 Troubleshooting

### "Transaction expected to fail" Warning
This happens because:
1. ZeroDev project is configured for Sepolia (Chain ID: 11155111)
2. Your wallet is connected to Citrea (Chain ID: 5115)
3. The paymaster expects Sepolia transactions
4. **But transactions still work** because we fall back to regular Wagmi

### Solutions:
1. **Ignore the warning** - Transactions will still succeed
2. **Disable ZeroDev** - Use Option 1 above
3. **Use Sepolia for testing** - Switch to Sepolia testnet temporarily

### Gas Sponsorship Not Working
Check:
1. ✅ ZeroDev project ID is set correctly
2. ✅ User meets sponsorship criteria (user level, limits)
3. ✅ Operation is in the sponsored operations list
4. ✅ Paymaster has sufficient balance in ZeroDev dashboard

## 📊 Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| Regular P2P Transactions | ✅ Working | Uses Wagmi + Dynamic |
| Gas Sponsorship | ⚠️ Partial | Works with network mismatch warnings |
| Transaction History | ✅ Working | Tracks all transactions |
| Balance Display | ✅ Working | Shows real Citrea balance |
| Address Validation | ✅ Working | Validates recipient addresses |
| Error Handling | ✅ Working | Proper error messages |

## 🚀 Recommendation

For production, I recommend **Option 1 (Disable ZeroDev)** until Citrea gets native support. This gives you:
- ✅ **Reliable transactions** without warnings
- ✅ **Better user experience** without confusing error messages
- ✅ **Full functionality** on Citrea testnet
- 🔄 **Easy to enable later** when Citrea support is added

You can always add gas sponsorship later when ZeroDev officially supports Citrea or when you want to use a supported network for testing.
