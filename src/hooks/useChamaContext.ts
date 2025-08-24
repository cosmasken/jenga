import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRosca } from './useRosca';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { type Address } from 'viem';
import { cachedBlockchainRead, createROSCACacheKey } from '@/utils/requestCache';

export interface ChamaContextState {
  // Basic info
  chamaInfo: any | null;
  isLoading: boolean;
  error: string | null;
  
  // User state
  userState: {
    isLoggedIn: boolean;
    address: Address | null;
    isMember: boolean;
    isCreator: boolean;
    hasContributed: boolean;
  };
  
  // ROSCA state
  roscaState: {
    status: number | null; // 0: RECRUITING, 1: WAITING, 2: ACTIVE, etc.
    canStart: boolean;
    timeUntilStart: number | null;
    memberReadiness: {
      totalJoined: number;
      totalPaidDeposits: number;
      allReady: boolean;
    } | null;
  };
  
  // Computed state
  accessLevel: 'GUEST' | 'CREATOR' | 'MEMBER' | 'CAN_JOIN' | 'VIEWER';
  availableActions: {
    canJoin: boolean;
    canContribute: boolean;
    canStartROSCA: boolean;
    canShare: boolean;
  };
  
  // Actions
  refreshData: () => Promise<void>;
}

export function useChamaContext(chamaAddress: Address): ChamaContextState {
  const { primaryWallet } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const roscaHook = useRosca();
  
  // Single consolidated state
  const [state, setState] = useState<ChamaContextState>({
    chamaInfo: null,
    isLoading: true,
    error: null,
    userState: {
      isLoggedIn: false,
      address: null,
      isMember: false,
      isCreator: false,
      hasContributed: false,
    },
    roscaState: {
      status: null,
      canStart: false,
      timeUntilStart: null,
      memberReadiness: null,
    },
    accessLevel: 'GUEST',
    availableActions: {
      canJoin: false,
      canContribute: false,
      canStartROSCA: false,
      canShare: true,
    },
    refreshData: async () => {},
  });

  // Batch all blockchain calls into a single function
  const loadAllData = useCallback(async () => {
    if (!chamaAddress || chamaAddress === '0x0000000000000000000000000000000000000000') {
      setState(prev => ({ ...prev, error: 'Invalid chama address', isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Step 1: Get basic chama info (always needed)
      const chamaInfo = await cachedBlockchainRead(
        () => roscaHook.getChamaInfo(chamaAddress),
        createROSCACacheKey('info', chamaAddress),
        { cacheDuration: 30000 } // 30 seconds cache
      );

      if (!chamaInfo) {
        throw new Error('Failed to load chama information');
      }

      const userAddress = primaryWallet?.address as Address | null;

      // Step 2: If user is logged in, batch all user-specific calls
      let userState = {
        isLoggedIn,
        address: userAddress,
        isMember: false,
        isCreator: false,
        hasContributed: false,
      };

      let roscaState = {
        status: chamaInfo.status || null,
        canStart: false,
        timeUntilStart: null,
        memberReadiness: null,
      };

      if (isLoggedIn && userAddress) {
        // Batch all user checks
        const [
          isMember,
          timeUntilStart,
          memberReadiness,
          hasContributed
        ] = await Promise.all([
          cachedBlockchainRead(
            () => roscaHook.isMember(chamaAddress, userAddress),
            createROSCACacheKey('isMember', chamaAddress, userAddress),
            { cacheDuration: 15000 }
          ),
          cachedBlockchainRead(
            () => roscaHook.getTimeUntilStart(chamaAddress),
            createROSCACacheKey('timeUntilStart', chamaAddress),
            { cacheDuration: 10000 }
          ),
          cachedBlockchainRead(
            () => roscaHook.getMemberReadiness(chamaAddress),
            createROSCACacheKey('memberReadiness', chamaAddress),
            { cacheDuration: 15000 }
          ),
          // Only check contribution if ROSCA is active and user is member
          chamaInfo.status === 2 ? cachedBlockchainRead(
            () => roscaHook.hasContributed(chamaAddress, userAddress, chamaInfo.currentRound),
            createROSCACacheKey('hasContributed', chamaAddress, userAddress, chamaInfo.currentRound),
            { cacheDuration: 10000 }
          ) : Promise.resolve(false)
        ]);

        const isCreator = chamaInfo.creator?.toLowerCase() === userAddress.toLowerCase();
        const canStart = isMember && chamaInfo.status === 1 && chamaInfo.totalMembers >= chamaInfo.memberTarget;

        userState = {
          isLoggedIn,
          address: userAddress,
          isMember,
          isCreator,
          hasContributed,
        };

        roscaState = {
          status: chamaInfo.status,
          canStart,
          timeUntilStart,
          memberReadiness,
        };
      }

      // Step 3: Calculate derived state
      const accessLevel = calculateAccessLevel(userState, chamaInfo);
      const availableActions = calculateAvailableActions(userState, roscaState, chamaInfo);

      // Update state atomically
      setState(prev => ({
        ...prev,
        chamaInfo,
        userState,
        roscaState,
        accessLevel,
        availableActions,
        isLoading: false,
        error: null,
      }));

    } catch (error: any) {
      console.error('Failed to load chama context:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to load chama data',
        isLoading: false,
      }));
    }
  }, [chamaAddress, isLoggedIn, primaryWallet?.address, roscaHook]);

  // Initialize and refresh data
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Return state with refresh function
  return useMemo(() => ({
    ...state,
    refreshData: loadAllData,
  }), [state, loadAllData]);
}

// Helper functions
function calculateAccessLevel(userState: any, chamaInfo: any): ChamaContextState['accessLevel'] {
  if (!userState.isLoggedIn) return 'GUEST';
  if (userState.isCreator) return 'CREATOR';
  if (userState.isMember) return 'MEMBER';
  if (chamaInfo.status === 0 && chamaInfo.totalMembers < chamaInfo.memberTarget) return 'CAN_JOIN';
  return 'VIEWER';
}

function calculateAvailableActions(userState: any, roscaState: any, chamaInfo: any) {
  return {
    canJoin: !userState.isMember && chamaInfo.status === 0 && chamaInfo.totalMembers < chamaInfo.memberTarget,
    canContribute: userState.isMember && !userState.hasContributed && chamaInfo.status === 2,
    canStartROSCA: roscaState.canStart,
    canShare: true,
  };
}
