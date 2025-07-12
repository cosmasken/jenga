import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bitcoin, TrendingUp, ExternalLink, Users, Calendar, Info } from 'lucide-react';
import { useAccount } from 'wagmi';
import { 
  useStackBTC, 
  useGetChamaCount, 
  useGetChamaInfo, 
  useGetChamaMembers,
  useHasContributedThisCycle,
  formatChamaInfo,
  formatSatsFromWei 
} from '../../hooks/useJengaContract';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';

interface StackBTCModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chamaId?: bigint;
  contributionAmount?: number; // Amount in sats
}

export const StackBTCModal: React.FC<StackBTCModalProps> = ({ 
  open, 
  onOpenChange, 
  chamaId: preselectedChamaId,
  contributionAmount = 100000 // Default 100k sats
}) => {
  const [selectedChamaId, setSelectedChamaId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isConnected, address } = useAccount();

  // Get total chama count for dropdown
  const { data: chamaCount, isLoading: countLoading } = useGetChamaCount();

  // Get selected chama info
  const { data: chamaData, isLoading: isLoadingChama } = useGetChamaInfo(
    selectedChamaId ? BigInt(selectedChamaId) : 0n
  );

  // Get selected chama members
  const { data: chamaMembers } = useGetChamaMembers(
    selectedChamaId ? BigInt(selectedChamaId) : 0n
  );

  // Check if user has contributed this cycle
  const { data: hasContributed } = useHasContributedThisCycle(
    selectedChamaId ? BigInt(selectedChamaId) : 0n,
    address!
  );

  const chamaInfo = formatChamaInfo(chamaData);

  // Generate list of available chamas (first 10)
  const availableChamas = [];
  const maxChamas = Math.min(Number(chamaCount || 0), 10);
  
  for (let i = 1; i <= maxChamas; i++) {
    availableChamas.push(i);
  }

  // Stack BTC hook
  const { 
    stackBTC, 
    isPending, 
    isConfirming, 
    isConfirmed, 
    error,
    hash 
  } = useStackBTC();

  // Set preselected chama and amount when modal opens
  useEffect(() => {
    if (open) {
      if (preselectedChamaId) {
        setSelectedChamaId(preselectedChamaId.toString());
      }
      if (contributionAmount) {
        setAmount(contributionAmount.toString());
      }
    }
  }, [open, preselectedChamaId, contributionAmount]);

  // Update amount when chama selection changes
  useEffect(() => {
    if (chamaInfo && chamaInfo.contributionAmount) {
      const satsAmount = formatSatsFromWei(chamaInfo.contributionAmount);
      setAmount(satsAmount.toString());
    }
  }, [chamaInfo]);

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
      resetModal();
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
    
    if (!selectedChamaId) {
      toast({
        title: 'Error',
        description: 'Please select a chama',
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

    stackBTC(BigInt(selectedChamaId), parseInt(amount));
  };

  const resetModal = () => {
    setSelectedChamaId('');
    setAmount('');
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
          {/* Chama Selection */}
          <div className="space-y-2">
            <Label htmlFor="chama-select">Select Chama</Label>
            {countLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading chamas...</span>
              </div>
            ) : availableChamas.length > 0 ? (
              <Select value={selectedChamaId} onValueChange={setSelectedChamaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a chama to contribute to" />
                </SelectTrigger>
                <SelectContent>
                  {availableChamas.map((chamaId) => (
                    <StackChamaSelectItem key={chamaId} chamaId={BigInt(chamaId)} userAddress={address!} />
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No chamas available for contributions.
                </p>
              </div>
            )}
          </div>

          {/* Chama Info Display */}
          {chamaInfo && selectedChamaId && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {chamaInfo.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    Number(chamaInfo.currentCycle) > 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {Number(chamaInfo.currentCycle) > 0 ? `Cycle ${Number(chamaInfo.currentCycle)}` : 'Forming'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-orange-500" />
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Required</div>
                      <div className="font-mono text-gray-900 dark:text-white">
                        {formatSatsFromWei(chamaInfo.contributionAmount).toLocaleString()} sats
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Members</div>
                      <div className="text-gray-900 dark:text-white">
                        {chamaMembers?.length || 0} / {Number(chamaInfo.maxMembers)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contribution Status */}
                {hasContributed && (
                  <div className="p-2 bg-green-50 dark:bg-green-900 rounded border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ✅ You have already contributed to this cycle.
                    </p>
                  </div>
                )}

                {Number(chamaInfo.currentCycle) === 0 && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      ℹ️ This chama hasn't started yet. Contributions will begin once all members join.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

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
              disabled={isLoading || !selectedChamaId}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {chamaInfo ? 
                `Required: ${formatSatsFromWei(chamaInfo.contributionAmount).toLocaleString()} sats` :
                'Minimum: 1,000 sats'
              }
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
              disabled={
                isLoading || 
                !isConnected || 
                !selectedChamaId || 
                !amount || 
                parseInt(amount || '0') < 1000 ||
                hasContributed
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isPending ? 'Stacking...' : 'Confirming...'}
                </>
              ) : hasContributed ? (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Already Contributed
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

// Component for individual chama select items in stacking modal
const StackChamaSelectItem: React.FC<{ chamaId: bigint; userAddress: Address }> = ({ chamaId, userAddress }) => {
  const { data: chamaData } = useGetChamaInfo(chamaId);
  const { data: chamaMembers } = useGetChamaMembers(chamaId);
  const { data: hasContributed } = useHasContributedThisCycle(chamaId, userAddress);
  
  const chamaInfo = formatChamaInfo(chamaData);
  
  if (!chamaInfo) {
    return (
      <SelectItem value={chamaId.toString()}>
        <div className="flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Loading Chama {chamaId.toString()}...</span>
        </div>
      </SelectItem>
    );
  }

  const memberCount = chamaMembers?.length || 0;
  const isMember = chamaMembers?.includes(userAddress) || false;
  const canContribute = isMember && Number(chamaInfo.currentCycle) > 0 && !hasContributed;
  
  // Get status text
  const getStatusText = () => {
    if (!isMember) return 'Not Member';
    if (Number(chamaInfo.currentCycle) === 0) return 'Not Started';
    if (hasContributed) return 'Contributed';
    return 'Ready';
  };

  const statusText = getStatusText();

  return (
    <SelectItem value={chamaId.toString()}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${canContribute ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="font-medium">{chamaInfo.name}</span>
        </div>
        <div className="text-xs text-gray-500 ml-2 flex items-center gap-2">
          <span>{memberCount}/{Number(chamaInfo.maxMembers)}</span>
          <span>•</span>
          <span>{formatSatsFromWei(chamaInfo.contributionAmount).toLocaleString()} sats</span>
          <span>•</span>
          <span className={`px-1 py-0.5 rounded text-xs ${
            canContribute 
              ? 'bg-green-100 text-green-700' 
              : hasContributed
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {statusText}
          </span>
        </div>
      </div>
    </SelectItem>
  );
};
