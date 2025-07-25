import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, HandHeart } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { useProvideGuarantee } from '../../hooks/useSacco';

interface ProvideGuaranteeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanId?: string;
  borrowerAddress?: string;
  loanAmount?: string;
}

export const ProvideGuaranteeModal: React.FC<ProvideGuaranteeModalProps> = ({
  open,
  onOpenChange,
  loanId = '',
  borrowerAddress = '',
  loanAmount = '',
}) => {
  const [guaranteeAmount, setGuaranteeAmount] = useState<string>('');
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isConnected } = useAccount();

  const { provideGuarantee, hash, error, isPending, isConfirming, isConfirmed } = useProvideGuarantee();

  useEffect(() => {
    if (!open) {
      setGuaranteeAmount('');
    }
  }, [open]);

  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: 'Guarantee Provided Successfully!',
        description: `You provided ${guaranteeAmount} BTC as guarantee for loan ${loanId}. Transaction hash: ${hash}`,
      });
      onOpenChange(false);
    }
  }, [isConfirmed, hash, guaranteeAmount, loanId, toast, onOpenChange]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Guarantee Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loanId) {
      toast({
        title: 'Error',
        description: 'No loan ID provided.',
        variant: 'destructive',
      });
      return;
    }

    if (!guaranteeAmount || parseFloat(guaranteeAmount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid guarantee amount.',
        variant: 'destructive',
      });
      return;
    }

    try {
      provideGuarantee(BigInt(loanId), guaranteeAmount);
    } catch (err: unknown) {
      toast({
        title: 'Guarantee Failed',
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
            <Shield className="w-5 h-5 text-green-500" />
            Provide Loan Guarantee
          </DialogTitle>
          <DialogDescription>
            Help a fellow member by providing a guarantee for their loan. Your guarantee will be held as collateral.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Loan Information */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Loan ID:
                </span>
                <span className="text-sm text-blue-900 dark:text-blue-100">
                  #{loanId}
                </span>
              </div>
              {borrowerAddress && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Borrower:
                  </span>
                  <span className="text-sm text-blue-900 dark:text-blue-100 font-mono">
                    {borrowerAddress.slice(0, 6)}...{borrowerAddress.slice(-4)}
                  </span>
                </div>
              )}
              {loanAmount && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Loan Amount:
                  </span>
                  <span className="text-sm text-blue-900 dark:text-blue-100">
                    {loanAmount} BTC
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guaranteeAmount">Guarantee Amount</Label>
            <Input
              id="guaranteeAmount"
              type="number"
              step="0.001"
              min="0"
              value={guaranteeAmount}
              onChange={(e) => setGuaranteeAmount(e.target.value)}
              placeholder="0.001"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              disabled={isPending || isConfirming}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Amount in BTC you're willing to guarantee for this loan
            </p>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <HandHeart className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Guarantee Responsibility
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Your guarantee amount will be held as collateral. If the borrower defaults, you may lose this amount. Only guarantee for members you trust.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error.message.includes('execution reverted') 
                  ? 'Transaction failed. Check if you have sufficient balance or guarantee capacity.'
                  : error.message.split('\n')[0]
                }
              </p>
            </div>
          )}

          {!isConnected && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Please connect your wallet to provide a guarantee.
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
              disabled={isPending || isConfirming || !isConnected || !guaranteeAmount || !loanId}
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isConfirming ? 'Confirming...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Provide Guarantee
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
