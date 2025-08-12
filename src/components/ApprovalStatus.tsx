import { useState, useEffect, useMemo } from 'react';
import { type Address, formatUnits, parseUnits } from 'viem';
import { checkAllowance, formatAllowance } from '@/utils/tokenApproval';
import { TOKENS } from '@/config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ApprovalStatusProps {
  publicClient: any;
  userAddress: Address;
  spenderAddress: Address;
  tokenAddress: Address;
  requiredAmount?: string;
  onApprovalNeeded?: () => void;
  refreshTrigger?: number; // Add this to force refresh
  className?: string;
}

export function ApprovalStatus({
  publicClient,
  userAddress,
  spenderAddress,
  tokenAddress,
  requiredAmount = '0',
  onApprovalNeeded,
  className = ''
}: ApprovalStatusProps) {
  const [allowance, setAllowance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isUSDC = tokenAddress.toLowerCase() === TOKENS.USDC.address.toLowerCase();
  const tokenInfo = isUSDC ? TOKENS.USDC : { symbol: 'USDC', decimals: 18 };

  // Check if current allowance is sufficient for required amount
  const requiredAmountBigInt = useMemo(() => {
    if (!requiredAmount || requiredAmount === '0') return 0n;
    try {
      const parsed = parseUnits(requiredAmount, tokenInfo.decimals);
      console.log('🔢 Required amount parsed:', {
        input: requiredAmount,
        decimals: tokenInfo.decimals,
        output: parsed.toString()
      });
      return parsed;
    } catch (error) {
      console.error('Error parsing required amount:', error);
      return 0n;
    }
  }, [requiredAmount, tokenInfo.decimals]);

  const isSufficient = useMemo(() => {
    if (allowance === null) return false; // Unknown allowance = not sufficient
    if (requiredAmountBigInt === 0n) return true; // No amount required = sufficient

    const sufficient = allowance >= requiredAmountBigInt;
    console.log('✅ Sufficiency check:', {
      allowance: allowance.toString(),
      required: requiredAmountBigInt.toString(),
      sufficient
    });
    return sufficient;
  }, [allowance, requiredAmountBigInt]);

  const hasUnlimitedApproval = allowance !== null && allowance >= (2n ** 256n - 1n) / 2n;

  // Debug logging - only log when there are issues or changes
  useEffect(() => {
    if (allowance !== null && requiredAmountBigInt > 0n) {
      const wasInsufficientBefore = !isSufficient;
      if (wasInsufficientBefore || !hasUnlimitedApproval) {
        console.log('🔍 Approval Check:', {
          allowance: allowance.toString(),
          requiredAmount: requiredAmount,
          requiredAmountBigInt: requiredAmountBigInt.toString(),
          isSufficient,
          hasUnlimitedApproval
        });
      }
    }
  }, [allowance, requiredAmountBigInt, requiredAmount, isSufficient, hasUnlimitedApproval]);

  useEffect(() => {
    if (!publicClient || !userAddress || !spenderAddress || !tokenAddress) {
      console.log('ApprovalStatus: Missing required props');
      return;
    }

    const fetchAllowance = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('💰 Fetching allowance for:', {
          tokenAddress,
          userAddress,
          spenderAddress,
          tokenSymbol: tokenInfo.symbol,
          tokenDecimals: tokenInfo.decimals
        });

        const currentAllowance = await checkAllowance(
          publicClient,
          tokenAddress,
          userAddress,
          spenderAddress
        );

        // Always log allowance updates for debugging approval issues
        console.log('💰 Allowance fetched:', {
          current: currentAllowance.toString(),
          previous: allowance?.toString() || 'null',
          required: requiredAmountBigInt.toString(),
          sufficient: currentAllowance >= requiredAmountBigInt,
          tokenSymbol: tokenInfo.symbol,
          tokenDecimals: tokenInfo.decimals
        });

        setAllowance(currentAllowance);
      } catch (err: any) {
        console.error('Error fetching allowance:', err);
        if (err.message) {
          console.error('Error message:', err.message);
        }
        setError('Failed to check approval status');
      } finally {
        setLoading(false);
      }
    };

    // Always fetch allowance when dependencies change
    fetchAllowance();

    // Set up periodic checking based on current state
    let interval: NodeJS.Timeout | undefined;

    // Wait a bit for the allowance to be set, then decide on interval
    setTimeout(() => {
      if (allowance !== null) {
        const hasUnlimited = allowance >= (2n ** 256n - 1n) / 2n;
        const currentlySufficient = allowance >= requiredAmountBigInt;

        // Only refresh periodically if we don't have unlimited approval and current approval is insufficient
        if (!hasUnlimited && !currentlySufficient && requiredAmountBigInt > 0n) {
          console.log('⏰ Setting up periodic allowance check (insufficient approval)');
          interval = setInterval(fetchAllowance, 10000); // Check every 10 seconds
        } else {
          console.log('✅ Skipping periodic checks (sufficient approval or no amount required)');
        }
      }
    }, 1000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [publicClient, userAddress, spenderAddress, tokenAddress, requiredAmount, requiredAmountBigInt]); // Added requiredAmountBigInt to deps

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-500">Checking approval...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-500">{error}</span>
      </div>
    );
  }

  if (allowance === null) {
    console.log('ApprovalStatus: Allowance is null');
    return null;
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2">
        {isSufficient ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        )}

        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {tokenInfo.symbol} Approval
            </span>
            <Badge variant={isSufficient ? "default" : "secondary"}>
              {isSufficient ? "Sufficient" : "Insufficient"}
            </Badge>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <div>
              Current: {hasUnlimitedApproval
                ? `Unlimited ${tokenInfo.symbol}`
                : formatAllowance(allowance, tokenInfo.decimals, tokenInfo.symbol)
              }
            </div>
            {requiredAmount !== '0' && (
              <div className="flex items-center space-x-2">
                <span>Required: <span className="text-electric">{requiredAmount} {tokenInfo.symbol}</span></span>
                {!isSufficient && allowance !== null && (
                  <span className="text-red-400 text-xs">
                    (Need {formatUnits(requiredAmountBigInt - allowance, tokenInfo.decimals)} more)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {!isSufficient && onApprovalNeeded && (
        <Button
          size="sm"
          variant="outline"
          onClick={onApprovalNeeded}
          className="ml-4 border-electric/50 text-electric hover:bg-electric/10"
        >
          Approve {tokenInfo.symbol}
        </Button>
      )}
    </div>
  );
}

export default ApprovalStatus;