import { Button } from '@/components/ui/button';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { 
  Wallet,
  UserPlus, 
  Coins, 
  Target, 
  CheckCircle, 
  ArrowLeft,
  Share2,
  Shield,
  Users,
  AlertCircle
} from 'lucide-react';
import { formatUnits, type Address } from 'viem';

interface ChamaInfo {
  contribution: bigint;
  securityDeposit: bigint;
  totalMembers: number;
  memberTarget: number;
  status: number;
  currentRound: number;
}

interface UserMembershipStatus {
  isMember: boolean;
  isCreator: boolean;
  hasContributed: boolean;
}

interface RoscaStatus {
  status: number | null;
  canStart: boolean;
}

interface ActionButtonsProps {
  accessLevel: 'GUEST' | 'CREATOR' | 'MEMBER' | 'CAN_JOIN' | 'VIEWER';
  chamaInfo: ChamaInfo | null;
  userMembershipStatus: UserMembershipStatus;
  roscaStatus: RoscaStatus;
  isActionLoading: boolean;
  onJoin: () => void;
  onContribute: () => void;
  onStartROSCA: () => void;
  onShare: () => void;
  getTokenSymbol: () => string;
  formatTokenAmount: (amount: bigint) => string;
}

export function ChamaActionButtons({
  accessLevel,
  chamaInfo,
  userMembershipStatus,
  roscaStatus,
  isActionLoading,
  onJoin,
  onContribute,
  onStartROSCA,
  onShare,
  getTokenSymbol,
  formatTokenAmount
}: ActionButtonsProps) {
  const { setShowAuthFlow } = useDynamicContext();

  if (!chamaInfo) return null;

  // GUEST: Not logged in - only show connect wallet
  if (accessLevel === 'GUEST') {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet size={32} className="text-blue-600" />
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          Connect Your Wallet
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Connect your wallet to view chama details and participate in savings circles.
        </p>
        <Button
          onClick={() => setShowAuthFlow(true)}
          className="bg-bitcoin hover:bg-bitcoin/90"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </div>
    );
  }

  // CREATOR: Full access + management capabilities
  if (accessLevel === 'CREATOR') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-bitcoin/10 rounded-lg">
          <Shield className="w-5 h-5 text-bitcoin" />
          <span className="text-sm font-medium text-bitcoin">You created this chama</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Start ROSCA Button - show when status is WAITING (1) and can start */}
          {roscaStatus.status === 1 && roscaStatus.canStart && (
            <Button
              onClick={onStartROSCA}
              disabled={isActionLoading}
              className="bg-green-600 hover:bg-green-700 col-span-full"
            >
              <Target className="w-4 h-4 mr-2" />
              {isActionLoading ? 'Starting...' : 'Start ROSCA'}
            </Button>
          )}
          
          {/* Contribute Button - if can contribute */}
          {userMembershipStatus.isMember && !userMembershipStatus.hasContributed && chamaInfo.status === 2 && (
            <Button
              onClick={onContribute}
              disabled={isActionLoading}
              className="bg-bitcoin hover:bg-bitcoin/90"
            >
              <Coins className="w-4 h-4 mr-2" />
              {isActionLoading ? 'Contributing...' : 'Contribute'}
            </Button>
          )}
          
          {/* Already Contributed */}
          {userMembershipStatus.hasContributed && (
            <Button disabled className="bg-gray-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              Already Contributed
            </Button>
          )}
          
          {/* Invite Members */}
          <Button
            onClick={onShare}
            variant="outline"
            className="border-bitcoin/50 text-bitcoin hover:bg-bitcoin/10"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Members
          </Button>
        </div>
      </div>
    );
  }

  // MEMBER: Can contribute and participate
  if (accessLevel === 'MEMBER') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-600">You are a member</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Start ROSCA Button - any member can start when ready */}
          {roscaStatus.status === 1 && roscaStatus.canStart && (
            <Button
              onClick={onStartROSCA}
              disabled={isActionLoading}
              className="bg-green-600 hover:bg-green-700 col-span-full"
            >
              <Target className="w-4 h-4 mr-2" />
              {isActionLoading ? 'Starting...' : 'Start ROSCA'}
            </Button>
          )}
          
          {/* Contribute Button */}
          {!userMembershipStatus.hasContributed && chamaInfo.status === 2 ? (
            <Button
              onClick={onContribute}
              disabled={isActionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Coins className="w-4 h-4 mr-2" />
              {isActionLoading ? 'Contributing...' : 'Contribute'}
            </Button>
          ) : userMembershipStatus.hasContributed ? (
            <Button disabled className="bg-gray-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              Already Contributed
            </Button>
          ) : (
            <Button disabled className="bg-gray-400">
              <Coins className="w-4 h-4 mr-2" />
              Waiting for Round
            </Button>
          )}
          
          {/* Share Button */}
          <Button
            onClick={onShare}
            variant="outline"
            className="border-green-500/50 text-green-600 hover:bg-green-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Chama
          </Button>
        </div>
      </div>
    );
  }

  // CAN_JOIN: Can see details and join
  if (accessLevel === 'CAN_JOIN') {
    return (
      <div className="space-y-3">
        <div className="text-center">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Join this Chama
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Secure your spot in this savings circle. You'll need to deposit{' '}
            <span className="font-semibold text-bitcoin">
              {formatTokenAmount(chamaInfo.securityDeposit)} {getTokenSymbol()}
            </span>{' '}
            as security.
          </p>
        </div>
        <Button
          onClick={onJoin}
          disabled={isActionLoading}
          className="w-full bg-gradient-to-r from-bitcoin to-orange-600 hover:scale-105 transition-transform font-bold"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {isActionLoading 
            ? 'Joining...' 
            : `Join Chama (${formatTokenAmount(chamaInfo.securityDeposit)} ${getTokenSymbol()})`
          }
        </Button>
      </div>
    );
  }

  // VIEWER: Can only view, cannot join (chama full or closed)
  if (accessLevel === 'VIEWER') {
    const isFullChama = chamaInfo.totalMembers >= chamaInfo.memberTarget;
    const isClosed = chamaInfo.status !== 0; // Not recruiting
    
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
          {isFullChama ? <Users size={32} className="text-orange-600" /> : <AlertCircle size={32} className="text-orange-600" />}
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          {isFullChama ? 'Chama Full' : isClosed ? 'Chama Closed' : 'Cannot Join'}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {isFullChama 
            ? 'This chama has reached its member limit. Check back later or explore other chamas.'
            : isClosed
            ? 'This chama is no longer accepting new members.'
            : 'You cannot join this chama at the moment.'
          }
        </p>
        <Button
          onClick={onShare}
          variant="outline"
          className="border-orange-500/50 text-orange-600 hover:bg-orange-50"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Chama
        </Button>
      </div>
    );
  }

  return null;
}
