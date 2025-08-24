/**
 * Production-ready TanStack Query hooks for ROSCA data management
 * Replaces localStorage-dependent patterns with proper server-state management
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { type Address } from 'viem';
import { blockchainService, type ChamaBasicInfo, type UserMembershipInfo, type RoscaStatusInfo } from '@/services/blockchainService';
import { useRosca } from './useRosca';
import { toast } from './use-toast';
import { useEffect } from 'react';

// Query key factory - ensures consistent cache keys
export const chamaKeys = {
  all: ['chama'] as const,
  lists: () => [...chamaKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...chamaKeys.lists(), filters] as const,
  details: () => [...chamaKeys.all, 'detail'] as const,
  detail: (address: Address) => [...chamaKeys.details(), address] as const,
  userMembership: (chamaAddress: Address, userAddress: Address) => 
    [...chamaKeys.detail(chamaAddress), 'membership', userAddress] as const,
  status: (address: Address) => [...chamaKeys.detail(address), 'status'] as const,
  userRoscas: (userAddress: Address) => ['user', userAddress, 'roscas'] as const,
  search: (term: string) => ['search', 'roscas', term] as const,
  activeRoscas: () => ['roscas', 'active'] as const,
} as const;

/**
 * Initialize blockchain service with useRosca hook
 */
export function useBlockchainServiceInit() {
  const roscaHook = useRosca();
  
  useEffect(() => {
    blockchainService.setRoscaHook(roscaHook);
  }, [roscaHook]);
}

/**
 * Get basic chama information with caching
 */
export function useChamaInfo(address: Address) {
  return useQuery({
    queryKey: chamaKeys.detail(address),
    queryFn: () => blockchainService.getChamaInfo(address),
    enabled: !!address && address !== '0x0000000000000000000000000000000000000000',
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      errorMessage: 'Failed to load chama information',
    },
  });
}

/**
 * Get user membership status for a chama
 */
export function useUserMembership(chamaAddress: Address, userAddress?: Address) {
  const isLoggedIn = useIsLoggedIn();
  
  return useQuery({
    queryKey: chamaKeys.userMembership(chamaAddress, userAddress || '0x0'),
    queryFn: () => blockchainService.getUserMembership(chamaAddress, userAddress!),
    enabled: !!chamaAddress && !!userAddress && isLoggedIn,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: 'Failed to load membership status',
    },
  });
}

/**
 * Get ROSCA status and readiness
 */
export function useRoscaStatus(chamaAddress: Address) {
  const { data: chamaInfo } = useChamaInfo(chamaAddress);
  
  return useQuery({
    queryKey: chamaKeys.status(chamaAddress),
    queryFn: () => blockchainService.getRoscaStatus(chamaAddress),
    enabled: !!chamaAddress && !!chamaInfo,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: chamaInfo?.status === 1 ? 30000 : false, // Poll when waiting
    meta: {
      errorMessage: 'Failed to load ROSCA status',
    },
  });
}

/**
 * Get user's ROSCAs (replacing localStorage pattern)
 */
export function useUserRoscas(userAddress?: Address) {
  const isLoggedIn = useIsLoggedIn();
  
  return useQuery({
    queryKey: chamaKeys.userRoscas(userAddress || '0x0'),
    queryFn: () => blockchainService.getUserRoscas(userAddress!),
    enabled: !!userAddress && isLoggedIn,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      errorMessage: 'Failed to load your ROSCAs',
    },
  });
}

/**
 * Search ROSCAs by name
 */
export function useSearchRoscas(searchTerm: string) {
  return useQuery({
    queryKey: chamaKeys.search(searchTerm),
    queryFn: () => blockchainService.searchRoscas(searchTerm),
    enabled: searchTerm.length >= 2,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: 'Failed to search ROSCAs',
    },
  });
}

/**
 * Get all active ROSCAs with infinite scroll
 */
export function useActiveRoscas() {
  return useInfiniteQuery({
    queryKey: chamaKeys.activeRoscas(),
    queryFn: async ({ pageParam = 0 }) => {
      const allRoscas = await blockchainService.getAllActiveRoscas();
      const pageSize = 10;
      const start = pageParam * pageSize;
      const end = start + pageSize;
      
      return {
        roscas: allRoscas.slice(start, end),
        nextCursor: end < allRoscas.length ? pageParam + 1 : null,
        hasMore: end < allRoscas.length,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      errorMessage: 'Failed to load active ROSCAs',
    },
  });
}

/**
 * Join ROSCA mutation with optimistic updates
 */
export function useJoinRosca(chamaAddress: Address) {
  const queryClient = useQueryClient();
  const { primaryWallet } = useDynamicContext();
  const userAddress = primaryWallet?.address as Address;

  return useMutation({
    mutationFn: () => blockchainService.joinRosca(chamaAddress),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: chamaKeys.userMembership(chamaAddress, userAddress) });
      
      // Snapshot the previous value
      const previousMembership = queryClient.getQueryData(
        chamaKeys.userMembership(chamaAddress, userAddress)
      ) as UserMembershipInfo | undefined;
      
      // Optimistically update
      if (userAddress) {
        queryClient.setQueryData(
          chamaKeys.userMembership(chamaAddress, userAddress),
          (old: UserMembershipInfo | undefined) => 
            old ? { ...old, isMember: true } : { isMember: true, isCreator: false, hasContributed: false }
        );
      }
      
      return { previousMembership };
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update
      if (context?.previousMembership && userAddress) {
        queryClient.setQueryData(
          chamaKeys.userMembership(chamaAddress, userAddress),
          context.previousMembership
        );
      }
      
      toast({
        title: '❌ Failed to join',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: '🎉 Joined successfully!',
        description: 'Welcome to the savings circle!',
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: chamaKeys.detail(chamaAddress) });
      queryClient.invalidateQueries({ queryKey: chamaKeys.status(chamaAddress) });
      if (userAddress) {
        queryClient.invalidateQueries({ queryKey: chamaKeys.userRoscas(userAddress) });
      }
    },
  });
}

/**
 * Contribute to ROSCA mutation with optimistic updates
 */
export function useContributeToRosca(chamaAddress: Address) {
  const queryClient = useQueryClient();
  const { primaryWallet } = useDynamicContext();
  const userAddress = primaryWallet?.address as Address;

  return useMutation({
    mutationFn: () => blockchainService.contribute(chamaAddress),
    onMutate: async () => {
      if (!userAddress) return;
      
      await queryClient.cancelQueries({ queryKey: chamaKeys.userMembership(chamaAddress, userAddress) });
      
      const previousMembership = queryClient.getQueryData(
        chamaKeys.userMembership(chamaAddress, userAddress)
      ) as UserMembershipInfo | undefined;
      
      // Optimistically update contribution status
      queryClient.setQueryData(
        chamaKeys.userMembership(chamaAddress, userAddress),
        (old: UserMembershipInfo | undefined) => 
          old ? { ...old, hasContributed: true } : undefined
      );
      
      return { previousMembership };
    },
    onError: (err, variables, context) => {
      if (context?.previousMembership && userAddress) {
        queryClient.setQueryData(
          chamaKeys.userMembership(chamaAddress, userAddress),
          context.previousMembership
        );
      }
      
      toast({
        title: '❌ Contribution failed',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: '💸 Contribution sent!',
        description: 'Your contribution was successful',
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: chamaKeys.status(chamaAddress) });
    },
  });
}

/**
 * Start ROSCA mutation
 */
export function useStartRosca(chamaAddress: Address) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => blockchainService.startRosca(chamaAddress),
    onError: (err) => {
      toast({
        title: '❌ Failed to start ROSCA',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: '🚀 ROSCA Started!',
        description: 'The savings circle is now active!',
      });
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: chamaKeys.detail(chamaAddress) });
      queryClient.invalidateQueries({ queryKey: chamaKeys.status(chamaAddress) });
    },
  });
}

/**
 * Comprehensive chama data hook that combines all the above
 * This replaces the complex useChamaQuery hook
 */
export function useComprehensiveChamaData(chamaAddress: Address) {
  const { primaryWallet } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const userAddress = primaryWallet?.address as Address;

  // Initialize blockchain service
  useBlockchainServiceInit();

  // Core data queries
  const chamaInfoQuery = useChamaInfo(chamaAddress);
  const userMembershipQuery = useUserMembership(chamaAddress, userAddress);
  const roscaStatusQuery = useRoscaStatus(chamaAddress);

  // Mutations
  const joinMutation = useJoinRosca(chamaAddress);
  const contributeMutation = useContributeToRosca(chamaAddress);
  const startMutation = useStartRosca(chamaAddress);

  // Computed state
  const isLoading = chamaInfoQuery.isLoading || userMembershipQuery.isLoading || roscaStatusQuery.isLoading;
  const error = chamaInfoQuery.error || userMembershipQuery.error || roscaStatusQuery.error;

  const accessLevel = (() => {
    if (!isLoggedIn) return 'GUEST';
    if (!userMembershipQuery.data) return 'GUEST';
    if (userMembershipQuery.data.isCreator) return 'CREATOR';
    if (userMembershipQuery.data.isMember) return 'MEMBER';
    if (chamaInfoQuery.data?.status === 0 && chamaInfoQuery.data.totalMembers < chamaInfoQuery.data.memberTarget) return 'CAN_JOIN';
    return 'VIEWER';
  })() as 'GUEST' | 'CREATOR' | 'MEMBER' | 'CAN_JOIN' | 'VIEWER';

  const availableActions = {
    canJoin: accessLevel === 'CAN_JOIN',
    canContribute: userMembershipQuery.data?.isMember && !userMembershipQuery.data.hasContributed && chamaInfoQuery.data?.status === 2,
    canStartROSCA: roscaStatusQuery.data?.canStart && (userMembershipQuery.data?.isMember || userMembershipQuery.data?.isCreator),
    canShare: true,
  };

  return {
    // Data
    chamaInfo: chamaInfoQuery.data,
    userMembership: userMembershipQuery.data,
    roscaStatus: roscaStatusQuery.data,
    
    // Loading states
    isLoading,
    isLoadingChamaInfo: chamaInfoQuery.isLoading,
    isLoadingMembership: userMembershipQuery.isLoading,
    isLoadingStatus: roscaStatusQuery.isLoading,
    
    // Error states
    error,
    
    // Computed states
    accessLevel,
    availableActions,
    userState: {
      isLoggedIn,
      address: userAddress,
      isMember: userMembershipQuery.data?.isMember || false,
      isCreator: userMembershipQuery.data?.isCreator || false,
      hasContributed: userMembershipQuery.data?.hasContributed || false,
    },
    
    // Actions
    join: joinMutation.mutate,
    contribute: contributeMutation.mutate,
    startROSCA: startMutation.mutate,
    
    // Mutation states
    isJoining: joinMutation.isPending,
    isContributing: contributeMutation.isPending,
    isStartingROSCA: startMutation.isPending,
    
    // Manual refresh
    refetch: () => {
      chamaInfoQuery.refetch();
      userMembershipQuery.refetch();
      roscaStatusQuery.refetch();
    },
  };
}
