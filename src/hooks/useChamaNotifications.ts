import { useEffect, useRef } from 'react';
import { useToast } from './use-toast';
import { useGetChamaInfo, useGetChamaMembers } from './useJengaContract';
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
  name: string;
  maxMembers: number;
}

export function useChamaNotifications({ chamaId, userAddress, enabled = true }: ChamaNotificationProps) {
  const { toast } = useToast();
  const prevStateRef = useRef<ChamaState | null>(null);
  
  // Get chama info and members separately for better data handling
  const { 
    data: chamaInfo, 
    refetch: refetchInfo,
    error: chamaError,
    isLoading: chamaLoading 
  } = useGetChamaInfo(chamaId);
  
  const { 
    data: chamaMembers, 
    refetch: refetchMembers,
    error: membersError,
    isLoading: membersLoading 
  } = useGetChamaMembers(chamaId);
  
  // Combined refetch function
  const refetch = () => {
    refetchInfo();
    refetchMembers();
  };
  
  // Auto-refresh every 15 seconds when enabled
  useEffect(() => {
    if (!enabled || chamaId <= 0n) return;
    
    const interval = setInterval(() => {
      refetch();
    }, 15000); // 15 seconds to avoid too frequent calls
    
    return () => clearInterval(interval);
  }, [enabled, chamaId]); // Removed refetch from deps to avoid recreation
  
  // Check for state changes and show notifications
  useEffect(() => {
    if (!chamaInfo || !enabled || chamaError || membersError) return;
    
    // Safely extract data with fallbacks
    const memberCount = Array.isArray(chamaMembers) ? chamaMembers.length : 0;
    const name = chamaInfo[0] || 'Unknown Chama'; // name is first element
    const maxMembers = chamaInfo[3] ? Number(chamaInfo[3]) : 0; // maxMembers is 4th element
    const active = chamaInfo[4] || false; // active is 5th element
    const currentCycle = chamaInfo[5] ? Number(chamaInfo[5]) : 0; // currentCycle is 6th element
    const currentRecipientIndex = chamaInfo[6] ? Number(chamaInfo[6]) : 0; // currentRecipientIndex is 7th element
    
    const currentState: ChamaState = {
      memberCount,
      active,
      currentCycle,
      currentRecipientIndex,
      name,
      maxMembers,
    };
    
    if (prevStateRef.current) {
      const prevState = prevStateRef.current;
      
      // Chama became full
      if (currentState.memberCount >= currentState.maxMembers && 
          prevState.memberCount < currentState.maxMembers &&
          currentState.maxMembers > 0) {
        toast({
          title: "🎉 Chama is Full!",
          description: `${currentState.name} now has all ${currentState.maxMembers} members. Contributions can begin!`,
          duration: 8000,
        });
      }
      
      // New member joined
      if (currentState.memberCount > prevState.memberCount && currentState.memberCount > 0) {
        toast({
          title: "👥 New Member Joined",
          description: `${currentState.name} now has ${currentState.memberCount}/${currentState.maxMembers} members`,
          duration: 5000,
        });
      }
      
      // Chama started (first cycle)
      if (currentState.currentCycle > 0 && prevState.currentCycle === 0) {
        toast({
          title: "🚀 Chama Started!",
          description: `${currentState.name} has begun its first cycle. Time to contribute!`,
          duration: 8000,
        });
      }
      
      // New cycle started
      if (currentState.currentCycle > prevState.currentCycle && 
          currentState.currentCycle > 0 && 
          prevState.currentCycle > 0) {
        toast({
          title: "🔄 New Cycle Started",
          description: `${currentState.name} - Cycle ${currentState.currentCycle} has begun`,
          duration: 6000,
        });
      }
      
      // New recipient selected (only if cycle is active)
      if (currentState.currentRecipientIndex !== prevState.currentRecipientIndex &&
          currentState.currentCycle > 0) {
        const recipientPosition = currentState.currentRecipientIndex + 1;
        toast({
          title: "🎯 New Recipient Selected",
          description: `Member #${recipientPosition} will receive this cycle's payout in ${currentState.name}`,
          duration: 6000,
        });
      }
      
      // Chama completed
      if (!currentState.active && prevState.active) {
        toast({
          title: "✅ Chama Completed!",
          description: `${currentState.name} has completed all cycles. Collateral is being returned.`,
          duration: 10000,
        });
      }
    }
    
    prevStateRef.current = currentState;
  }, [chamaInfo, chamaMembers, enabled, toast, chamaError, membersError]);
  
  // Show error notifications
  useEffect(() => {
    if (chamaError && enabled) {
      toast({
        title: "⚠️ Error Loading Chama",
        description: "Failed to load chama information. Retrying...",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [chamaError, enabled, toast]);
  
  useEffect(() => {
    if (membersError && enabled) {
      toast({
        title: "⚠️ Error Loading Members",
        description: "Failed to load chama members. Retrying...",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [membersError, enabled, toast]);
  
  return {
    chamaInfo,
    chamaMembers,
    refetch,
    isPolling: enabled,
    isLoading: chamaLoading || membersLoading,
    error: chamaError || membersError,
    currentState: prevStateRef.current,
  };
}
