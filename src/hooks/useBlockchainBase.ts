import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { 
  createPublicClient,
  http,
  type Address,
  type Hash,
  type PublicClient,
  type WalletClient
} from 'viem';
import { citreaTestnet } from 'viem/chains';
import { useState, useCallback, useMemo } from 'react';
import { NETWORK_CONFIG } from '../config';

/**
 * Base blockchain hook providing common functionality for wallet connection,
 * transaction execution, and state management.
 * 
 * This hook consolidates shared patterns from useSacco and useDashboardData
 * to follow DRY principles while maintaining backward compatibility.
 */
export interface BaseBlockchainState {
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  address: Address | null;
  publicClient: PublicClient;
  walletClient: Promise<WalletClient | null>;
}

export interface BaseBlockchainActions {
  connect: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  executeTransaction: (txFunction: () => Promise<Hash>) => Promise<Hash | undefined>;
}

export function useBlockchainBase(): BaseBlockchainState & BaseBlockchainActions {
  const { primaryWallet } = useDynamicContext();
  
  /* --- Shared State --- */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* --- Shared Clients --- */
  const publicClient = useMemo(() => {
    return createPublicClient({
      chain: citreaTestnet,
      transport: http(NETWORK_CONFIG.RPC_URL)
    });
  }, []);

  const walletClient = useMemo(async () => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return null;
    try {
      return await primaryWallet.getWalletClient();
    } catch (error) {
      console.error('Failed to get wallet client:', error);
      return null;
    }
  }, [primaryWallet]);

  /* --- Shared Computed Values --- */
  const isConnected = Boolean(primaryWallet && isEthereumWallet(primaryWallet));
  const address = primaryWallet?.address as Address | null;

  /* --- Shared Actions --- */
  const connect = useCallback(async () => {
    if (primaryWallet) {
      await primaryWallet.connector.connect();
    }
  }, [primaryWallet]);

  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const setErrorState = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  /**
   * Generic transaction execution wrapper with common error handling,
   * loading states, and success patterns.
   */
  const executeTransaction = useCallback(async (
    txFunction: () => Promise<Hash>
  ): Promise<Hash | undefined> => {
    if (!isConnected) {
      setError('Wallet not connected');
      return;
    }

    const client = await walletClient;
    if (!client) {
      setError('Wallet client not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const hash = await txFunction();
      
      // Wait for transaction confirmation
      await publicClient.waitForTransactionReceipt({ hash });
      
      return hash;
    } catch (err: any) {
      console.error('Transaction failed:', err);
      setError(err?.shortMessage || err?.message || 'Transaction failed');
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, walletClient, publicClient]);

  return {
    // State
    isLoading,
    error,
    isConnected,
    address,
    publicClient,
    walletClient,
    // Actions
    connect,
    setLoading: setLoadingState,
    setError: setErrorState,
    executeTransaction,
  };
}

/**
 * Utility function to create consistent error handling for data fetching operations
 */
export function createDataFetcher<T>(
  fetchFunction: () => Promise<T>,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) {
  return async (): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      return await fetchFunction();
    } catch (err: any) {
      console.error('Data fetch failed:', err);
      setError(err?.message || 'Failed to fetch data');
      return null;
    } finally {
      setLoading(false);
    }
  };
}

/**
 * Utility function to create consistent localStorage management
 */
export function createLocalStorageManager<T>(keyPrefix: string) {
  return {
    save: (address: Address, data: T): void => {
      try {
        const key = `${keyPrefix}_${address.toLowerCase()}`;
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error(`Failed to save ${keyPrefix} to localStorage:`, error);
      }
    },
    
    load: (address: Address): T | null => {
      try {
        const key = `${keyPrefix}_${address.toLowerCase()}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      } catch (error) {
        console.error(`Failed to load ${keyPrefix} from localStorage:`, error);
        return null;
      }
    },
    
    clear: (address: Address): void => {
      try {
        const key = `${keyPrefix}_${address.toLowerCase()}`;
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to clear ${keyPrefix} from localStorage:`, error);
      }
    }
  };
}
