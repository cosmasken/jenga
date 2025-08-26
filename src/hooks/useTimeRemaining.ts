import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type Address } from 'viem';
import { useRosca } from './useRosca';
import { ROSCAStatus } from './useRosca';

export interface TimeRemainingData {
  /** Seconds remaining until ROSCA starts (for WAITING status) */
  timeUntilStart: number | null;
  /** Seconds remaining until current round ends (for ACTIVE status) */
  timeUntilRoundEnd: number | null;
  /** Current block timestamp from the contract */
  currentTime: number;
  /** Whether the timer has expired */
  isExpired: boolean;
  /** Round start timestamp */
  roundStartTime: number | null;
  /** Round deadline timestamp */
  roundDeadline: number | null;
  /** Round progress as percentage (0-100) */
  roundProgress: number | null;
  /** Time elapsed in current round */
  roundElapsedTime: number | null;
}

export interface ROSCATimingState {
  status: ROSCAStatus | null;
  currentRound: number;
  timeData: TimeRemainingData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for getting real-time timing information for a ROSCA
 */
export function useTimeRemaining(roscaAddress: Address): ROSCATimingState {
  const roscaHook = useRosca();
  const [localTime, setLocalTime] = useState(() => Math.floor(Date.now() / 1000));
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Fetch ROSCA info and timing data
  const {
    data: timingData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['rosca-timing', roscaAddress],
    queryFn: async () => {
      try {
        // Get basic ROSCA info
        const roscaInfo = await roscaHook.getROSCAInfo(roscaAddress);
        if (!roscaInfo) {
          throw new Error('Failed to get ROSCA info');
        }

        // Get timing information based on status
        const [timeUntilStart, timeUntilRoundEnd, roundInfo] = await Promise.all([
          roscaHook.getTimeUntilStart(roscaAddress),
          roscaHook.getTimeUntilRoundEnd(roscaAddress),
          roscaInfo.currentRound > 0 
            ? roscaHook.getRoundInfo(roscaAddress, roscaInfo.currentRound)
            : Promise.resolve(null)
        ]);

        return {
          roscaInfo,
          timeUntilStart,
          timeUntilRoundEnd,
          roundInfo,
          fetchTime: Math.floor(Date.now() / 1000)
        };
      } catch (err: any) {
        console.error('Failed to fetch ROSCA timing data:', err);
        throw err;
      }
    },
    enabled: !!roscaAddress && roscaHook.isConnected,
    staleTime: 5000, // 5 seconds
    gcTime: 30000, // 30 seconds
    refetchInterval: (data) => {
      // More frequent updates for active ROSCAs
      if (data?.roscaInfo?.status === ROSCAStatus.ACTIVE) {
        return 5000; // 5 seconds for active rounds
      }
      if (data?.roscaInfo?.status === ROSCAStatus.WAITING) {
        return 10000; // 10 seconds when waiting to start
      }
      return 30000; // 30 seconds for other states
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Update local time every second with cleanup
  useEffect(() => {
    if (!timingData) return; // Don't start timer if no data
    
    const interval = setInterval(() => {
      setLocalTime(Math.floor(Date.now() / 1000));
    }, 1000);
    
    setIntervalId(interval);

    return () => {
      clearInterval(interval);
      setIntervalId(null);
    };
  }, [timingData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Calculate real-time timing data
  const timeData = useMemo((): TimeRemainingData => {
    if (!timingData) {
      return {
        timeUntilStart: null,
        timeUntilRoundEnd: null,
        currentTime: localTime,
        isExpired: false,
        roundStartTime: null,
        roundDeadline: null,
        roundProgress: null,
        roundElapsedTime: null,
      };
    }

    const { roscaInfo, timeUntilStart, timeUntilRoundEnd, roundInfo, fetchTime } = timingData;
    const timeDiff = localTime - fetchTime;
    
    // Adjust contract times based on local time progression
    const adjustedTimeUntilStart = timeUntilStart !== null ? Math.max(0, timeUntilStart - timeDiff) : null;
    const adjustedTimeUntilRoundEnd = timeUntilRoundEnd !== null ? Math.max(0, timeUntilRoundEnd - timeDiff) : null;

    // Calculate round progress for active rounds
    let roundProgress: number | null = null;
    let roundElapsedTime: number | null = null;
    
    if (roundInfo && roscaInfo.status === ROSCAStatus.ACTIVE) {
      const roundDuration = roundInfo.deadline - roundInfo.startTime;
      roundElapsedTime = localTime - roundInfo.startTime;
      roundProgress = Math.min(100, Math.max(0, (roundElapsedTime / roundDuration) * 100));
    }

    return {
      timeUntilStart: adjustedTimeUntilStart,
      timeUntilRoundEnd: adjustedTimeUntilRoundEnd,
      currentTime: localTime,
      isExpired: (adjustedTimeUntilRoundEnd !== null && adjustedTimeUntilRoundEnd <= 0) || (adjustedTimeUntilStart !== null && adjustedTimeUntilStart <= 0),
      roundStartTime: roundInfo?.startTime || null,
      roundDeadline: roundInfo?.deadline || null,
      roundProgress,
      roundElapsedTime,
    };
  }, [timingData, localTime]);

  return {
    status: timingData?.roscaInfo?.status || null,
    currentRound: timingData?.roscaInfo?.currentRound || 0,
    timeData,
    isLoading,
    error: error?.message || null,
    refetch: useCallback(() => refetch(), [refetch]),
  };
}

/**
 * Hook for getting timing information for multiple ROSCAs
 */
export function useMultipleROSCATimers(roscaAddresses: Address[]) {
  const results = roscaAddresses.map(address => useTimeRemaining(address));
  
  return {
    timers: results.map((result, index) => ({
      address: roscaAddresses[index],
      ...result,
    })),
    isLoading: results.some(r => r.isLoading),
    hasErrors: results.some(r => r.error !== null),
  };
}

/**
 * Utility hook for ROSCA timer notifications
 */
export function useROSCATimerNotifications(
  roscaAddress: Address,
  onRoundDeadlineWarning?: (minutesRemaining: number) => void,
  onRoundComplete?: () => void,
  onROSCAReadyToStart?: () => void
) {
  const { timeData, status } = useTimeRemaining(roscaAddress);
  const [notificationStates, setNotificationStates] = useState({
    warned1Hour: false,
    warned10Minutes: false,
    warned1Minute: false,
    notifiedComplete: false,
    notifiedReadyToStart: false,
  });

  useEffect(() => {
    // Round deadline warnings for active ROSCAs
    if (status === ROSCAStatus.ACTIVE && timeData.timeUntilRoundEnd !== null && onRoundDeadlineWarning) {
      const remaining = timeData.timeUntilRoundEnd;
      const remainingMinutes = Math.floor(remaining / 60);
      
      if (remaining <= 60 && !notificationStates.warned1Minute) {
        onRoundDeadlineWarning(1);
        setNotificationStates(prev => ({ ...prev, warned1Minute: true }));
      } else if (remaining <= 600 && !notificationStates.warned10Minutes) {
        onRoundDeadlineWarning(10);
        setNotificationStates(prev => ({ ...prev, warned10Minutes: true }));
      } else if (remaining <= 3600 && !notificationStates.warned1Hour) {
        onRoundDeadlineWarning(60);
        setNotificationStates(prev => ({ ...prev, warned1Hour: true }));
      }
    }

    // Round completion notification
    if (
      status === ROSCAStatus.ACTIVE && 
      timeData.isExpired && 
      !notificationStates.notifiedComplete && 
      onRoundComplete
    ) {
      onRoundComplete();
      setNotificationStates(prev => ({ ...prev, notifiedComplete: true }));
    }

    // ROSCA ready to start notification
    if (
      status === ROSCAStatus.WAITING && 
      timeData.timeUntilStart === 0 && 
      !notificationStates.notifiedReadyToStart && 
      onROSCAReadyToStart
    ) {
      onROSCAReadyToStart();
      setNotificationStates(prev => ({ ...prev, notifiedReadyToStart: true }));
    }
  }, [timeData, status, notificationStates, onRoundDeadlineWarning, onRoundComplete, onROSCAReadyToStart]);

  // Reset notification states when round changes
  useEffect(() => {
    setNotificationStates({
      warned1Hour: false,
      warned10Minutes: false,
      warned1Minute: false,
      notifiedComplete: false,
      notifiedReadyToStart: false,
    });
  }, [status, timeData.currentRound]);
}

/**
 * Utility function to get timer display text based on ROSCA state
 */
export function getTimerDisplayText(
  status: ROSCAStatus | null,
  timeData: TimeRemainingData
): { label: string; value: number | null; type: 'countdown' | 'progress' | 'static' } {
  switch (status) {
    case ROSCAStatus.RECRUITING:
      return {
        label: 'Recruiting members',
        value: null,
        type: 'static'
      };

    case ROSCAStatus.WAITING:
      return {
        label: 'Time until start',
        value: timeData.timeUntilStart,
        type: 'countdown'
      };

    case ROSCAStatus.ACTIVE:
      return {
        label: 'Round ends in',
        value: timeData.timeUntilRoundEnd,
        type: 'countdown'
      };

    case ROSCAStatus.COMPLETED:
      return {
        label: 'ROSCA completed',
        value: null,
        type: 'static'
      };

    case ROSCAStatus.CANCELLED:
      return {
        label: 'ROSCA cancelled',
        value: null,
        type: 'static'
      };

    default:
      return {
        label: 'Loading...',
        value: null,
        type: 'static'
      };
  }
}

/**
 * Utility function to determine timer theme based on remaining time
 */
export function getTimerTheme(remainingSeconds: number | null): 'default' | 'warning' | 'danger' {
  if (remainingSeconds === null || remainingSeconds <= 0) return 'danger';
  if (remainingSeconds <= 3600) return 'danger'; // Less than 1 hour
  if (remainingSeconds <= 24 * 3600) return 'warning'; // Less than 1 day
  return 'default';
}
