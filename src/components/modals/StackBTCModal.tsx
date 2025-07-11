import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bitcoin, TrendingUp, ExternalLink } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useStackBTC } from '../../hooks/useJengaContract';
import { useTranslation } from 'react-i18next';

interface StackBTCModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chamaId?: bigint;
  contributionAmount?: number; // Amount in sats
}

export const StackBTCModal: React.FC<StackBTCModalProps> = ({ 
  open, 
  onOpenChange, 
  chamaId,
  contributionAmount = 100000 // Default 100k sats
}) => {
  const [amount, setAmount] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isConnected } = useAccount();

  // Stack BTC hook
  const { 
    stackBTC, 
    isPending, 
    isConfirming, 
    isConfirmed, 
    error,
    hash 
  } = useStackBTC();

  // Set default amount when modal opens
  useEffect(() => {
    if (open && contributionAmount) {
      setAmount(contributionAmount.toString());
    }
  }, [open, contributionAmount]);

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: 'Stack Successful!',
        description: (
          <div className="space-y-2">
            <p>Your Bitcoin has been stacked successfully!</p>
            <a 
              href={`https://explorer.testnet.citrea.xyz/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
            >
              <ExternalLink className="w-3 h-3" />
              View on Explorer
            </a>
          </div>
        ),
      });
      onOpenChange(false);
      setAmount('');
    }
  }, [isConfirmed, hash, toast, onOpenChange]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Stack Failed',
        description: error.message.includes('execution reverted') 
          ? 'Transaction failed. You may have already contributed this cycle or the amount is insufficient.'
          : error.message.split('\n')[0],
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chamaId) {
      toast({
        title: 'Error',
        description: 'No chama selected',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || parseInt(amount) < 1000) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter at least 1,000 sats',
        variant: 'destructive',
      });
      return;
    }

    stackBTC(chamaId, parseInt(amount));
  };

  const isLoading = isPending || isConfirming;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-orange-500" />
            Stack Bitcoin
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (sats)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in sats"
              min="1000"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Minimum contribution: {contributionAmount.toLocaleString()} sats
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error.message.includes('execution reverted') 
                  ? 'Transaction failed. You may have already contributed this cycle or the amount is insufficient.'
                  : error.message.split('\n')[0]
                }
              </p>
            </div>
          )}

          {/* Connection Warning */}
          {!isConnected && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Please connect your wallet to stack Bitcoin.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isLoading || !isConnected || !amount || parseInt(amount) < contributionAmount}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isPending ? 'Confirming...' : 'Stacking...'}
                </>
              ) : (
                <>
                  <Bitcoin className="w-4 h-4 mr-2" />
                  Stack {amount ? parseInt(amount).toLocaleString() : '0'} sats
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
