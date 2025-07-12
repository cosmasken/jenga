import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useGetChamaInfo, useGetChamaCount } from './useJengaContract';
import { Address } from 'viem';

interface ChamaEvent {
  type: 'created' | 'joined' | 'full' | 'started' | 'contributed' | 'payout';
  chamaId: bigint;
  timestamp: number;
  data?: any;
}

interface EventPollingState {
  events: ChamaEvent[];
  lastChamaCount: number;
  watchedChamas: Map<string, any>; // chamaId -> last known state
}

export function useEventPolling(enabled: boolean = true) {
  const { address } = useAccount();
  const [events, setEvents] = useState<ChamaEvent[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const stateRef = useRef<EventPollingState>({
    events: [],
    lastChamaCount: 0,
    watchedChamas: new Map(),
  });

  // Get current chama count for detecting new chamas
  const { data: chamaCount, refetch: refetchCount } = useGetChamaCount();

  // Polling function
  const pollForEvents = async () => {
    if (!enabled || !address) return;

    setIsPolling(true);
    
    try {
      // Refetch chama count
      const { data: currentCount } = await refetchCount();
      const count = Number(currentCount || 0);
      
      // Check for new chamas (created events)
      if (count > stateRef.current.lastChamaCount) {
        for (let i = stateRef.current.lastChamaCount + 1; i <= count; i++) {
          const newEvent: ChamaEvent = {
            type: 'created',
            chamaId: BigInt(i),
            timestamp: Date.now(),
          };
          
          stateRef.current.events.push(newEvent);
          setEvents([...stateRef.current.events]);
        }
        stateRef.current.lastChamaCount = count;
      }

      // Check existing chamas for state changes
      for (let i = 1; i <= count; i++) {
        const chamaId = BigInt(i);
        const chamaKey = chamaId.toString();
        
        // This would ideally use a batch call, but for demo we'll check a few
        if (i <= 5) { // Limit to first 5 chamas for performance
          // Get current chama state (you'd implement this)
          // For now, we'll simulate state checking
          checkChamaStateChanges(chamaId, chamaKey);
        }
      }
    } catch (error) {
      console.error('Error polling for events:', error);
    } finally {
      setIsPolling(false);
    }
  };

  const checkChamaStateChanges = (chamaId: bigint, chamaKey: string) => {
    // This would check for:
    // - Member count changes (joined events)
    // - Chama becoming full
    // - Chama starting (currentCycle > 0)
    // - New contributions
    // - Payouts processed
    
    // For now, we'll implement a simplified version
    // In production, you'd use the actual contract data
  };

  // Start polling when enabled
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(pollForEvents, 5000); // 5 seconds
    
    // Initial poll
    pollForEvents();

    return () => clearInterval(interval);
  }, [enabled, address]);

  // Initialize chama count
  useEffect(() => {
    if (chamaCount) {
      stateRef.current.lastChamaCount = Number(chamaCount);
    }
  }, [chamaCount]);

  const clearEvents = () => {
    stateRef.current.events = [];
    setEvents([]);
  };

  const addManualEvent = (event: ChamaEvent) => {
    stateRef.current.events.push(event);
    setEvents([...stateRef.current.events]);
  };

  return {
    events,
    isPolling,
    clearEvents,
    addManualEvent,
    pollNow: pollForEvents,
  };
}
