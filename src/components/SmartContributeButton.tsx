import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Timer
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useGetChamaInfo, formatSatsFromWei, useHasContributedThisCycle } from '@/hooks/useJengaContract';
import { Address } from 'viem';

interface SmartContributeButtonProps {
  chamaId: bigint;
  onContribute: () => void;
  className?: string;
}

export const SmartContributeButton: React.FC<SmartContributeButtonProps> = ({
  chamaId,
  onContribute,
  className = ""
}) => {
  const { address } = useAccount();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [cycleProgress, setCycleProgress] = useState(0);

  // Get chama info
  const { data: chamaInfo, refetch } = useGetChamaInfo(chamaId);
  
  // Check if user has contributed this cycle
  const { data: hasContributedThisCycle } = useHasContributedThisCycle(chamaId, address as Address);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Calculate time remaining and progress
  useEffect(() => {
    if (!chamaInfo) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const lastCycleTime = Number(chamaInfo.lastCycleTimestamp);
      const cycleDuration = Number(chamaInfo.cycleDuration);
      const cycleEndTime = lastCycleTime + cycleDuration;
      const timeRemaining = Math.max(0, cycleEndTime - now);
      
      if (timeRemaining > 0) {
        const hours = Math.floor(timeRemaining / 3600);
        const minutes = Math.floor((timeRemaining % 3600) / 60);
        const seconds = timeRemaining % 60;
        
        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
        
        // Calculate progress (how much of cycle has passed)
        const elapsed = cycleDuration - timeRemaining;
        const progress = (elapsed / cycleDuration) * 100;
        setCycleProgress(Math.min(100, Math.max(0, progress)));
      } else {
        setTimeLeft('Cycle ended');
        setCycleProgress(100);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [chamaInfo]);

  if (!chamaInfo || !address) return null;

  const members = Array.isArray(chamaInfo.members) ? chamaInfo.members : [];
  const isUserMember = members.includes(address);
  const currentCycle = Number(chamaInfo.currentCycle);
  const hasStarted = currentCycle > 0;
  const contributionAmount = formatSatsFromWei(chamaInfo.contributionAmount);
  
  // Check if user has contributed this cycle
  const hasContributedThisCycleValue = hasContributedThisCycle || false;

  // Determine button state
  const getButtonState = () => {
    if (!isUserMember) {
      return {
        show: false,
        text: '',
        variant: 'default' as const,
        disabled: true,
        icon: DollarSign,
        description: ''
      };
    }

    if (!hasStarted) {
      return {
        show: true,
        text: 'Waiting to Start',
        variant: 'outline' as const,
        disabled: true,
        icon: Clock,
        description: 'Chama will start when all members have joined'
      };
    }

    if (hasContributedThisCycleValue) {
      return {
        show: true,
        text: 'Contributed ✓',
        variant: 'outline' as const,
        disabled: true,
        icon: CheckCircle,
        description: `You've contributed ${contributionAmount.toLocaleString()} sats this cycle`
      };
    }

    if (timeLeft === 'Cycle ended') {
      return {
        show: true,
        text: 'Cycle Ended',
        variant: 'outline' as const,
        disabled: true,
        icon: AlertTriangle,
        description: 'Waiting for next cycle to start'
      };
    }

    return {
      show: true,
      text: `Contribute ${contributionAmount.toLocaleString()} sats`,
      variant: 'default' as const,
      disabled: false,
      icon: DollarSign,
      description: `Contribute to Cycle ${currentCycle} • ${timeLeft} remaining`
    };
  };

  const buttonState = getButtonState();
  const ButtonIcon = buttonState.icon;

  if (!buttonState.show) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Cycle Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Cycle {currentCycle}
          </Badge>
          {hasStarted && timeLeft !== 'Cycle ended' && (
            <div className="flex items-center gap-1 text-gray-600">
              <Timer className="w-3 h-3" />
              <span className="font-mono text-xs">{timeLeft}</span>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {members.length} members
        </div>
      </div>

      {/* Cycle Progress Bar */}
      {hasStarted && timeLeft !== 'Cycle ended' && (
        <div className="space-y-1">
          <Progress value={cycleProgress} className="h-2" />
          <div className="text-xs text-gray-500 text-center">
            Cycle progress: {Math.round(cycleProgress)}%
          </div>
        </div>
      )}

      {/* Contribute Button */}
      <Button
        onClick={onContribute}
        disabled={buttonState.disabled}
        variant={buttonState.variant}
        className="w-full flex items-center gap-2"
        size="lg"
      >
        <ButtonIcon className="w-4 h-4" />
        {buttonState.text}
      </Button>

      {/* Description */}
      {buttonState.description && (
        <p className="text-xs text-center text-gray-600 dark:text-gray-400">
          {buttonState.description}
        </p>
      )}

      {/* Contribution Status for All Members */}
      {hasStarted && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Member Contributions (Cycle {currentCycle})
          </div>
          <div className="space-y-1">
            {members.map((member, index) => {
              // This would need to be enhanced to check each member's contribution status
              const memberAddress = member.slice(0, 6) + '...' + member.slice(-4);
              const hasContributed = member === address ? hasContributedThisCycleValue : false; // Simplified
              
              return (
                <div key={member} className="flex items-center justify-between text-xs">
                  <span className={member === address ? 'font-medium' : ''}>
                    {member === address ? 'You' : `Member ${index + 1}`}
                    <span className="text-gray-500 ml-1">({memberAddress})</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {hasContributed ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <Clock className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={hasContributed ? 'text-green-600' : 'text-gray-500'}>
                      {hasContributed ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
