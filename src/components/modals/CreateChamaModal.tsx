import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Loader2, Bitcoin } from 'lucide-react';
import { useCreateChama } from '../../hooks/useJengaContract';
import { useAccount } from 'wagmi';

interface CreateChamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateChamaModal: React.FC<CreateChamaModalProps> = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    name: '',
    contributionAmount: '',
    cycleDuration: '',
    maxMembers: ''
  });
  
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isConnected } = useAccount();
  const { 
    createChama, 
    isPending, 
    isConfirming, 
    isConfirmed, 
    error,
    hash 
  } = useCreateChama();

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: t('chama.createdSuccess'),
        description: t('chama.createdSuccessDesc', { name: formData.name }),
      });
      setFormData({ name: '', contributionAmount: '', cycleDuration: '', maxMembers: '' });
      onOpenChange(false);
    }
  }, [isConfirmed, formData.name, toast, onOpenChange, t]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      let errorMessage = t('chama.createFailedDesc');
      
      if (error.message.includes('insufficient funds')) {
        errorMessage = t('errors.insufficientFunds');
      } else if (error.message.includes('user rejected')) {
        errorMessage = t('errors.userRejected');
      }
      
      toast({
        title: t('chama.createFailed'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [error, toast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: t('wallet.notConnected'),
        description: t('wallet.connectToCreateChama'),
        variant: "destructive",
      });
      return;
    }

    try {
      createChama(
        formData.name,
        formData.contributionAmount,
        BigInt(parseInt(formData.cycleDuration) * 30 * 24 * 60 * 60), // Convert months to seconds
        BigInt(formData.maxMembers)
      );
    } catch (err) {
      console.error('Error creating chama:', err);
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-card border border-gray-200 dark:border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-foreground">
            <Bitcoin className="w-5 h-5 text-orange-500" />
            {t('chama.createNew')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">{t('chama.name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('chama.namePlaceholder')}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution" className="text-gray-700 dark:text-gray-300">{t('chama.monthlyContribution')}</Label>
            <Select value={formData.contributionAmount} onValueChange={(value) => setFormData(prev => ({ ...prev, contributionAmount: value }))}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue placeholder={t('chama.selectAmount')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem value="0.01" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">0.01 {t('currency.cbtc')}</SelectItem>
                <SelectItem value="0.02" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">0.02 {t('currency.cbtc')}</SelectItem>
                <SelectItem value="0.03" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">0.03 {t('currency.cbtc')}</SelectItem>
                <SelectItem value="0.05" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">0.05 {t('currency.cbtc')}</SelectItem>
                <SelectItem value="0.1" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">0.1 {t('currency.cbtc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-gray-700 dark:text-gray-300">{t('chama.cycleDuration')}</Label>
            <Select value={formData.cycleDuration} onValueChange={(value) => setFormData(prev => ({ ...prev, cycleDuration: value }))}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue placeholder={t('chama.selectDuration')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem value="3" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">{t('chama.months', { count: 3 })}</SelectItem>
                <SelectItem value="6" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">{t('chama.months', { count: 6 })}</SelectItem>
                <SelectItem value="9" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">{t('chama.months', { count: 9 })}</SelectItem>
                <SelectItem value="12" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">{t('chama.months', { count: 12 })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="members" className="text-gray-700 dark:text-gray-300">{t('chama.maxMembers')}</Label>
            <Select value={formData.maxMembers} onValueChange={(value) => setFormData(prev => ({ ...prev, maxMembers: value }))}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue placeholder={t('chama.selectMaxMembers')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem value="3" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">{t('chama.members', { count: 3 })}</SelectItem>
                <SelectItem value="5" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">{t('chama.members', { count: 5 })}</SelectItem>
                <SelectItem value="8" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">{t('chama.members', { count: 8 })}</SelectItem>
                <SelectItem value="10" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">{t('chama.members', { count: 10 })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hash && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t('chama.transactionSubmitted')}{' '}
                <a 
                  href={`https://explorer.testnet.citrea.xyz/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 underline hover:no-underline text-blue-600 dark:text-blue-400"
                >
                  {t('chama.viewOnExplorer')}
                </a>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isLoading || !formData.name || !formData.contributionAmount || !formData.cycleDuration || !formData.maxMembers || !isConnected}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isPending ? t('chama.confirming') : t('chama.creating')}
                </>
              ) : (
                t('chama.create')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
