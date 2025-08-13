import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { createPublicClient, http, formatUnits, type Address } from 'viem';
import { citreaTestnet } from '@/config';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '@/config';
import { Coins, DollarSign, Loader2 } from 'lucide-react';

// ERC20 ABI for balance checking
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const;

interface TokenBalance {
  symbol: string;
  balance: string;
  formatted: string;
  usdValue?: string;
  isLoading: boolean;
  error?: string;
}

interface WalletBalanceProps {
  className?: string;
  showUsdValue?: boolean;
  compact?: boolean;
}

export function WalletBalance({ 
  className = '', 
  showUsdValue = true, 
  compact = false 
}: WalletBalanceProps) {
  const { primaryWallet } = useDynamicContext();
  const [balances, setBalances] = useState<{
    native: TokenBalance;
    usdc: TokenBalance;
  }>({
    native: {
      symbol: 'cBTC',
      balance: '0',
      formatted: '0.0000',
      isLoading: true,
    },
    usdc: {
      symbol: 'USDC',
      balance: '0',
      formatted: '0.00',
      isLoading: true,
    },
  });

  const publicClient = createPublicClient({
    chain: citreaTestnet,
    transport: http(NETWORK_CONFIG.RPC_URL),
  });

  const fetchBalances = async () => {
    if (!primaryWallet?.address || !isEthereumWallet(primaryWallet)) {
      return;
    }

    const userAddress = primaryWallet.address as Address;

    try {
      // Fetch native balance (cBTC)
      setBalances(prev => ({
        ...prev,
        native: { ...prev.native, isLoading: true, error: undefined }
      }));

      const nativeBalance = await publicClient.getBalance({
        address: userAddress,
      });

      const nativeFormatted = formatUnits(nativeBalance, 18);
      const nativeDisplay = parseFloat(nativeFormatted).toFixed(4);

      setBalances(prev => ({
        ...prev,
        native: {
          ...prev.native,
          balance: nativeBalance.toString(),
          formatted: nativeDisplay,
          usdValue: showUsdValue ? `$${(parseFloat(nativeFormatted) * 50000).toLocaleString()}` : undefined,
          isLoading: false,
        }
      }));

      // Fetch USDC balance
      setBalances(prev => ({
        ...prev,
        usdc: { ...prev.usdc, isLoading: true, error: undefined }
      }));

      const usdcBalance = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.USDC,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
      });

      const usdcFormatted = formatUnits(usdcBalance as bigint, 6);
      const usdcDisplay = parseFloat(usdcFormatted).toFixed(2);

      setBalances(prev => ({
        ...prev,
        usdc: {
          ...prev.usdc,
          balance: (usdcBalance as bigint).toString(),
          formatted: usdcDisplay,
          usdValue: showUsdValue ? `$${parseFloat(usdcFormatted).toLocaleString()}` : undefined,
          isLoading: false,
        }
      }));

    } catch (error) {
      console.error('Error fetching balances:', error);
      setBalances(prev => ({
        native: {
          ...prev.native,
          isLoading: false,
          error: 'Failed to load',
        },
        usdc: {
          ...prev.usdc,
          isLoading: false,
          error: 'Failed to load',
        }
      }));
    }
  };

  useEffect(() => {
    if (primaryWallet?.address) {
      fetchBalances();
      
      // Refresh balances every 30 seconds
      const interval = setInterval(fetchBalances, 30000);
      return () => clearInterval(interval);
    }
  }, [primaryWallet?.address]);

  if (!primaryWallet?.address) {
    return null;
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {/* Native Balance */}
        <div className="flex items-center space-x-1">
          <Coins className="w-4 h-4 text-orange-500" />
          {balances.native.isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
          ) : (
            <span className="text-sm font-medium text-gray-300">
              {balances.native.error || balances.native.formatted}
            </span>
          )}
        </div>

        {/* USDC Balance */}
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-blue-500" />
          {balances.usdc.isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
          ) : (
            <span className="text-sm font-medium text-gray-300">
              {balances.usdc.error || balances.usdc.formatted}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Native Balance */}
      <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Coins className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-gray-300">cBTC</span>
        </div>
        <div className="text-right">
          {balances.native.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <>
              <div className="text-sm font-medium text-white">
                {balances.native.error || balances.native.formatted}
              </div>
              {showUsdValue && balances.native.usdValue && !balances.native.error && (
                <div className="text-xs text-gray-400">
                  {balances.native.usdValue}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* USDC Balance */}
      <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-300">USDC</span>
        </div>
        <div className="text-right">
          {balances.usdc.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <>
              <div className="text-sm font-medium text-white">
                {balances.usdc.error || balances.usdc.formatted}
              </div>
              {showUsdValue && balances.usdc.usdValue && !balances.usdc.error && (
                <div className="text-xs text-gray-400">
                  {balances.usdc.usdValue}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WalletBalance;
