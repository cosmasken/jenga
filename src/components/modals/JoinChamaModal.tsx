import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Bitcoin, Clock, TrendingUp, Search, ExternalLink } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useJoinChama, useGetChamaInfo, useGetChamaCount, formatChamaInfo } from '../../hooks/useJengaContract';
import { formatUnits } from 'viem';
import { useTranslation } from 'react-i18next';

interface JoinChamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinChamaModal: React.FC<JoinChamaModalProps> = ({ open, onOpenChange }) => {
  const [chamaId, setChamaId] = useState('');
  const [selectedChamaId, setSelectedChamaId] = useState<bigint | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isConnected } = useAccount();

  // Get chama info for the entered ID
  const { data: chamaData, isLoading: isLoadingChama, error: chamaError } = useGetChamaInfo(
    chamaId ? BigInt(chamaId) : 0n
  );

  // Join chama hook
  const { joinChama, hash, error, isPending, isConfirming, isConfirmed } = useJoinChama();

  const chamaInfo = formatChamaInfo(chamaData);
  const isLoading = isPending || isConfirming;

  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: t('chama.joinSuccess'),
        description: (
          <div className="flex items-center gap-2">
            <span>Successfully joined the chama!</span>
            <a
              href={`https://explorer.testnet.citrea.xyz/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
            >
              <ExternalLink className="w-3 h-3" />
              View
            </a>
          </div>
        ),
      });
      
      // Reset modal after success
      setTimeout(() => {
        setChamaId('');
        setSelectedChamaId(null);
        onOpenChange(false);
      }, 2000);
    }
  }, [isConfirmed, hash, toast, t, onOpenChange]);

  // Handle join chama
  const handleJoin = async () => {
    if (!chamaId || !chamaInfo) return;

    try {
      setSelectedChamaId(BigInt(chamaId));
      joinChama(BigInt(chamaId));
    } catch (err) {
      console.error('Error joining chama:', err);
      toast({
        title: t('chama.joinFailed'),
        description: 'An unexpected error occurred. Please try again.',
        variant: "destructive",
      });
      setSelectedChamaId(null);
    }
  };

  const handleSearch = () => {
    if (!chamaId) {
      toast({
        title: 'Enter Chama ID',
        description: 'Please enter a chama ID to search.',
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-card border border-gray-200 dark:border-border">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Join a Chama</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chamaId" className="text-gray-700 dark:text-gray-300">
                Chama ID
              </Label>
              <div className="flex gap-2">
                <Input
                  id="chamaId"
                  type="number"
                  value={chamaId}
                  onChange={(e) => setChamaId(e.target.value)}
                  placeholder="Enter chama ID (e.g., 1, 2, 3...)"
                  className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSearch}
                  disabled={!chamaId || isLoadingChama}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                >
                  {isLoadingChama ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Error State */}
            {chamaError && chamaId && (
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Chama not found or error loading chama data.
                </p>
              </div>
            )}

            {/* Chama Info Display */}
            {chamaInfo && chamaId && !chamaError && (
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
                          {formatUnits(chamaInfo.contributionAmount, 18)} cBTC
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
                          ? / {Number(chamaInfo.maxMembers)}
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

                  {!chamaInfo.active && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900 rounded border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        This chama is not currently active.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleJoin}
              className="flex-1 btn-primary"
              disabled={!chamaInfo || !chamaInfo.active || !isConnected || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isPending ? 'Confirming...' : 'Joining...'}
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Join Chama
                </>
              )}
            </Button>
          </div>

          {/* Transaction Status */}
          {hash && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Transaction submitted!{' '}
                <a
                  href={`https://explorer.testnet.citrea.xyz/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  View on Explorer
                </a>
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error.message.includes('execution reverted') 
                  ? 'Transaction failed. The chama may be full or inactive.'
                  : error.message.split('\n')[0]
                }
              </p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

