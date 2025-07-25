import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Share } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { usePurchaseShares } from '../../hooks/useSacco';
import { formatEther, parseEther } from 'viem';

interface PurchaseSharesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHARE_PRICE = "0.001"; // 0.001 BTC per share
const MINIMUM_SHARES = 10;

export const PurchaseSharesModal: React.FC<PurchaseSharesModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [shares, setShares] = useState<string>(MINIMUM_SHARES.toString());
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isConnected } = useAccount();

  const { purchaseShares, hash, error, isPending, isConfirming, isConfirmed } = usePurchaseShares();

  const totalCost = (parseFloat(shares) * parseFloat(SHARE_PRICE)).toFixed(3);

  useEffect(() => {
    if (!open) {
      setShares(MINIMUM_SHARES.toString());
    }
  }, [open]);

  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: 'Shares Purchased Successfully!',
        description: `You purchased ${shares} shares for ${totalCost} BTC. Transaction hash: ${hash}`,
      });
      onOpenChange(false);
    }
  }, [isConfirmed, hash, shares, totalCost, toast, onOpenChange]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const shareCount = parseInt(shares);
    if (!shareCount || shareCount < MINIMUM_SHARES) {
      toast({
        title: 'Error',
        description: `Please enter at least ${MINIMUM_SHARES} shares.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      purchaseShares(shareCount, totalCost);
    } catch (err: unknown) {
      toast({
        title: 'Purchase Failed',
        description: (err as Error).message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5 text-orange-500" />
            Purchase SACCO Shares
          </DialogTitle>
          <DialogDescription>
            Purchase shares to become a SACCO member. Each share costs {SHARE_PRICE} BTC.
            Minimum purchase is {MINIMUM_SHARES} shares.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shares">Number of Shares</Label>
            <Input
              id="shares"
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              min={MINIMUM_SHARES}
              placeholder={MINIMUM_SHARES.toString()}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              disabled={isPending || isConfirming}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share price: {SHARE_PRICE} BTC each
            </p>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total Cost:
              </span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {totalCost} BTC
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {shares} shares × {SHARE_PRICE} BTC
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error.message.includes('execution reverted') 
                  ? 'Transaction failed. Check if you have sufficient balance or are already a member.'
                  : error.message.split('\n')[0]
                }
              </p>
            </div>
          )}

          {!isConnected && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Please connect your wallet to purchase shares.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isPending || isConfirming}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isPending || isConfirming || !isConnected || !shares || parseInt(shares) < MINIMUM_SHARES}
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isConfirming ? 'Confirming...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Share className="w-4 h-4 mr-2" />
                  Purchase Shares
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
