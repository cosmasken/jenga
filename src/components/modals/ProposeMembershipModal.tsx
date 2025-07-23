import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Vote } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { useProposeMembership } from '../../hooks/useSacco';
import { Address } from 'viem';

interface ProposeMembershipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProposeMembershipModal: React.FC<ProposeMembershipModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [candidateAddress, setCandidateAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isConnected } = useAccount();

  const { proposeMembership, hash, error, isPending, isConfirming, isConfirmed } = useProposeMembership();

  useEffect(() => {
    if (!open) {
      setCandidateAddress('');
      setDescription('');
    }
  }, [open]);

  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: 'Membership Proposal Created!',
        description: `Proposal for ${candidateAddress} has been created. Members can now vote. Transaction hash: ${hash}`,
      });
      onOpenChange(false);
    }
  }, [isConfirmed, hash, candidateAddress, toast, onOpenChange]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Proposal Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!candidateAddress) {
      toast({
        title: 'Error',
        description: 'Please enter a candidate address.',
        variant: 'destructive',
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a description for the membership proposal.',
        variant: 'destructive',
      });
      return;
    }

    try {
      proposeMembership(candidateAddress as Address);
    } catch (err: unknown) {
      toast({
        title: 'Proposal Failed',
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
            <Vote className="w-5 h-5 text-orange-500" />
            Propose New Member
          </DialogTitle>
          <DialogDescription>
            Create a proposal to add a new member to the SACCO. Other members will vote on this proposal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidateAddress">Candidate Address</Label>
            <Input
              id="candidateAddress"
              type="text"
              value={candidateAddress}
              onChange={(e) => setCandidateAddress(e.target.value)}
              placeholder="0x..." 
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              disabled={isPending || isConfirming}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the Ethereum address of the person you want to propose as a member.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Proposal Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this person should become a SACCO member..."
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 min-h-[100px]"
              disabled={isPending || isConfirming}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Provide details about the candidate and why they would be a good member.
            </p>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Vote className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Democratic Process
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  After creating this proposal, SACCO members will vote. The proposal needs majority approval to pass.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error.message.includes('execution reverted') 
                  ? 'Transaction failed. You may not have enough shares to create proposals.'
                  : error.message.split('\n')[0]
                }
              </p>
            </div>
          )}

          {!isConnected && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Please connect your wallet to create a membership proposal.
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
              disabled={isPending || isConfirming || !isConnected || !candidateAddress || !description.trim()}
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isConfirming ? 'Confirming...' : 'Processing...'}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Proposal
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
