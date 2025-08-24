import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRosca } from './useRosca';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { type Address } from 'viem';

// Query keys factory - ensures consistent naming
export const chamaQueryKeys = {
  all: ['chama'] as const,
  lists: () => [...chamaQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...chamaQueryKeys.lists(), { filters }] as const,
  details: () => [...chamaQueryKeys.all, 'detail'] as const,
  detail: (address: Address) => [...chamaQueryKeys.details(), address] as const,
  user: (address: Address, userAddress: Address) => 
    [...chamaQueryKeys.detail(address), 'user', userAddress] as const,
  status: (address: Address) => 
    [...chamaQueryKeys.detail(address), 'status'] as const,
  membership: (address: Address, userAddress: Address) => 
    [...chamaQueryKeys.user(address, userAddress), 'membership'] as const,
  contributions: (address: Address, userAddress: Address) => 
    [...chamaQueryKeys.user(address, userAddress), 'contributions'] as const,
};

/**
 * Production-ready hook for Chama data with TanStack Query
 */
export function useChamaQuery(chamaAddress: Address) {
  const { primaryWallet } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const roscaHook = useRosca();
  const queryClient = useQueryClient();
  
  const userAddress = (primaryWallet?.address as Address) || null;

  // Basic chama information - rarely changes, cache longer
  const {
    data: chamaInfo,
    isLoading: isLoadingChamaInfo,
    error: chamaInfoError,
    refetch: refetchChamaInfo
  } = useQuery({
    queryKey: chamaQueryKeys.detail(chamaAddress),
    queryFn: async () => {
      try {
        return await roscaHook.getChamaInfo(chamaAddress);
      } catch (error) {
        console.error('Failed to fetch chama info:', error);
        throw error;
      }
    },
    enabled: !!chamaAddress && chamaAddress !== '0x0000000000000000000000000000000000000000',
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // ROSCA status - more dynamic, shorter cache
  const {
    data: roscaStatus,
    isLoading: isLoadingStatus,
    error: statusError
  } = useQuery({
    queryKey: chamaQueryKeys.status(chamaAddress),
    queryFn: async () => {
      const [timeUntilStart, memberReadiness] = await Promise.all([
        roscaHook.getTimeUntilStart(chamaAddress),
        roscaHook.getMemberReadiness(chamaAddress),
      ]);
      
      return {
        timeUntilStart,
        memberReadiness,
        canStart: chamaInfo && chamaInfo.status === 1 && chamaInfo.totalMembers >= chamaInfo.memberTarget
      };
    },
    enabled: !!chamaInfo,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: chamaInfo?.status === 1 ? 30000 : false, // Poll when waiting
  });

  // User membership - semi-static, but important for UI
  const {
    data: userMembership,
    isLoading: isLoadingMembership,
    error: membershipError
  } = useQuery({
    queryKey: chamaQueryKeys.membership(chamaAddress, userAddress || '0x0'),
    queryFn: async () => {
      if (!userAddress) return null;
      
      const [isMember, hasContributed] = await Promise.all([
        roscaHook.isMember(chamaAddress, userAddress),
        chamaInfo?.status === 2 && chamaInfo?.currentRound > 0
          ? roscaHook.hasContributed(chamaAddress, userAddress, chamaInfo.currentRound)
          : Promise.resolve(false)
      ]);

      const isCreator = chamaInfo?.creator?.toLowerCase() === userAddress.toLowerCase();

      return {
        isMember,
        isCreator,
        hasContributed,
      };
    },
    enabled: !!chamaInfo && !!userAddress && isLoggedIn,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutations for user actions
  const joinMutation = useMutation({
    mutationFn: () => roscaHook.joinROSCA(chamaAddress),
    onMutate: async () => {
      // Optimistic update
      if (userAddress) {
        await queryClient.cancelQueries({ 
          queryKey: chamaQueryKeys.membership(chamaAddress, userAddress) 
        });
        
        const previousMembership = queryClient.getQueryData(
          chamaQueryKeys.membership(chamaAddress, userAddress)
        );
        
        queryClient.setQueryData(
          chamaQueryKeys.membership(chamaAddress, userAddress),
          { isMember: true, isCreator: false, hasContributed: false }
        );
        
        return { previousMembership };
      }
    },
    onError: (err, variables, context) => {
      // Revert optimistic update
      if (context?.previousMembership && userAddress) {
        queryClient.setQueryData(
          chamaQueryKeys.membership(chamaAddress, userAddress),
          context.previousMembership
        );
      }
    },
    onSuccess: () => {
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({ 
        queryKey: chamaQueryKeys.detail(chamaAddress) 
      });
      queryClient.invalidateQueries({ 
        queryKey: chamaQueryKeys.status(chamaAddress) 
      });
    },
  });

  const contributeMutation = useMutation({
    mutationFn: () => roscaHook.contribute(chamaAddress),
    onMutate: async () => {
      // Optimistic update for contribution
      if (userAddress && chamaInfo) {
        const membershipKey = chamaQueryKeys.membership(chamaAddress, userAddress);
        const previousMembership = queryClient.getQueryData(membershipKey);
        
        queryClient.setQueryData(membershipKey, (old: any) => 
          old ? { ...old, hasContributed: true } : old
        );
        
        return { previousMembership };
      }
    },
    onError: (err, variables, context) => {
      if (context?.previousMembership && userAddress) {
        queryClient.setQueryData(
          chamaQueryKeys.membership(chamaAddress, userAddress),
          context.previousMembership
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: chamaQueryKeys.status(chamaAddress) 
      });
    },
  });

  const startRoscaMutation = useMutation({
    mutationFn: () => roscaHook.startROSCA(chamaAddress),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ 
        queryKey: chamaQueryKeys.detail(chamaAddress) 
      });
      queryClient.invalidateQueries({ 
        queryKey: chamaQueryKeys.status(chamaAddress) 
      });
    },
  });

  // Computed states
  const isLoading = isLoadingChamaInfo || isLoadingStatus || isLoadingMembership;
  const error = chamaInfoError || statusError || membershipError;

  const accessLevel = (() => {
    if (!isLoggedIn) return 'GUEST';
    if (!userMembership) return 'GUEST';
    if (userMembership.isCreator) return 'CREATOR';
    if (userMembership.isMember) return 'MEMBER';
    if (chamaInfo?.status === 0 && chamaInfo.totalMembers < chamaInfo.memberTarget) return 'CAN_JOIN';
    return 'VIEWER';
  })() as 'GUEST' | 'CREATOR' | 'MEMBER' | 'CAN_JOIN' | 'VIEWER';

  const availableActions = {
    canJoin: accessLevel === 'CAN_JOIN',
    canContribute: userMembership?.isMember && !userMembership.hasContributed && chamaInfo?.status === 2,
    canStartROSCA: roscaStatus?.canStart && (userMembership?.isMember || userMembership?.isCreator),
    canShare: true,
  };

  // Manual refresh function
  const refreshAll = async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: chamaQueryKeys.detail(chamaAddress) }),
      queryClient.refetchQueries({ queryKey: chamaQueryKeys.status(chamaAddress) }),
      userAddress ? queryClient.refetchQueries({ 
        queryKey: chamaQueryKeys.membership(chamaAddress, userAddress) 
      }) : Promise.resolve(),
    ]);
  };

  return {
    // Data
    chamaInfo,
    roscaStatus,
    userMembership,
    
    // Loading states
    isLoading,
    isLoadingChamaInfo,
    isLoadingStatus,
    isLoadingMembership,
    
    // Error states
    error,
    
    // Computed states
    accessLevel,
    availableActions,
    userState: {
      isLoggedIn,
      address: userAddress,
      isMember: userMembership?.isMember || false,
      isCreator: userMembership?.isCreator || false,
      hasContributed: userMembership?.hasContributed || false,
    },
    
    // Actions
    join: joinMutation.mutate,
    contribute: contributeMutation.mutate,
    startROSCA: startRoscaMutation.mutate,
    refreshAll,
    
    // Mutation states
    isJoining: joinMutation.isPending,
    isContributing: contributeMutation.isPending,
    isStartingROSCA: startRoscaMutation.isPending,
  };
}

/**
 * Hook for invalidating chama-related queries
 */
export function useChamaInvalidation() {
  const queryClient = useQueryClient();
  
  return {
    invalidateChama: (address: Address) => {
      queryClient.invalidateQueries({ queryKey: chamaQueryKeys.detail(address) });
    },
    invalidateAllChamas: () => {
      queryClient.invalidateQueries({ queryKey: chamaQueryKeys.all });
    },
    clearChamaCache: (address: Address) => {
      queryClient.removeQueries({ queryKey: chamaQueryKeys.detail(address) });
    },
  };
}

/**
 * Prefetch chama data for performance
 */
export function useChamaPrefetch() {
  const queryClient = useQueryClient();
  const roscaHook = useRosca();
  
  return {
    prefetchChama: async (address: Address) => {
      await queryClient.prefetchQuery({
        queryKey: chamaQueryKeys.detail(address),
        queryFn: () => roscaHook.getChamaInfo(address),
        staleTime: 5 * 60 * 1000,
      });
    },
  };
}
