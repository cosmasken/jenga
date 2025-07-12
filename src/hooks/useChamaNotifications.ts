import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGetChamaInfo } from './useJengaContract';
import { Address } from 'viem';

interface ChamaNotificationProps {
  chamaId: bigint;
  userAddress?: Address;
  enabled?: boolean;
}

export function useChamaNotifications({ chamaId, userAddress, enabled = true }: ChamaNotificationProps) {
  const { toast } = useToast();
  const prevStateRef = useRef<any>(null);
  
  // Poll chama data more frequently
  const { data: chamaInfo, refetch } = useGetChamaInfo(chamaId);
  
  // Auto-refresh every 10 seconds when enabled
  useEffect(() => {
    if (!enabled || chamaId <= 0n) return;
    
    const interval = setInterval(() => {
      refetch();
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, [enabled, chamaId, refetch]);
  
  // Check for state changes and show notifications
  useEffect(() => {
    if (!chamaInfo || !enabled) return;
    
    const currentState = {
      memberCount: chamaInfo.members?.length || 0,
      active: chamaInfo.active,
      currentCycle: chamaInfo.currentCycle ? Number(chamaInfo.currentCycle) : 0,
      currentRecipientIndex: chamaInfo.currentRecipientIndex ? Number(chamaInfo.currentRecipientIndex) : 0,
    };
    
    if (prevStateRef.current) {
      const prevState = prevStateRef.current;
      
      // Chama became full
      const maxMembers = chamaInfo.maxMembers ? Number(chamaInfo.maxMembers) : 0;
      if (currentState.memberCount >= maxMembers && 
          prevState.memberCount < maxMembers) {
        toast({
          title: "🎉 Chama is Full!",
          description: `${chamaInfo.name} now has all ${maxMembers} members. Contributions can begin!`,
          duration: 8000,
        });
      }
      
      // New member joined
      if (currentState.memberCount > prevState.memberCount) {
        toast({
          title: "👥 New Member Joined",
          description: `${chamaInfo.name} now has ${currentState.memberCount}/${maxMembers} members`,
          duration: 5000,
        });
      }
      
      // Chama started (first cycle)
      if (currentState.currentCycle > 0 && prevState.currentCycle === 0) {
        toast({
          title: "🚀 Chama Started!",
          description: `${chamaInfo.name} has begun its first cycle. Time to contribute!`,
          duration: 8000,
        });
      }
      
      // New cycle started
      if (currentState.currentCycle > prevState.currentCycle && currentState.currentCycle > 0) {
        toast({
          title: "🔄 New Cycle Started",
          description: `${chamaInfo.name} - Cycle ${currentState.currentCycle} has begun`,
          duration: 6000,
        });
      }
      
      // New recipient selected
      if (currentState.currentRecipientIndex !== prevState.currentRecipientIndex) {
        toast({
          title: "🎯 New Recipient Selected",
          description: `A new member will receive this cycle's payout in ${chamaInfo.name}`,
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
