import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Crown, 
  Shield, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  User,
  Timer,
  Coins
} from 'lucide-react';
import { formatUnits, type Address } from 'viem';
import type { 
  EnhancedMemberInfo, 
  MembershipStatus, 
  DepositStatus, 
  ContributionStatus 
} from '@/types/member';

interface MemberStatusIndicatorProps {
  member: EnhancedMemberInfo;
  tokenSymbol: string;
  formatTokenAmount: (amount: bigint) => string;
  compact?: boolean;
  showPerformance?: boolean;
  onClick?: () => void;
}

export function MemberStatusIndicator({
  member,
  tokenSymbol,
  formatTokenAmount,
  compact = false,
  showPerformance = false,
  onClick
}: MemberStatusIndicatorProps) {
  const getMembershipStatusConfig = (status: MembershipStatus) => {
    switch (status) {
      case 'pending_deposit':
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          icon: Clock,
          label: 'Pending Deposit',
          description: 'Member joined but hasn\'t paid security deposit yet'
        };
      case 'deposit_paid':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          icon: CheckCircle,
          label: 'Ready',
          description: 'Deposit paid, waiting for ROSCA to start'
        };
      case 'active':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          icon: TrendingUp,
          label: 'Active',
          description: 'Actively participating in ROSCA'
        };
      case 'contributed':
        return {
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
          icon: Coins,
          label: 'Contributed',
          description: 'Contributed to current round'
        };
      case 'late':
        return {
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
          icon: AlertTriangle,
          label: 'Late',
          description: 'Has missed some contributions'
        };
      case 'defaulted':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          icon: XCircle,
          label: 'Defaulted',
          description: 'Missed too many contributions'
        };
      case 'winner':
        return {
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
          icon: Crown,
          label: 'Winner',
          description: 'Won a round and received payout'
        };
      case 'completed':
        return {
          color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
          icon: CheckCircle,
          label: 'Completed',
          description: 'Successfully completed all rounds'
        };
      case 'inactive':
        return {
          color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
          icon: XCircle,
          label: 'Inactive',
          description: 'No longer participating'
        };
    }
  };

  const getDepositStatusConfig = (status: DepositStatus) => {
    switch (status) {
      case 'not_required':
        return { color: 'text-gray-500', icon: Timer, label: 'N/A' };
      case 'required':
        return { color: 'text-yellow-600', icon: AlertTriangle, label: 'Required' };
      case 'paid':
        return { color: 'text-green-600', icon: CheckCircle, label: 'Paid' };
      case 'refunded':
        return { color: 'text-blue-600', icon: DollarSign, label: 'Refunded' };
      case 'forfeited':
        return { color: 'text-red-600', icon: XCircle, label: 'Forfeited' };
    }
  };

  const getContributionStatusConfig = (status: ContributionStatus) => {
    switch (status) {
      case 'not_due':
        return { color: 'text-gray-500', icon: Timer, label: 'Not Due' };
      case 'due':
        return { color: 'text-orange-600', icon: Clock, label: 'Due' };
      case 'paid':
        return { color: 'text-green-600', icon: CheckCircle, label: 'Paid' };
      case 'late':
        return { color: 'text-yellow-600', icon: AlertTriangle, label: 'Late' };
      case 'missed':
        return { color: 'text-red-600', icon: XCircle, label: 'Missed' };
      case 'excused':
        return { color: 'text-purple-600', icon: Crown, label: 'Excused' };
    }
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return { color: 'bg-green-100 text-green-800', label: 'Low Risk' };
    if (score >= 60) return { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Risk' };
    return { color: 'bg-red-100 text-red-800', label: 'High Risk' };
  };

  const membershipConfig = getMembershipStatusConfig(member.membershipStatus);
  const depositConfig = getDepositStatusConfig(member.depositStatus);
  const contributionConfig = getContributionStatusConfig(member.currentRoundStatus);
  const riskBadge = getRiskBadge(member.reliabilityScore);

  // Compact version for lists
  if (compact) {
    return (
      <div 
        className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
          onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750' : ''
        }`}
        onClick={onClick}
      >
        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.avatar} />
          <AvatarFallback className="text-sm">
            {member.displayName?.charAt(0) || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {member.displayName || `${member.address.slice(0, 6)}...${member.address.slice(-4)}`}
            </p>
            {member.isCreator && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Shield className="h-4 w-4 text-bitcoin" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Creator</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className={`text-xs ${membershipConfig.color}`}>
              <membershipConfig.icon className="h-3 w-3 mr-1" />
              {membershipConfig.label}
            </Badge>
            {showPerformance && (
              <span className="text-xs text-gray-500">
                {member.reliabilityScore}% reliability
              </span>
            )}
          </div>
        </div>

        {/* Status Icons */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className={`p-1 rounded ${depositConfig.color}`}>
                  <depositConfig.icon className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Deposit: {depositConfig.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className={`p-1 rounded ${contributionConfig.color}`}>
                  <contributionConfig.icon className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current Round: {contributionConfig.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  // Full detailed version
  return (
    <div className="space-y-4 p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={member.avatar} />
          <AvatarFallback className="text-lg">
            {member.displayName?.charAt(0) || <User className="h-6 w-6" />}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
              {member.displayName || 'Anonymous Member'}
            </h3>
            {member.isCreator && (
              <Badge className="bg-bitcoin text-white">
                <Shield className="h-3 w-3 mr-1" />
                Creator
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            {member.address}
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge className={membershipConfig.color}>
              <membershipConfig.icon className="h-3 w-3 mr-1" />
              {membershipConfig.label}
            </Badge>
            <Badge variant="outline" className={riskBadge.color}>
              {riskBadge.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Deposit Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Security Deposit
            </span>
          </div>
          <div className="flex items-center gap-2">
            <depositConfig.icon className={`h-4 w-4 ${depositConfig.color}`} />
            <span className={`text-sm ${depositConfig.color}`}>
              {depositConfig.label}
            </span>
            {member.depositAmount > 0n && (
              <span className="text-sm text-gray-500">
                ({formatTokenAmount(member.depositAmount)} {tokenSymbol})
              </span>
            )}
          </div>
        </div>

        {/* Current Round Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Round
            </span>
          </div>
          <div className="flex items-center gap-2">
            <contributionConfig.icon className={`h-4 w-4 ${contributionConfig.color}`} />
            <span className={`text-sm ${contributionConfig.color}`}>
              {contributionConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {showPerformance && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Performance Metrics
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {member.reliabilityScore}%
              </div>
              <div className="text-xs text-gray-500">Reliability</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {member.roundsPaid}/{member.roundsPaid + member.roundsMissed}
              </div>
              <div className="text-xs text-gray-500">Rounds Paid</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatTokenAmount(member.totalContributions)}
              </div>
              <div className="text-xs text-gray-500">Total Contributed</div>
            </div>
          </div>
        </div>
      )}

      {/* Payout Info */}
      {member.hasReceivedPayout && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            <Crown className="h-4 w-4 text-purple-600" />
            <span className="text-purple-600 font-medium">
              Won Round {member.payoutRound}
            </span>
            {member.payoutAmount && (
              <span className="text-gray-500">
                - Received {formatTokenAmount(member.payoutAmount)} {tokenSymbol}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberStatusIndicator;
