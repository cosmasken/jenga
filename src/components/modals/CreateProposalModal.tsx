import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { useCreateProposal } from '../../hooks/useSacco';

interface CreateProposalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [votingDuration, setVotingDuration] = useState<string>('7'); // Default 7 days
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isConnected } = useAccount();

  const { createProposal, hash, error, isPending, isConfirming, isConfirmed } = useCreateProposal();

  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setVotingDuration('7');
    }
  }, [open]);

  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: 'Proposal Created Successfully!',
        description: `Proposal "${title}" created. Transaction hash: ${hash}`,
      });
      onOpenChange(false);
    }
  }, [isConfirmed, hash, title, toast, onOpenChange]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Proposal Creation Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a proposal title.',
        variant: 'destructive',
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a proposal description.',
        variant: 'destructive',
      });
      return;
    }

    const duration = parseInt(votingDuration);
    if (!duration || duration <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid voting duration.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Combine title and description since the contract only accepts one description parameter
      const fullDescription = `Title: ${title}\n\nDescription: ${description}\n\nVoting Duration: ${votingDuration} days`;
      createProposal(fullDescription);
    } catch (err: unknown) {
      toast({
        title: 'Proposal Creation Failed',
        description: (err as Error).message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            {t('sacco.createProposal.title')}
          </DialogTitle>
          <DialogDescription>
            {t('sacco.createProposal.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('sacco.createProposal.titleLabel')}</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Proposal title" 
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('sacco.createProposal.descriptionLabel')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the proposal..."
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="votingDuration">{t('sacco.createProposal.votingDurationLabel')}</Label>
            <Input
              id="votingDuration"
              type="number"
              min="1"
              value={votingDuration}
              onChange={(e) => setVotingDuration(e.target.value)}
              placeholder="7" 
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">Duration in days</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error.message.includes('execution reverted') 
                  ? 'Transaction failed. Check if you have permission to create proposals.'
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
              disabled={isLoading || !isConnected || !title.trim() || !description.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isConfirming ? t('common.confirming') : t('common.processing')}
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  {t('sacco.createProposal.createButton')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
