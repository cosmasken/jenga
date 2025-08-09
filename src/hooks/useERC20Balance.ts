/**
 * useERC20Balance Hook
 * Hook for fetching ERC20 token balances using viem directly
 */

import { useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { createPublicClient, http, formatUnits } from 'viem';
import type { Address } from 'viem';
import { citreaTestnet } from '@/config';
import { getTokenInfo } from '@/lib/tokenUtils';

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const;

interface UseERC20BalanceReturn {
  balance: string;
  balanceWei: bigint;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useERC20Balance(
  tokenAddress: Address | null,
  tokenSymbol: string
): UseERC20BalanceReturn {
  const [balance, setBalance] = useState<string>('0');
  const [balanceWei, setBalanceWei] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { primaryWallet } = useDynamicContext();

  // Create public client
  const publicClient = createPublicClient({
    chain: citreaTestnet,
    transport: http(),
  });

  const fetchBalance = useCallback(async () => {
    if (!tokenAddress || !primaryWallet?.address) {
      setBalance('0');
      setBalanceWei(0n);
      return;
    }

    // Handle native token (cBTC)
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      try {
        setIsLoading(true);
        setError(null);
        
        const nativeBalance = await publicClient.getBalance({
          address: primaryWallet.address as Address,
        });
        
        setBalanceWei(nativeBalance);
        setBalance(formatUnits(nativeBalance, 18));
      } catch (err) {
        console.error('Error fetching native balance:', err);
        setError('Failed to fetch native balance');
        setBalance('0');
        setBalanceWei(0n);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Handle ERC20 tokens
    try {
      setIsLoading(true);
      setError(null);

      const tokenInfo = getTokenInfo(tokenSymbol);
      if (!tokenInfo) {
        throw new Error(`Unknown token: ${tokenSymbol}`);
      }

      const balanceResult = await publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [primaryWallet.address as Address],
      });

      const balanceWei = balanceResult as bigint;
      const balanceFormatted = formatUnits(balanceWei, tokenInfo.decimals);

      setBalanceWei(balanceWei);
      setBalance(balanceFormatted);
    } catch (err) {
      console.error(`Error fetching ${tokenSymbol} balance:`, err);
      setError(`Failed to fetch ${tokenSymbol} balance`);
      setBalance('0');
      setBalanceWei(0n);
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddress, tokenSymbol, primaryWallet?.address, publicClient]);

  // Fetch balance on mount and when dependencies change
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    balanceWei,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}

/**
 * Hook for fetching multiple token balances
 */
export function useMultipleERC20Balances(
  tokens: Array<{ address: Address; symbol: string }>
): Record<string, UseERC20BalanceReturn> {
  const balances: Record<string, UseERC20BalanceReturn> = {};

  tokens.forEach(({ address, symbol }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    balances[symbol] = useERC20Balance(address, symbol);
  });

  return balances;
}
