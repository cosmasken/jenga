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
    queryFn: () => offchainChamaService.getChamaMembers(chamaId),
    enabled: !!chamaId,
    staleTime: 15000,
  });

  // Current user's membership
  const membershipQuery = useQuery({
    queryKey: ['user-membership', chamaId, userAddress],
    queryFn: () => userAddress ? offchainChamaService.getMember(chamaId, userAddress) : null,
    enabled: !!userAddress && !!chamaId,
    staleTime: 10000,
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
      
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['chama-offchain', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['current-round', chamaId] });
      
      if (userAddress) {
        queryClient.invalidateQueries({ queryKey: ['user-membership', chamaId, userAddress] });
      }
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
    canPayDeposit: accessLevel === 'CREATOR' && userMembership?.deposit_status === 'pending',
    canContribute: accessLevel === 'MEMBER' && currentRound?.status === 'active' && !userMembership?.has_received_payout,
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
