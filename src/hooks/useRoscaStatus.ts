/**
 * Enhanced ROSCA Status Management Hook
 * Handles ROSCA lifecycle and status transitions with proper error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { useRosca } from './useRosca';
import { type Address } from 'viem';

export enum ROSCAStatus {
  RECRUITING = 0,
  WAITING = 1,
  ACTIVE = 2,
  COMPLETED = 3,
  CANCELLED = 4
}

export interface ROSCAStatusInfo {
  status: ROSCAStatus;
  statusName: string;
  canJoin: boolean;
  canStart: boolean;
  canContribute: boolean;
  canComplete: boolean;
  needsStart: boolean;
  isReady: boolean;
  memberCount: number;
  maxMembers: number;
  currentRound: number;
  totalRounds: number;
  timeUntilStart?: number;
  timeUntilRoundEnd?: number;
}

export interface ROSCAActions {
  startROSCA: () => Promise<void>;
  forceStart: () => Promise<void>;
  contribute: () => Promise<void>;
  completeRound: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export function useRoscaStatus(roscaAddress: Address | null) {
  const roscaHook = useRosca();
  const [statusInfo, setStatusInfo] = useState<ROSCAStatusInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get human-readable status name
   */
  const getStatusName = (status: ROSCAStatus): string => {
    const names = ['RECRUITING', 'WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
    return names[status] || 'UNKNOWN';
  };

  /**
   * Fetch and analyze ROSCA status
   */
  const fetchStatus = useCallback(async () => {
    if (!roscaAddress || !roscaHook.isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get ROSCA info
      const roscaInfo = await roscaHook.getROSCAInfo(roscaAddress);
      if (!roscaInfo) {
        throw new Error('Could not fetch ROSCA information');
      }

      // Get member readiness
      const memberReadiness = await roscaHook.getMemberReadiness(roscaAddress);
      
      // Get timing information
      const timeUntilStart = await roscaHook.getTimeUntilStart(roscaAddress);
      const timeUntilRoundEnd = await roscaHook.getTimeUntilRoundEnd(roscaAddress);

      // Analyze status and capabilities
      const status = roscaInfo.status;
      const statusName = getStatusName(status);
      
      const statusInfo: ROSCAStatusInfo = {
        status,
        statusName,
        memberCount: roscaInfo.totalMembers,
        maxMembers: roscaInfo.maxMembers,
        currentRound: roscaInfo.currentRound,
        totalRounds: roscaInfo.totalRounds,
        timeUntilStart: timeUntilStart || undefined,
        timeUntilRoundEnd: timeUntilRoundEnd || undefined,
        
        // Capabilities based on status
        canJoin: status === ROSCAStatus.RECRUITING && roscaInfo.totalMembers < roscaInfo.maxMembers,
        canStart: status === ROSCAStatus.WAITING && (memberReadiness?.allReady || false),
        canContribute: status === ROSCAStatus.ACTIVE && roscaInfo.currentRound > 0,
        canComplete: status === ROSCAStatus.ACTIVE && roscaInfo.currentRound > 0,
        
        // Status flags
        needsStart: status === ROSCAStatus.WAITING,
        isReady: memberReadiness?.allReady || false,
      };

      setStatusInfo(statusInfo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ROSCA status';
      setError(errorMessage);
      console.error('Error fetching ROSCA status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [roscaAddress, roscaHook]);

  /**
   * Start ROSCA (normal start with grace period check)
   */
  const startROSCA = useCallback(async () => {
    if (!roscaAddress || !statusInfo?.canStart) {
      throw new Error('Cannot start ROSCA in current state');
    }

    setIsLoading(true);
    try {
      await roscaHook.startROSCA(roscaAddress);
      // Refresh status after starting
      await fetchStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start ROSCA';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [roscaAddress, statusInfo, roscaHook, fetchStatus]);

  /**
   * Force start ROSCA (bypass grace period)
   */
  const forceStart = useCallback(async () => {
    if (!roscaAddress || !statusInfo?.needsStart) {
      throw new Error('Cannot force start ROSCA in current state');
    }

    setIsLoading(true);
    try {
      await roscaHook.forceStart(roscaAddress);
      // Refresh status after starting
      await fetchStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to force start ROSCA';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [roscaAddress, statusInfo, roscaHook, fetchStatus]);

  /**
   * Contribute to current round
   */
  const contribute = useCallback(async () => {
    if (!roscaAddress || !statusInfo?.canContribute) {
      throw new Error('Cannot contribute in current ROSCA state');
    }

    setIsLoading(true);
    try {
      await roscaHook.contribute(roscaAddress);
      // Refresh status after contributing
      await fetchStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to contribute';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [roscaAddress, statusInfo, roscaHook, fetchStatus]);

  /**
   * Complete current round
   */
  const completeRound = useCallback(async () => {
    if (!roscaAddress || !statusInfo?.canComplete) {
      throw new Error('Cannot complete round in current state');
    }

    setIsLoading(true);
    try {
      await roscaHook.completeRound(roscaAddress);
      // Refresh status after completing
      await fetchStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete round';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [roscaAddress, statusInfo, roscaHook, fetchStatus]);

  /**
   * Refresh status manually
   */
  const refreshStatus = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  // Auto-fetch status when address changes
  useEffect(() => {
    if (roscaAddress) {
      fetchStatus();
    } else {
      setStatusInfo(null);
      setError(null);
    }
  }, [roscaAddress, fetchStatus]);

  // Auto-refresh every 30 seconds when ROSCA is active
  useEffect(() => {
    if (!roscaAddress || !statusInfo) return;

    // Only auto-refresh for active ROSCAs
    if (statusInfo.status === ROSCAStatus.ACTIVE || statusInfo.status === ROSCAStatus.WAITING) {
      const interval = setInterval(() => {
        fetchStatus();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [roscaAddress, statusInfo, fetchStatus]);

  const actions: ROSCAActions = {
    startROSCA,
    forceStart,
    contribute,
    completeRound,
    refreshStatus
  };

  return {
    statusInfo,
    actions,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}
