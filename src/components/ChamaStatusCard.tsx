import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Clock, 
  Coins, 
  AlertCircle, 
  CheckCircle, 
  PlayCircle,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useChamaNotifications } from '@/hooks/useChamaNotifications';
import { formatSatsFromWei } from '@/hooks/useJengaContract';
import { Address } from 'viem';

interface ChamaStatusCardProps {
  chamaId: bigint;
  userAddress?: Address;
  onJoin?: () => void;
  onContribute?: () => void;
}

export const ChamaStatusCard: React.FC<ChamaStatusCardProps> = ({
  chamaId,
  userAddress,
  onJoin,
  onContribute
}) => {
  const { chamaInfo, refetch, isPolling } = useChamaNotifications({
    chamaId,
    userAddress,
    enabled: true
  });

  if (!chamaInfo) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  const memberCount = chamaInfo.members?.length || 0;
  const maxMembers = chamaInfo.maxMembers ? Number(chamaInfo.maxMembers) : 0;
  const memberProgress = maxMembers > 0 ? (memberCount / maxMembers) * 100 : 0;
  const isFull = memberCount >= maxMembers;
  const hasStarted = chamaInfo.currentCycle ? Number(chamaInfo.currentCycle) > 0 : false;
  const isUserMember = userAddress && chamaInfo.members?.includes(userAddress);

  const getStatusInfo = () => {
    if (!chamaInfo.active) {
      return {
        status: 'Completed',
        color: 'bg-gray-500',
        icon: CheckCircle,
        description: 'This chama has completed all cycles'
      };
    }
    
    if (!isFull) {
      return {
        status: 'Recruiting',
        color: 'bg-blue-500',
        icon: Users,
        description: `Waiting for ${maxMembers - memberCount} more members`
      };
    }
    
    if (!hasStarted) {
      return {
        status: 'Ready to Start',
        color: 'bg-yellow-500',
        icon: PlayCircle,
        description: 'All members joined, ready to begin'
      };
    }
    
    return {
      status: 'Active',
      color: 'bg-green-500',
      icon: TrendingUp,
      description: `Cycle ${chamaInfo.currentCycle ? Number(chamaInfo.currentCycle) : 0} in progress`
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="relative overflow-hidden">
      {/* Live indicator */}
      {isPolling && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{chamaInfo.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${statusInfo.color} text-white`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {statusInfo.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Member Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Members</span>
            </div>
            <span className="font-medium">{memberCount}/{maxMembers}</span>
          </div>
          <Progress value={memberProgress} className="h-2" />
          {!isFull && (
            <p className="text-xs text-gray-500">
              {maxMembers - memberCount} more members needed
            </p>
          )}
        </div>

        {/* Contribution Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4" />
            <span>Per Round</span>
          </div>
          <span className="font-mono">
            {chamaInfo.contributionAmount ? 
              formatSatsFromWei(chamaInfo.contributionAmount).toLocaleString() : '0'
            } sats
          </span>
        </div>

        {/* Cycle Duration */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Cycle Duration</span>
          </div>
          <span>
            {(() => {
              const duration = chamaInfo.cycleDuration ? Number(chamaInfo.cycleDuration) : 0;
              if (duration >= 86400) {
                return `${Math.floor(duration / 86400)} days`;
              } else if (duration >= 3600) {
                return `${Math.floor(duration / 3600)} hours`;
              } else if (duration >= 60) {
                return `${Math.floor(duration / 60)} minutes`;
              } else {
                return `${duration} seconds`;
              }
            })()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t">
          {!isUserMember && !isFull && chamaInfo.active && (
            <Button 
              onClick={onJoin} 
              className="w-full"
              variant="default"
            >
              <Users className="w-4 h-4 mr-2" />
              Join Chama
            </Button>
          )}
          
          {isUserMember && hasStarted && (
            <Button 
              onClick={onContribute} 
              className="w-full"
              variant="default"
            >
              <Coins className="w-4 h-4 mr-2" />
              Contribute Now
            </Button>
          )}
          
          {isFull && !hasStarted && (
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Chama is full! Waiting to start first cycle.
              </p>
            </div>
          )}
          
          {!chamaInfo.active && (
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <CheckCircle className="w-5 h-5 text-gray-600 mx-auto mb-1" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This chama has completed all cycles.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
