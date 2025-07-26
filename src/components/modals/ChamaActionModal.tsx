import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { 
  Bitcoin, 
  Users, 
  Calendar, 
  TrendingUp,   
  Plus, 
  CheckCircle, 
  Gift, 
  Clock, 
  Crown,
  ExternalLink,
  Info
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { 
  useStackBTC,
  useJoinChama,
  useGetMemberCollateral,
  useIsCollateralReturned,
  formatSatsFromWei
} from '../../hooks/useJengaContract';
import { Address } from 'viem';

interface ChamaInfo {
  id: bigint;
  name: string;
  contributionAmount: bigint;
  cycleDuration: bigint;
  maxMembers: bigint;
  members: string[];
  active: boolean;
  currentCycle: bigint;
  currentRecipientIndex: bigint;
  lastCycleTimestamp: bigint;
  totalPool: bigint;
}

interface ChamaActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chama: ChamaInfo;
  userStatus: string;
  memberPosition?: number;
  hasContributed?: boolean;
  hasReceivedPayout?: boolean;
  chamaMembers?: Address[];
}

export const ChamaActionModal: React.FC<ChamaActionModalProps> = ({
  open,
  onOpenChange,
  chama,
  userStatus,
  memberPosition,
  hasContributed,
  hasReceivedPayout,
  chamaMembers
}) => {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get collateral info
  const { data: memberCollateral } = useGetMemberCollateral(chama.id, address!);
  const { data: collateralReturned } = useIsCollateralReturned(chama.id, address!);

  // Transaction hooks
  const { stackBTC, isPending: stackPending, isConfirmed: stackConfirmed, hash: stackHash } = useStackBTC();
  const { joinChama, isPending: joinPending, isConfirmed: joinConfirmed, hash: joinHash } = useJoinChama();

  const contributionSats = formatSatsFromWei(chama.contributionAmount);
  const cycleDurationDays = Number(chama.cycleDuration) / (24 * 60 * 60);
  const currentMembers = chamaMembers?.length || 0;
  const currentRecipient = chamaMembers?.[Number(chama.currentRecipientIndex)];
  const isCurrentRecipient = currentRecipient === address;

  const handleJoinChama = async () => {
    setIsProcessing(true);
    try {
      joinChama(chama.id, chama.contributionAmount);
    } catch (error) {
      console.error('Error joining chama:', error);
      toast({
        title: 'Error',
        description: 'Failed to join chama',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStackBTC = async () => {
    setIsProcessing(true);
    try {
      stackBTC(chama.id, contributionSats);
    } catch (error) {
      console.error('Error stacking BTC:', error);
      toast({
        title: 'Error',
        description: 'Failed to stack BTC',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = () => {
    switch (userStatus) {
      case 'current_recipient': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'received_payout': return <Gift className="w-5 h-5 text-green-500" />;
      case 'contributed_this_cycle': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'waiting_to_start': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'not_member': return <Plus className="w-5 h-5 text-orange-500" />;
      default: return <Bitcoin className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (userStatus) {
      case 'current_recipient': return 'Your Turn to Receive!';
      case 'received_payout': return 'Payout Received';
      case 'contributed_this_cycle': return 'Contributed This Cycle';
      case 'waiting_to_start': return 'Waiting to Start';
      case 'not_member': return 'Join This Chama';
      case 'needs_to_contribute': return 'Contribution Required';
      case 'completed': return 'Chama Completed';
      default: return 'Chama Details';
    }
  };

  const getActionButton = () => {
    const isLoading = isProcessing || stackPending || joinPending;

    switch (userStatus) {
      case 'not_member':
        if (!chama.active || Number(chama.currentCycle) > 0) {
          return (
            <div className="text-center py-2 text-gray-500 text-sm">
              {!chama.active ? 'Chama Completed' : 'Already Started'}
            </div>
          );
        }
        return (
          <Button
            onClick={handleJoinChama}
            disabled={isLoading}
            className="w-full btn-primary"
          >
            {isLoading ? 'Joining...' : `Join (${contributionSats.toLocaleString()} sats collateral)`}
          </Button>
        );

      case 'needs_to_contribute':
        return (
          <Button
            onClick={handleStackBTC}
            disabled={isLoading}
            className="w-full btn-primary"
          >
            {isLoading ? 'Stacking...' : `Stack ${contributionSats.toLocaleString()} sats`}
          </Button>
        );

      case 'current_recipient':
        return (
          <div className="text-center py-4">
            <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
              🎉 It's your turn to receive the payout!
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Wait for all members to contribute this cycle
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-2 text-gray-500 text-sm">
            {userStatus === 'contributed_this_cycle' && 'Waiting for other members'}
            {userStatus === 'received_payout' && 'Continue contributing until completion'}
            {userStatus === 'waiting_to_start' && 'Waiting for more members to join'}
            {userStatus === 'completed' && 'Chama has completed successfully'}
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Chama Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">{chama.name}</h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Bitcoin className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Contribution</div>
                  <div className="font-mono">{contributionSats.toLocaleString()} sats</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Cycle</div>
                  <div>{cycleDurationDays} days</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Members</div>
                  <div>{currentMembers}/{Number(chama.maxMembers)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Cycle</div>
                  <div>{Number(chama.currentCycle)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Member Status */}
          {userStatus !== 'not_member' && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <div className="font-medium mb-1">Your Status</div>
                <div className="flex justify-between items-center">
                  <span>Position: #{(memberPosition || 0) + 1}</span>
                  {memberCollateral && (
                    <span>Collateral: {formatSatsFromWei(memberCollateral).toLocaleString()} sats</span>
                  )}
                </div>
                {hasReceivedPayout && (
                  <div className="text-green-600 dark:text-green-400 font-medium mt-1">
                    ✓ Payout received
                  </div>
                )}
                {collateralReturned && (
                  <div className="text-green-600 dark:text-green-400 font-medium mt-1">
                    ✓ Collateral returned
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Recipient Info */}
          {Number(chama.currentCycle) > 0 && currentRecipient && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                <div className="font-medium mb-1">Current Recipient</div>
                <div className="truncate">
                  {isCurrentRecipient ? 'You!' : `${currentRecipient.slice(0, 6)}...${currentRecipient.slice(-4)}`}
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {getActionButton()}

          {/* Transaction Links */}
          {(stackHash || joinHash) && (
            <div className="text-center">
              <a
                href={`https://explorer.testnet.citrea.xyz/tx/${stackHash || joinHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
              >
                <ExternalLink className="w-3 h-3" />
                View Transaction
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
