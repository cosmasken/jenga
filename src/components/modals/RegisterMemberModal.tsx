import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { useSacco } from '../../hooks/useSacco';
import { Address } from 'viem';

interface RegisterMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegisterMemberModal: React.FC<RegisterMemberModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [memberAddress, setMemberAddress] = useState<string>('');
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isConnected } = useAccount();

  const { registerMember } = useSacco();

  const [isPending, setIsPending] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<`0x${string}` | null>(null);

  useEffect(() => {
    if (!open) {
      setMemberAddress('');
      setIsPending(false);
      setIsConfirmed(false);
      setError(null);
      setHash(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    setIsConfirmed(false);

    if (!memberAddress) {
      toast({
        title: 'Error',
        description: 'Please enter a member address.',
        variant: 'destructive',
      });
      setIsPending(false);
      return;
    }

    try {
      const txHash = await registerMember(memberAddress as Address);
      setHash(txHash);
      // In a real app, you'd use useWaitForTransactionReceipt here
      // For simplicity, we'll simulate confirmation
      setTimeout(() => {
        setIsConfirmed(true);
        setIsPending(false);
        toast({
          title: 'Registration Successful!',
          description: `Member ${memberAddress} registered. Transaction hash: ${txHash}`,
        });
        onOpenChange(false);
      }, 3000); // Simulate network delay

    } catch (err: any) {
      setError(err);
      setIsPending(false);
      toast({
        title: 'Registration Failed',
        description: err.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-orange-500" />
            {t('sacco.registerMember.title')}
          </DialogTitle>
          <DialogDescription>
            {t('sacco.registerMember.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memberAddress">{t('sacco.registerMember.memberAddressLabel')}</Label>
            <Input
              id="memberAddress"
              type="text"
              value={memberAddress}
              onChange={(e) => setMemberAddress(e.target.value)}
              placeholder="0x..." 
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              disabled={isPending}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error.message.includes('execution reverted') 
                  ? 'Transaction failed. Check if the address is already registered or if you are the owner.'
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

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isPending || !isConnected || !memberAddress}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.processing')}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('sacco.registerMember.registerButton')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};