import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Users, Bitcoin, Clock, TrendingUp, ExternalLink } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useJoinChama, useGetChamaInfo, useGetChamaCount, useGetChamaMembers, formatChamaInfo, formatSatsFromWei } from '../../hooks/useJengaContract';
import { formatUnits } from 'viem';
import { useTranslation } from 'react-i18next';

interface JoinChamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chamaId?: bigint; // Optional pre-selected chama ID
}

export const JoinChamaModal: React.FC<JoinChamaModalProps> = ({ open, onOpenChange, chamaId: preselectedChamaId }) => {
  const [selectedChamaId, setSelectedChamaId] = useState<string>('');
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isConnected } = useAccount();

  // Get total chama count
  const { data: chamaCount, isLoading: countLoading } = useGetChamaCount();

  // Set preselected chama ID when modal opens
  useEffect(() => {
    if (preselectedChamaId && open) {
      setSelectedChamaId(preselectedChamaId.toString());
    }
  }, [preselectedChamaId, open]);

  // Get selected chama info
  const { data: chamaData, isLoading: isLoadingChama, error: chamaError } = useGetChamaInfo(
    selectedChamaId ? BigInt(selectedChamaId) : 0n
  );

  // Get selected chama members
  const { data: chamaMembers, isLoading: membersLoading } = useGetChamaMembers(
    selectedChamaId ? BigInt(selectedChamaId) : 0n
  );

  // Join chama hook
  const { joinChama, hash, error, isPending, isConfirming, isConfirmed } = useJoinChama();

  const chamaInfo = formatChamaInfo(chamaData);

  // Generate list of available chamas (first 10)
  const availableChamas = [];
  const maxChamas = Math.min(Number(chamaCount || 0), 10);
  
  for (let i = 1; i <= maxChamas; i++) {
    availableChamas.push(i);
  }

  // Handle success
  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: 'Successfully Joined!',
        description: (
          <div className="space-y-2">
            <p>You have successfully joined the chama!</p>
            <a 
              href={`https://explorer.testnet.citrea.xyz/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
            >
              <ExternalLink className="w-3 h-3" />
              View Transaction
            </a>
          </div>
        ),
      });
      onOpenChange(false);
      setSelectedChamaId('');
    }
  }, [isConfirmed, hash, toast, onOpenChange]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Join Failed',
        description: error.message.includes('execution reverted') 
          ? 'Failed to join chama. You may already be a member or the chama may be full.'
          : error.message.split('\n')[0],
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleJoin = () => {
    if (!selectedChamaId || !chamaInfo) return;
    
    try {
      // Pass collateral amount equal to contribution amount
      joinChama(BigInt(selectedChamaId), chamaInfo.contributionAmount);
    } catch (err) {
      console.error('Error joining chama:', err);
      toast({
        title: 'Error',
        description: 'Failed to join chama',
        variant: 'destructive',
      });
    }
  };

  const resetModal = () => {
    setSelectedChamaId('');
  };

  const isLoading = isPending || isConfirming;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetModal();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Join a Chama
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Chama Selection */}
          <div className="space-y-2">
            <Label htmlFor="chama-select">Select a Chama</Label>
            {countLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading available chamas...</span>
              </div>
            ) : availableChamas.length > 0 ? (
              <Select value={selectedChamaId} onValueChange={setSelectedChamaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a chama to join" />
                </SelectTrigger>
                <SelectContent>
                  {availableChamas.map((chamaId) => (
                    <ChamaSelectItem key={chamaId} chamaId={BigInt(chamaId)} />
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No chamas available to join at the moment.
                </p>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoadingChama && selectedChamaId && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading chama details...</span>
            </div>
          )}

          {/* Error State */}
          {chamaError && selectedChamaId && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                Error loading chama data. Please try selecting a different chama.
              </p>
            </div>
          )}

          {/* Chama Info Display */}
          {chamaInfo && selectedChamaId && !chamaError && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {chamaInfo.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    chamaInfo.active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {chamaInfo.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-orange-500" />
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Contribution</div>
                      <div className="font-mono text-gray-900 dark:text-white">
                        {formatSatsFromWei(chamaInfo.contributionAmount).toLocaleString()} sats
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Cycle Duration</div>
                      <div className="text-gray-900 dark:text-white">
                        {Number(chamaInfo.cycleDuration) / (24 * 60 * 60)} days
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Members</div>
                      <div className="text-gray-900 dark:text-white">
                        {membersLoading ? '...' : (chamaMembers?.length || 0)} / {Number(chamaInfo.maxMembers)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Current Cycle</div>
                      <div className="text-gray-900 dark:text-white">
                        {Number(chamaInfo.currentCycle)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collateral Information */}
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      <div className="font-medium mb-1">Security Deposit Required</div>
                      <div>
                        You'll need to deposit <strong>{formatSatsFromWei(chamaInfo.contributionAmount).toLocaleString()} sats</strong> as collateral. 
                        This deposit will be returned after you complete all cycles successfully.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status warnings - but don't block joining if chama hasn't started */}
                {!chamaInfo.active && Number(chamaInfo.currentCycle) > 0 && (
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      This chama is not currently active.
                    </p>
                  </div>
                )}

                {Number(chamaInfo.currentCycle) > 0 && (
                  <div className="p-2 bg-red-50 dark:bg-red-900 rounded border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      This chama has already started. You cannot join after the first cycle begins.
                    </p>
                  </div>
                )}

                {chamaMembers && chamaMembers.length >= Number(chamaInfo.maxMembers) && (
                  <div className="p-2 bg-red-50 dark:bg-red-900 rounded border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      This chama is full. All member slots have been taken.
                    </p>
                  </div>
                )}

                {/* Show positive message if chama is joinable */}
                {Number(chamaInfo.currentCycle) === 0 && 
                 chamaMembers && 
                 chamaMembers.length < Number(chamaInfo.maxMembers) && (
                  <div className="p-2 bg-green-50 dark:bg-green-900 rounded border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ✅ This chama is accepting new members! You can join now.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Connection Warning */}
          {!isConnected && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Please connect your wallet to join a chama.
              </p>
            </div>
          )}

          {/* Action Buttons */}
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
              onClick={handleJoin}
              className="flex-1 btn-primary"
              disabled={
                isLoading || 
                !isConnected || 
                !selectedChamaId || 
                Number(chamaInfo?.currentCycle || 0) > 0 ||
                (chamaMembers && chamaMembers.length >= Number(chamaInfo?.maxMembers || 0))
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isPending ? 'Joining...' : 'Confirming...'}
                </>
              ) : !isConnected ? (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Connect Wallet
                </>
              ) : !selectedChamaId ? (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Select a Chama
                </>
              ) : Number(chamaInfo?.currentCycle || 0) > 0 ? (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Already Started
                </>
              ) : (chamaMembers && chamaMembers.length >= Number(chamaInfo?.maxMembers || 0)) ? (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Chama Full
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Join Chama
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Component for individual chama select items
const ChamaSelectItem: React.FC<{ chamaId: bigint }> = ({ chamaId }) => {
  const { data: chamaData } = useGetChamaInfo(chamaId);
  const { data: chamaMembers } = useGetChamaMembers(chamaId);
  
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
  // Focus on key criteria: hasn't started (cycle 0) and not full
  const isJoinable = Number(chamaInfo.currentCycle) === 0 && memberCount < Number(chamaInfo.maxMembers);
  
  // Get status text
  const getStatusText = () => {
    if (Number(chamaInfo.currentCycle) > 0) return 'Started';
    if (memberCount >= Number(chamaInfo.maxMembers)) return 'Full';
    if (!chamaInfo.active && Number(chamaInfo.currentCycle) > 0) return 'Inactive';
    return 'Open';
  };

  const statusText = getStatusText();

  return (
    <SelectItem value={chamaId.toString()}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isJoinable ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="font-medium">{chamaInfo.name}</span>
        </div>
        <div className="text-xs text-gray-500 ml-2 flex items-center gap-2">
          <span>{memberCount}/{Number(chamaInfo.maxMembers)}</span>
          <span>•</span>
          <span>{formatSatsFromWei(chamaInfo.contributionAmount).toLocaleString()} sats</span>
          <span>•</span>
          <span className={`px-1 py-0.5 rounded text-xs ${
            isJoinable 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {statusText}
          </span>
        </div>
      </div>
    </SelectItem>
  );
};
