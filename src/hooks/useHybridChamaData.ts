import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { offchainChamaService, type OffchainChama } from '@/services/offchainChamaService';
import { useEffect } from 'react';

export function useHybridChamaData(chamaId: string) {
  const { primaryWallet } = useDynamicContext();
  const queryClient = useQueryClient();
  const userAddress = primaryWallet?.address;

  // Off-chain data (primary source)
  const offchainQuery = useQuery({
    queryKey: ['chama-offchain', chamaId],
    queryFn: () => offchainChamaService.getChama(chamaId),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    enabled: !!chamaId,
  });

  // Members data
  const membersQuery = useQuery({
    queryKey: ['chama-members', chamaId],
    queryFn: async () => {
      try {
        const members = await offchainChamaService.getChamaMembers(chamaId);
        console.log('✅ Successfully fetched members:', members.length);
        return members;
      } catch (error: any) {
        console.error('❌ Error fetching members:', error);
        // Handle 406 RLS errors gracefully
        if (error.message?.includes('406') || 
            error.message?.includes('Not Acceptable') ||
            error.code === '42501' || 
            error.code === 'PGRST301') {
          console.warn('RLS/Permission error, returning empty array. Run fix_rls_issue.sql');
          return [];
        }
        throw error;
      }
    },
    enabled: !!chamaId,
    staleTime: 5000, // Reduce stale time for more frequent updates
    refetchInterval: 15000, // More frequent refetch
    retry: (failureCount, error: any) => {
      // Don't retry on permission errors
      if (error.message?.includes('406') || 
          error.message?.includes('Not Acceptable') ||
          error.code === '42501' || 
          error.code === 'PGRST301') {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Current user's membership
  const membershipQuery = useQuery({
    queryKey: ['user-membership', chamaId, userAddress],
    queryFn: async () => {
      if (!userAddress) return null;
      try {
        return await offchainChamaService.getMember(chamaId, userAddress);
      } catch (error: any) {
        // Handle 406 RLS errors gracefully
        if (error.message?.includes('406') || error.code === '42501') {
          console.warn('RLS blocking membership access for user:', userAddress);
          return null;
        }
        throw error;
      }
    },
    enabled: !!userAddress && !!chamaId,
    staleTime: 10000,
    retry: (failureCount, error: any) => {
      // Don't retry on permission errors
      if (error.message?.includes('406') || error.code === '42501') {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Current round
  const currentRoundQuery = useQuery({
    queryKey: ['current-round', chamaId],
    queryFn: () => offchainChamaService.getCurrentRound(chamaId),
    enabled: !!chamaId,
    staleTime: 15000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!chamaId) return;

    console.log('🔄 Setting up real-time subscription for chama:', chamaId);

    const subscription = offchainChamaService.subscribeToChamaUpdates(chamaId, (payload) => {
      console.log('📡 Real-time update received:', payload);
      
      // Force immediate refetch of all chama-related data
      queryClient.invalidateQueries({ queryKey: ['chama-offchain', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['current-round', chamaId] });
      
      // Invalidate ALL user membership queries for this chama (not just current user)
      queryClient.invalidateQueries({ 
        queryKey: ['user-membership', chamaId],
        exact: false // This will match all user-membership queries for this chama
      });
      
      // Invalidate user context for all users
      queryClient.invalidateQueries({ 
        queryKey: ['chama-user-context', chamaId],
        exact: false
      });
      
      // Force refetch with no cache
      queryClient.refetchQueries({ queryKey: ['chama-members', chamaId] });
      
      // Also invalidate broader queries
      queryClient.invalidateQueries({ queryKey: ['public-chamas-with-context'] });
      queryClient.invalidateQueries({ queryKey: ['user-chamas'] });
      
      // Add a small delay then force another refetch to ensure UI updates
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['chama-members', chamaId] });
        if (userAddress) {
          queryClient.refetchQueries({ queryKey: ['user-membership', chamaId, userAddress] });
        }
      }, 500);
    });

    return () => {
      console.log('🔌 Cleaning up real-time subscription for chama:', chamaId);
      subscription.unsubscribe();
    };
  }, [chamaId, userAddress, queryClient]);

  // Computed state
  const isLoading = offchainQuery.isLoading || membersQuery.isLoading;
  const error = offchainQuery.error || membersQuery.error;
  
  const chama = offchainQuery.data;
  const members = membersQuery.data || [];
  const userMembership = membershipQuery.data;
  const currentRound = currentRoundQuery.data;

  // Access level computation
  const accessLevel = (() => {
    if (!userAddress) return 'GUEST';
    if (!userMembership) {
      if (chama?.status === 'recruiting' && members.length < chama.member_target) {
        return 'CAN_JOIN';
      }
      return 'VIEWER';
    }
    if (chama?.creator_address === userAddress) return 'CREATOR';
    if (['active', 'confirmed'].includes(userMembership.status)) return 'MEMBER';
    return 'VIEWER';
  })() as 'GUEST' | 'CREATOR' | 'MEMBER' | 'CAN_JOIN' | 'VIEWER';

  // Available actions
  const availableActions = {
    canJoin: accessLevel === 'CAN_JOIN',
    canPayDeposit: (accessLevel === 'MEMBER' || accessLevel === 'CREATOR') && 
                   chama?.status === 'registered' && 
                   userMembership?.deposit_status !== 'paid',
    canContribute: (accessLevel === 'MEMBER' || accessLevel === 'CREATOR') && 
                   chama?.status === 'active' && 
                   userMembership?.deposit_status === 'paid',
    canStartROSCA: (accessLevel === 'CREATOR' || accessLevel === 'MEMBER') && chama?.status === 'waiting',
    canInvite: accessLevel === 'CREATOR' && chama?.status === 'recruiting',
  };

  return {
    // Data
    chama,
    members,
    userMembership,
    currentRound,
    
    // Loading states
    isLoading,
    error,
    
    // Computed state
    accessLevel,
    availableActions,
    
    // User state
    userState: {
      isLoggedIn: !!userAddress,
      address: userAddress,
      isMember: !!userMembership,
      isCreator: chama?.creator_address === userAddress,
      hasContributed: (userMembership?.rounds_contributed || 0) > 0,
    },

    // Manual refresh
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-offchain', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['current-round', chamaId] });
      if (userAddress) {
        queryClient.invalidateQueries({ queryKey: ['user-membership', chamaId, userAddress] });
      }
    },
  };
}
