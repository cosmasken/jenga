import { type Address, type PublicClient, formatUnits } from 'viem';
import { TOKENS } from '@/config';

/**
 * Get native token (cBTC) balance for an address
 */
export async function getNativeBalance(
  publicClient: PublicClient,
  address: Address
): Promise<string> {
  try {
    const balance = await publicClient.getBalance({ address });
    return formatUnits(balance, TOKENS.NATIVE.decimals);
  } catch (error) {
    console.error('Error getting native balance:', error);
    return '0';
  }
}

/**
 * Get ERC20 token balance for an address
 */
export async function getTokenBalance(
  publicClient: PublicClient,
  tokenAddress: Address,
  userAddress: Address,
  decimals: number = 18
): Promise<string> {
  try {
    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: [
        {
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: '', type: 'uint256' }],
        },
      ],
      functionName: 'balanceOf',
      args: [userAddress],
    });
    
    return formatUnits(balance as bigint, decimals);
  } catch (error) {
    console.error('Error getting token balance:', error);
    // Return null to indicate balance check failed (different from 0 balance)
    return 'unknown';
  }
}

/**
 * Get USDC balance for an address
 */
export async function getUSDCBalance(
  publicClient: PublicClient,
  address: Address
): Promise<string> {
  return getTokenBalance(publicClient, TOKENS.USDC.address, address, TOKENS.USDC.decimals);
}

/**
 * Check if user has sufficient balance for a transaction
 */
export async function checkSufficientBalance(
  publicClient: PublicClient,
  userAddress: Address,
  tokenAddress: Address | null, // null for native token
  requiredAmount: string
): Promise<{ sufficient: boolean; currentBalance: string; required: string; balanceCheckFailed: boolean }> {
  try {
    const currentBalance = tokenAddress 
      ? await getTokenBalance(publicClient, tokenAddress, userAddress, tokenAddress === TOKENS.USDC.address ? 6 : 18)
      : await getNativeBalance(publicClient, userAddress);
    
    // If balance check failed (returned 'unknown'), don't block the user
    if (currentBalance === 'unknown') {
      return {
        sufficient: true, // Allow transaction to proceed
        currentBalance: 'unknown',
        required: requiredAmount,
        balanceCheckFailed: true,
      };
    }
    
    const sufficient = parseFloat(currentBalance) >= parseFloat(requiredAmount);
    
    return {
      sufficient,
      currentBalance,
      required: requiredAmount,
      balanceCheckFailed: false,
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    // Don't block the user if balance check fails - let the transaction attempt
    return {
      sufficient: true, // Allow transaction to proceed
      currentBalance: 'unknown',
      required: requiredAmount,
      balanceCheckFailed: true,
    };
  }
}

/**
 * Format balance for display
 */
export function formatBalance(balance: string, symbol: string, maxDecimals: number = 6): string {
  if (balance === 'unknown') return `Unknown ${symbol}`;
  
  const num = parseFloat(balance);
  if (num === 0) return `0 ${symbol}`;
  
  // Show more decimals for small amounts
  const decimals = num < 1 ? maxDecimals : num < 100 ? 4 : 2;
  
  return `${num.toFixed(decimals)} ${symbol}`;
}

/**
 * Get user's balances for all supported tokens
 */
export async function getAllBalances(
  publicClient: PublicClient,
  address: Address
): Promise<{
  native: string;
  usdc: string;
  formatted: {
    native: string;
    usdc: string;
  };
}> {
  const [nativeBalance, usdcBalance] = await Promise.all([
    getNativeBalance(publicClient, address),
    getUSDCBalance(publicClient, address),
  ]);

  return {
    native: nativeBalance,
    usdc: usdcBalance,
    formatted: {
      native: formatBalance(nativeBalance, TOKENS.NATIVE.symbol),
      usdc: formatBalance(usdcBalance, TOKENS.USDC.symbol),
    },
  };
}
