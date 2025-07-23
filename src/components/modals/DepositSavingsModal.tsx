import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { useDepositSavings } from '../../hooks/useSacco';

interface DepositSavingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DepositSavingsModal: React.FC<DepositSavingsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [amount, setAmount] = useState<string>('');
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isConnected } = useAccount();

  const { depositSavings, hash, error, isPending, isConfirming, isConfirmed } = useDepositSavings();

  useEffect(() => {
    if (!open) {
      setAmount('');
    }
  }, [open]);

  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: 'Deposit Successful!',
        description: `Deposited ${amount} sats. Transaction hash: ${hash}`,
      });
      onOpenChange(false);
    }
  }, [isConfirmed, hash, amount, toast, onOpenChange]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Deposit Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const amountInSats = BigInt(Math.floor(parseFloat(amount) * 100000000)); // Convert to sats
      depositSavings(amountInSats);
    } catch (err: unknown) {
      toast({
        title: 'Deposit Failed',
        description: (err as Error).message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-orange-500" />
            {t('sacco.depositSavings.title')}
          </DialogTitle>
          <DialogDescription>
            {t('sacco.depositSavings.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t('sacco.depositSavings.amountLabel')}</Label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00000001" 
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">Amount in BTC</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error.message.includes('execution reverted') 
                  ? 'Transaction failed. Check if you have sufficient balance.'
                  : error.message.split('\n')[0]
                }
              </p>
            </div>
          )}

          {!isConnected && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {t('common.connectWalletWarning')}
              </p>
            </div>
          )}

          {hash && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Transaction submitted: {hash}
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
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isLoading || !isConnected || !amount}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isConfirming ? t('common.confirming') : t('common.processing')}
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  {t('sacco.depositSavings.depositButton')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
