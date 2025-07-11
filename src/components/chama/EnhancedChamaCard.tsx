import React, { useState } from 'react';
import { Users, Calendar, Bitcoin, TrendingUp, Plus, CheckCircle, Gift, Clock, Crown } from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { 
  useHasContributedThisCycle, 
  useGetUserContributions, 
  useLastContributionTimestamp,
  useGetMemberPayoutPosition,
  useHasMemberReceivedPayout,
  useGetChamaMembers,
  formatSatsFromWei,
  getChamaUserStatus
} from '../../hooks/useJengaContract';
import { ChamaActionModal } from '../modals/ChamaActionModal';

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

interface EnhancedChamaCardProps {
  chama: ChamaInfo;
}

export const EnhancedChamaCard: React.FC<EnhancedChamaCardProps> = ({ chama }) => {
  const { address } = useAccount();
  const [actionModalOpen, setActionModalOpen] = useState(false);

  // Check user's status in this chama
  const { data: hasContributed } = useHasContributedThisCycle(chama.id, address!);
  const { data: userContributions } = useGetUserContributions(chama.id, address!);
  const { data: memberPosition } = useGetMemberPayoutPosition(chama.id, address!);
  const { data: hasReceivedPayout } = useHasMemberReceivedPayout(chama.id, address!);
  const { data: chamaMembers } = useGetChamaMembers(chama.id);

  // Calculate chama info
  const contributionSats = formatSatsFromWei(chama.contributionAmount);
  const cycleDurationDays = Number(chama.cycleDuration) / (24 * 60 * 60);
  const totalPoolSats = formatSatsFromWei(chama.totalPool);
  const currentMembers = chamaMembers?.length || 0;
  const isMember = chamaMembers?.includes(address!) || false;
  
  // Get user status
  const userStatus = getChamaUserStatus(
    chama,
    address!,
    hasContributed || false,
    hasReceivedPayout || false,
    Number(memberPosition || 0),
    chamaMembers as Address[] // Pass the actual members array from the hook
  );

  // Get current recipient
  const currentRecipient = chamaMembers?.[Number(chama.currentRecipientIndex)] || null;
  const isCurrentRecipient = currentRecipient === address;

  // Get status color
  const getStatusColor = () => {
    if (!chama.active) return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    if (Number(chama.currentCycle) === 0) return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
    return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
  };

  const getStatusText = () => {
    if (!chama.active) return 'Completed';
    if (Number(chama.currentCycle) === 0) return 'Forming';
    return `Cycle ${Number(chama.currentCycle)}`;
  };

  const getQuickStatusIcon = () => {
    switch (userStatus) {
      case 'current_recipient': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'received_payout': return <Gift className="w-4 h-4 text-green-500" />;
      case 'contributed_this_cycle': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'waiting_to_start': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'not_member': return <Plus className="w-4 h-4 text-orange-500" />;
      default: return <Bitcoin className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <>
      <div 
        className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border p-6 hover:shadow-md transition-all hover:scale-105 cursor-pointer"
        onClick={() => setActionModalOpen(true)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground truncate">
            {chama.name}
          </h3>
          <div className="flex items-center gap-2">
            {getQuickStatusIcon()}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Bitcoin className="w-4 h-4 text-orange-500" />
            <span>{contributionSats.toLocaleString()} sats per cycle</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{cycleDurationDays} day cycles</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 text-green-500" />
            <span>{currentMembers}/{Number(chama.maxMembers)} members</span>
          </div>

          {Number(chama.currentCycle) > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span>Pool: {totalPoolSats.toLocaleString()} sats</span>
            </div>
          )}
        </div>

        {/* Member Status */}
        {isMember && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <div className="font-medium">You're a member!</div>
              <div className="flex justify-between items-center mt-1">
                <span>Position: #{Number(memberPosition || 0) + 1}</span>
                <span>Contributions: {userContributions?.length || 0}</span>
              </div>
              {hasReceivedPayout && (
                <div className="text-green-600 dark:text-green-400 font-medium mt-1">
                  ✓ Payout received
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Recipient Info */}
        {Number(chama.currentCycle) > 0 && currentRecipient && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <div className="font-medium">Current Recipient</div>
              <div className="truncate">
                {isCurrentRecipient ? 'You!' : `${currentRecipient.slice(0, 6)}...${currentRecipient.slice(-4)}`}
              </div>
            </div>
          </div>
        )}

        {/* Click to interact hint */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 border-t pt-3">
          Click to interact
        </div>
      </div>

      {/* Action Modal */}
      <ChamaActionModal
        open={actionModalOpen}
        onOpenChange={setActionModalOpen}
        chama={chama}
        userStatus={userStatus}
        memberPosition={Number(memberPosition || 0)}
        hasContributed={hasContributed}
        hasReceivedPayout={hasReceivedPayout}
        chamaMembers={chamaMembers}
      />
    </>
  );
};
