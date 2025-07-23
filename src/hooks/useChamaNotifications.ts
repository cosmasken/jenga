import { useEffect, useRef } from 'react';
import { useToast } from '../hooks/use-toast';
import { useGetChamaInfo } from './useJengaContract';
import { Address } from 'viem';

interface ChamaNotificationProps {
  chamaId: bigint;
  userAddress?: Address;
  enabled?: boolean;
}

interface ChamaState {
  memberCount: number;
  active: boolean;
  currentCycle: number;
  currentRecipientIndex: number;
}

interface ChamaInfo {
  name?: string;
  members?: Address[];
  active?: boolean;
  currentCycle?: bigint;
  currentRecipientIndex?: bigint;
  maxMembers?: bigint;
}

export function useChamaNotifications({ chamaId, userAddress, enabled = true }: ChamaNotificationProps) {
  const { toast } = useToast();
  const prevStateRef = useRef<ChamaState | null>(null);
  
  // Poll chama data more frequently
  const { data: chamaInfo, refetch } = useGetChamaInfo(chamaId);
  
  // Auto-refresh every 10 seconds when enabled
  useEffect(() => {
    if (!enabled || chamaId <= BigInt(0)) return;
    
    const interval = setInterval(() => {
      refetch();
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, [enabled, chamaId, refetch]);
  
  // Check for state changes and show notifications
  useEffect(() => {
    if (!chamaInfo || !enabled) return;
    
    const info = chamaInfo as ChamaInfo;
    const currentState: ChamaState = {
      memberCount: info.members?.length || 0,
      active: info.active || false,
      currentCycle: info.currentCycle ? Number(info.currentCycle) : 0,
      currentRecipientIndex: info.currentRecipientIndex ? Number(info.currentRecipientIndex) : 0,
    };
    
    if (prevStateRef.current) {
      const prevState = prevStateRef.current;
      
      // Chama became full
      const maxMembers = info.maxMembers ? Number(info.maxMembers) : 0;
      if (currentState.memberCount >= maxMembers && 
          prevState.memberCount < maxMembers) {
        toast({
          title: "🎉 Chama is Full!",
          description: `${info.name || 'Chama'} now has all ${maxMembers} members. Contributions can begin!`,
          duration: 8000,
        });
      }
      
      // New member joined
      if (currentState.memberCount > prevState.memberCount) {
        toast({
          title: "👥 New Member Joined",
          description: `${info.name || 'Chama'} now has ${currentState.memberCount}/${maxMembers} members`,
          duration: 5000,
        });
      }
      
      // Chama started (first cycle)
      if (currentState.currentCycle > 0 && prevState.currentCycle === 0) {
        toast({
          title: "🚀 Chama Started!",
          description: `${info.name || 'Chama'} has begun its first cycle. Time to contribute!`,
          duration: 8000,
        });
      }
      
      // New cycle started
      if (currentState.currentCycle > prevState.currentCycle && currentState.currentCycle > 0) {
        toast({
          title: "🔄 New Cycle Started",
          description: `${info.name || 'Chama'} - Cycle ${currentState.currentCycle} has begun`,
          duration: 6000,
        });
      }
      
      // New recipient selected
      if (currentState.currentRecipientIndex !== prevState.currentRecipientIndex) {
        toast({
          title: "🎯 New Recipient Selected",
          description: `A new member will receive this cycle's payout in ${info.name || 'Chama'}`,
          duration: 6000,
        });
      }
    }
    
    prevStateRef.current = currentState;
  }, [chamaInfo, enabled, toast]);
  
  return {
    chamaInfo,
    refetch,
    isPolling: enabled,
  };
}

// Export as grouped object
export const ChamaNotificationHooks = {
  useChamaNotifications,
};
