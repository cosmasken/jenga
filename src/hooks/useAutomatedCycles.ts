import { useEffect, useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useGetAllChamas } from './useJengaContract';
import { useToast } from '@/hooks/use-toast';
import { Address } from 'viem';

interface CycleNotification {
  type: 'contribution_needed' | 'payout_received' | 'cycle_started' | 'chama_completed';
  chamaId: bigint;
  chamaName: string;
  message: string;
  timestamp: number;
  urgent?: boolean;
}

interface CycleState {
  chamaId: string;
  currentCycle: number;
  lastCycleTimestamp: number;
  contributionsNeeded: boolean;
  payoutPending: boolean;
}

export function useAutomatedCycles() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<CycleNotification[]>([]);
  const [cycleStates, setCycleStates] = useState<Map<string, CycleState>>(new Map());
  const previousStatesRef = useRef<Map<string, CycleState>>(new Map());

  // Get all chamas to monitor
  const { data: allChamas = [], refetch } = useGetAllChamas();

  // Auto-refresh every 30 seconds for cycle monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds for cycle monitoring

    return () => clearInterval(interval);
  }, [refetch]);

  // Monitor cycle changes and trigger notifications
  useEffect(() => {
    if (!address || !allChamas.length) return;

    const newStates = new Map<string, CycleState>();
    const newNotifications: CycleNotification[] = [];

    for (const chama of allChamas) {
      const members = Array.isArray(chama.members) ? chama.members : [];
      const isUserMember = members.includes(address);
      
      if (!isUserMember) continue;

      const chamaKey = chama.id.toString();
      const currentCycle = Number(chama.currentCycle);
      const lastCycleTimestamp = Number(chama.lastCycleTimestamp);
      const cycleDuration = Number(chama.cycleDuration);
      const now = Math.floor(Date.now() / 1000);
      
      // Calculate cycle status
      const cycleEndTime = lastCycleTimestamp + cycleDuration;
      const timeUntilEnd = cycleEndTime - now;
      const contributionsNeeded = currentCycle > 0 && timeUntilEnd > 0;
      const payoutPending = timeUntilEnd <= 0 && currentCycle > 0;

      const currentState: CycleState = {
        chamaId: chamaKey,
        currentCycle,
        lastCycleTimestamp,
        contributionsNeeded,
        payoutPending,
      };

      newStates.set(chamaKey, currentState);

      // Check for state changes
      const previousState = previousStatesRef.current.get(chamaKey);
      
      if (previousState) {
        // New cycle started
        if (currentCycle > previousState.currentCycle && currentCycle > 0) {
          newNotifications.push({
            type: 'cycle_started',
            chamaId: chama.id,
            chamaName: chama.name,
            message: `Cycle ${currentCycle} has started! Time to contribute.`,
            timestamp: Date.now(),
            urgent: true,
          });
        }

        // Contribution deadline approaching (1 hour left)
        if (contributionsNeeded && timeUntilEnd > 0 && timeUntilEnd <= 3600 && 
            previousState.contributionsNeeded && !previousState.payoutPending) {
          newNotifications.push({
            type: 'contribution_needed',
            chamaId: chama.id,
            chamaName: chama.name,
            message: `⏰ Less than 1 hour left to contribute to ${chama.name}!`,
            timestamp: Date.now(),
            urgent: true,
          });
        }

        // Payout processed (cycle completed)
        if (!contributionsNeeded && !payoutPending && 
            (previousState.contributionsNeeded || previousState.payoutPending)) {
          // Check if user was the recipient (simplified - would need more contract data)
          const currentRecipientIndex = Number(chama.currentRecipientIndex);
          const isRecipient = members[currentRecipientIndex] === address;
          
          if (isRecipient) {
            newNotifications.push({
              type: 'payout_received',
              chamaId: chama.id,
              chamaName: chama.name,
              message: `💰 You received the payout from ${chama.name}!`,
              timestamp: Date.now(),
            });
          }
        }

        // Chama completed
        if (!chama.active && previousState && chama.active !== false) {
          newNotifications.push({
            type: 'chama_completed',
            chamaId: chama.id,
            chamaName: chama.name,
            message: `🎉 ${chama.name} has completed all cycles!`,
            timestamp: Date.now(),
          });
        }
      }
    }

    // Update states
    setCycleStates(newStates);
    previousStatesRef.current = new Map(newStates);

    // Show toast notifications for new notifications
    newNotifications.forEach(notification => {
      toast({
        title: getNotificationTitle(notification.type),
        description: notification.message,
        duration: notification.urgent ? 10000 : 6000,
      });
    });

    // Add to notification history
    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications].slice(-20)); // Keep last 20
    }

  }, [allChamas, address, toast]);

  const getNotificationTitle = (type: CycleNotification['type']) => {
    switch (type) {
      case 'cycle_started': return '🚀 New Cycle Started';
      case 'contribution_needed': return '⏰ Contribution Deadline';
      case 'payout_received': return '💰 Payout Received';
      case 'chama_completed': return '🎉 Chama Completed';
      default: return 'Chama Update';
    }
  };

  // Get urgent actions needed by user
  const getUrgentActions = () => {
    const actions = [];
    const now = Math.floor(Date.now() / 1000);

    for (const chama of allChamas) {
      const members = Array.isArray(chama.members) ? chama.members : [];
      const isUserMember = members.includes(address);
      
      if (!isUserMember) continue;

      const currentCycle = Number(chama.currentCycle);
      const lastCycleTimestamp = Number(chama.lastCycleTimestamp);
      const cycleDuration = Number(chama.cycleDuration);
      const cycleEndTime = lastCycleTimestamp + cycleDuration;
      const timeUntilEnd = cycleEndTime - now;

      // Need to contribute
      if (currentCycle > 0 && timeUntilEnd > 0) {
        // Check if user has contributed (simplified - would need contract data)
        actions.push({
          type: 'contribute' as const,
          chamaId: chama.id,
          chamaName: chama.name,
          timeLeft: timeUntilEnd,
          urgent: timeUntilEnd < 3600, // Less than 1 hour
        });
      }
    }

    return actions;
  };

  // Get summary stats
  const getSummaryStats = () => {
    let activeChamas = 0;
    let pendingContributions = 0;
    let completedCycles = 0;

    for (const chama of allChamas) {
      const members = Array.isArray(chama.members) ? chama.members : [];
      const isUserMember = members.includes(address);
      
      if (!isUserMember) continue;

      if (chama.active) {
        activeChamas++;
        
        const currentCycle = Number(chama.currentCycle);
        if (currentCycle > 0) {
          const now = Math.floor(Date.now() / 1000);
          const lastCycleTimestamp = Number(chama.lastCycleTimestamp);
          const cycleDuration = Number(chama.cycleDuration);
          const cycleEndTime = lastCycleTimestamp + cycleDuration;
          
          if (now < cycleEndTime) {
            pendingContributions++;
          }
        }
        
        completedCycles += Math.max(0, currentCycle - 1);
      }
    }

    return {
      activeChamas,
      pendingContributions,
      completedCycles,
      totalNotifications: notifications.length,
    };
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markNotificationAsRead = (timestamp: number) => {
    setNotifications(prev => prev.filter(n => n.timestamp !== timestamp));
  };

  return {
    notifications,
    cycleStates,
    urgentActions: getUrgentActions(),
    summaryStats: getSummaryStats(),
    clearNotifications,
    markNotificationAsRead,
    refreshCycles: refetch,
  };
}
