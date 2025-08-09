/**
 * FaucetModal Component
 * A dedicated modal for claiming test tokens from faucets
 */

import React, { useState, useEffect } from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { X, Zap, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useERC20Balance } from '@/hooks/useERC20Balance';
import { useRoscaToast } from '@/hooks/use-rosca-toast';
import {
  getSupportedTokens,
  getTokenInfo,
  formatTokenAmount,
  getFaucetAmount,
  type TokenInfo,
} from '@/lib/tokenUtils';
import { createPublicClient, http, parseAbi } from 'viem';
import { citreaTestnet } from '@/config';

interface FaucetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TokenFaucetStatus {
  canClaim: boolean;
  timeUntilNextClaim: number;
  isLoading: boolean;
  error: string | null;
}

// ERC20 ABI for faucet functions
const FAUCET_ABI = parseAbi([
  'function faucet() external',
  'function canClaimFaucet(address user) external view returns (bool canClaim, uint256 timeUntilNextClaim)',
]);

export function FaucetModal({ open, onOpenChange }: FaucetModalProps) {
  const { primaryWallet } = useDynamicContext();
  const { success, error: showError, transactionPending } = useRoscaToast();
  
  const [selectedToken, setSelectedToken] = useState<string>('USDC');
  const [faucetStatuses, setFaucetStatuses] = useState<Record<string, TokenFaucetStatus>>({});
  const [isClaimingToken, setIsClaimingToken] = useState<string | null>(null);

  // Get test tokens only (exclude native cBTC)
  const testTokens = getSupportedTokens(false, true).filter(token => token.isTestToken);

  // Get balance for selected token
  const selectedTokenInfo = getTokenInfo(selectedToken);
  const {
    balance: tokenBalance,
    balanceWei: tokenBalanceWei,
    isLoading: isLoadingBalance,
    refetch: refetchBalance
  } = useERC20Balance(selectedTokenInfo?.address || null, selectedToken);

  // Create public client for contract interactions
  const publicClient = createPublicClient({
    chain: citreaTestnet,
    transport: http(),
  });

  // Check faucet status for all tokens
  const checkFaucetStatuses = async () => {
    if (!primaryWallet?.address) return;

    const statuses: Record<string, TokenFaucetStatus> = {};

    for (const token of testTokens) {
      try {
        const result = await publicClient.readContract({
          address: token.address,
          abi: FAUCET_ABI,
          functionName: 'canClaimFaucet',
          args: [primaryWallet.address as `0x${string}`],
        });

        const [canClaim, timeUntilNextClaim] = result as [boolean, bigint];

        statuses[token.symbol] = {
          canClaim,
          timeUntilNextClaim: Number(timeUntilNextClaim),
          isLoading: false,
          error: null,
        };
      } catch (error) {
        console.error(`Error checking faucet status for ${token.symbol}:`, error);
        statuses[token.symbol] = {
          canClaim: false,
          timeUntilNextClaim: 0,
          isLoading: false,
          error: 'Failed to check faucet status',
        };
      }
    }

    setFaucetStatuses(statuses);
  };

  // Check faucet statuses when modal opens
  useEffect(() => {
    if (open && primaryWallet?.address) {
      checkFaucetStatuses();
      // Refresh every 30 seconds
      const interval = setInterval(checkFaucetStatuses, 30000);
      return () => clearInterval(interval);
    }
  }, [open, primaryWallet?.address]);

  // Claim tokens from faucet
  const claimTokens = async (tokenSymbol: string) => {
    if (!primaryWallet?.address) {
      showError("Wallet Not Connected", "Please connect your wallet to claim tokens");
      return;
    }

    const tokenInfo = getTokenInfo(tokenSymbol);
    if (!tokenInfo) {
      showError("Invalid Token", "Token information not found");
      return;
    }

    try {
      setIsClaimingToken(tokenSymbol);

      // Show pending transaction toast
      const pendingToast = transactionPending(`${tokenSymbol} faucet claim`);

      // Get the wallet's ethereum provider
      const walletClient = await primaryWallet.getWalletClient();
      
      // Call faucet function
      const hash = await walletClient.writeContract({
        address: tokenInfo.address,
        abi: FAUCET_ABI,
        functionName: 'faucet',
      });

      // Wait for transaction confirmation
      await publicClient.waitForTransactionReceipt({ hash });

      // Dismiss pending toast
      pendingToast.dismiss();

      // Show success message
      success(
        "Tokens Claimed Successfully! 🎉",
        `You received ${getFaucetAmount(tokenSymbol)} ${tokenSymbol} tokens`,
        hash
      );

      // Refresh balance and faucet status
      await refetchBalance();
      await checkFaucetStatuses();

    } catch (error) {
      console.error(`Error claiming ${tokenSymbol}:`, error);
      showError(
        "Faucet Claim Failed",
        `Failed to claim ${tokenSymbol} tokens. Please try again.`
      );
    } finally {
      setIsClaimingToken(null);
    }
  };

  // Format time until next claim
  const formatTimeUntilClaim = (seconds: number): string => {
    if (seconds <= 0) return "Available now";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Token Faucet
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Claim test tokens for free to use in the app
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!primaryWallet?.address ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Wallet Not Connected
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please connect your wallet to claim test tokens
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">
                      Free Test Tokens
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Claim 1,000 tokens every 24 hours from each faucet. Use these tokens to test chama creation and contributions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Token Grid */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Available Tokens
                </h3>
                
                <div className="grid gap-4">
                  {testTokens.map((token) => {
                    const status = faucetStatuses[token.symbol];
                    const isClaiming = isClaimingToken === token.symbol;
                    
                    return (
                      <Card key={token.symbol} className="hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div 
                                className="text-2xl"
                                style={{ color: token.color }}
                              >
                                {token.icon}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {token.symbol}
                                  </h4>
                                  <Badge variant="secondary" className="text-xs">
                                    <Zap className="w-3 h-3 mr-1" />
                                    {getFaucetAmount(token.symbol)} per claim
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {token.name}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Faucet Status */}
                              {status && (
                                <div className="text-right">
                                  {status.canClaim ? (
                                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                      <CheckCircle className="w-4 h-4" />
                                      <span className="text-sm font-medium">Available</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                      <Clock className="w-4 h-4" />
                                      <span className="text-sm">
                                        {formatTimeUntilClaim(status.timeUntilNextClaim)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Claim Button */}
                              <Button
                                onClick={() => claimTokens(token.symbol)}
                                disabled={!status?.canClaim || isClaiming}
                                size="sm"
                                className="min-w-[80px]"
                              >
                                {isClaiming ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Claiming
                                  </div>
                                ) : status?.canClaim ? (
                                  <>
                                    <Zap className="w-4 h-4 mr-1" />
                                    Claim
                                  </>
                                ) : (
                                  "Cooldown"
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  How to use test tokens:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Create chamas with any of these test tokens</li>
                  <li>• Make contributions to existing chamas</li>
                  <li>• Test all app functionality without real money</li>
                  <li>• Claim more tokens every 24 hours</li>
                </ul>
              </div>

              {/* External Links */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Need native cBTC for gas fees?
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://citrea.xyz/faucet', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Citrea Faucet
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FaucetModal;
