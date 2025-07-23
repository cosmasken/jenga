import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { useRequestLoan } from '../../hooks/useSacco';

interface RequestLoanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestLoanModal: React.FC<RequestLoanModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [duration, setDuration] = useState<string>('30');
  const [purpose, setPurpose] = useState<string>('');
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isConnected } = useAccount();

  const { requestLoan, hash, error, isPending, isConfirming, isConfirmed } = useRequestLoan();

  useEffect(() => {
    if (!open) {
      setAmount('');
      setDuration('30');
      setPurpose('');
    }
  }, [open]);

  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: 'Loan Request Successful!',
        description: `Requested loan of ${amount} sats. Transaction hash: ${hash}`,
      });
      onOpenChange(false);
    }
  }, [isConfirmed, hash, amount, toast, onOpenChange]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Loan Request Failed',
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

    if (!duration || parseInt(duration) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid duration in days.',
        variant: 'destructive',
      });
      return;
    }

    if (!purpose.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a purpose for the loan.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18)); // Convert to wei
      const durationInDays = BigInt(parseInt(duration));
      requestLoan(amountInWei, durationInDays, purpose);
    } catch (err: unknown) {
      toast({
        title: 'Loan Request Failed',
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
            <CreditCard className="w-5 h-5 text-orange-500" />
            {t('sacco.requestLoan.title')}
          </DialogTitle>
          <DialogDescription>
            {t('sacco.requestLoan.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Loan Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001" 
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">Amount in ETH</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (Days)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="30" 
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">Loan duration in days</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Business expansion, emergency, etc." 
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">Explain why you need this loan</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error.message.includes('execution reverted') 
                  ? 'Transaction failed. Check if you are eligible for a loan.'
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
              disabled={isLoading || !isConnected || !amount || !duration || !purpose.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isConfirming ? t('common.confirming') : t('common.processing')}
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('sacco.requestLoan.requestButton')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
