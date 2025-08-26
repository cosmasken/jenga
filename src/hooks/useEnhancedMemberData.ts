/**
 * Enhanced Member Data Hooks
 * TanStack Query hooks for fetching and caching member-specific data with proper error handling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { type Address } from 'viem';
import { blockchainService } from '@/services/blockchainService';
import { toast } from './use-toast';
import type { 
  EnhancedMemberInfo, 
  EnhancedMemberList, 
  MemberContributionHistory,
  MemberPerformance 
} from '@/types/member';

// Query key factory for member data
export const memberKeys = {
  all: ['members'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (chamaAddress: Address) => [...memberKeys.lists(), chamaAddress] as const,
  details: () => [...memberKeys.all, 'detail'] as const,
  detail: (chamaAddress: Address, memberAddress: Address) => 
    [...memberKeys.details(), chamaAddress, memberAddress] as const,
  history: (chamaAddress: Address, memberAddress: Address) => 
    [...memberKeys.detail(chamaAddress, memberAddress), 'history'] as const,
  performance: (chamaAddress: Address, memberAddress: Address) => 
    [...memberKeys.detail(chamaAddress, memberAddress), 'performance'] as const,
} as const;

/**
 * Get enhanced member information for a specific member
 */
export function useEnhancedMemberInfo(chamaAddress: Address, memberAddress: Address) {
  const isLoggedIn = useIsLoggedIn();
  
  return useQuery({
    queryKey: memberKeys.detail(chamaAddress, memberAddress),
    queryFn: () => blockchainService.getEnhancedMemberInfo(chamaAddress, memberAddress),
    enabled: !!chamaAddress && !!memberAddress && isLoggedIn,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      errorMessage: 'Failed to load member information',
    },
  });
}

/**
 * Get enhanced member list for a chama
 */
export function useEnhancedMemberList(chamaAddress: Address) {
  const isLoggedIn = useIsLoggedIn();
  
  return useQuery({
    queryKey: memberKeys.list(chamaAddress),
    queryFn: () => blockchainService.getEnhancedMemberList(chamaAddress),
    enabled: !!chamaAddress && isLoggedIn,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: (data) => {
      // Poll more frequently when members are still paying deposits
      if (data && data.summary && data.summary.membersReady < data.summary.totalMembers) {
        return 30 * 1000; // 30 seconds
      }
      return false;
    },
    meta: {
      errorMessage: 'Failed to load member list',
    },
  });
}

/**
 * Get member contribution history
 */
export function useMemberContributionHistory(chamaAddress: Address, memberAddress: Address) {
  const isLoggedIn = useIsLoggedIn();
  
  return useQuery({
    queryKey: memberKeys.history(chamaAddress, memberAddress),
    queryFn: () => blockchainService.getMemberContributionHistory(chamaAddress, memberAddress),
    enabled: !!chamaAddress && !!memberAddress && isLoggedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    meta: {
      errorMessage: 'Failed to load contribution history',
    },
  });
}

/**
 * Get member performance analytics
 */
export function useMemberPerformance(chamaAddress: Address, memberAddress: Address) {
  const isLoggedIn = useIsLoggedIn();
  
  return useQuery({
    queryKey: memberKeys.performance(chamaAddress, memberAddress),
    queryFn: () => blockchainService.getMemberPerformance(chamaAddress, memberAddress),
    enabled: !!chamaAddress && !!memberAddress && isLoggedIn,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    meta: {
      errorMessage: 'Failed to load member performance data',
    },
  });
}

/**
 * Get multiple members' information efficiently
 */
export function useMultipleMembersInfo(chamaAddress: Address, memberAddresses: Address[]) {
  const isLoggedIn = useIsLoggedIn();
  
  return useQuery({
    queryKey: [...memberKeys.lists(), chamaAddress, 'multiple', memberAddresses.sort()],
    queryFn: async () => {
      const results = await Promise.allSettled(
        memberAddresses.map(address => 
          blockchainService.getEnhancedMemberInfo(chamaAddress, address)
        )
      );
      
      return results
        .map((result, index) => ({
          address: memberAddresses[index],
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason : null,
        }))
        .filter(item => item.data !== null)
        .map(item => item.data as EnhancedMemberInfo);
    },
    enabled: !!chamaAddress && memberAddresses.length > 0 && isLoggedIn,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      errorMessage: 'Failed to load members information',
    },
  });
}

/**
 * Refresh member data mutation
 */
export function useRefreshMemberData(chamaAddress: Address) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Invalidate all member-related queries for this chama
      await queryClient.invalidateQueries({ queryKey: memberKeys.list(chamaAddress) });
      
      // Also invalidate individual member queries
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === 'members' && 
          query.queryKey.includes(chamaAddress)
      });
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: '🔄 Data Refreshed',
        description: 'Member data has been updated from the blockchain',
      });
    },
    onError: () => {
      toast({
        title: '❌ Refresh Failed',
        description: 'Failed to refresh member data. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to get member statistics for dashboard overview
 */
export function useMemberStatistics(chamaAddress: Address) {
  const { data: memberList, isLoading, error } = useEnhancedMemberList(chamaAddress);
  
  const statistics = {
    totalMembers: memberList?.summary.totalMembers || 0,
    activeMembers: memberList?.summary.activeMembers || 0,
    membersReady: memberList?.summary.membersReady || 0,
    averageReliability: memberList?.summary.averageReliabilityScore || 0,
    totalContributions: memberList?.summary.totalContributions || 0n,
    totalDeposits: memberList?.summary.totalDeposits || 0n,
    
    // Derived statistics
    readinessPercentage: memberList?.summary.totalMembers 
      ? (memberList.summary.membersReady / memberList.summary.totalMembers) * 100 
      : 0,
    activePercentage: memberList?.summary.totalMembers
      ? (memberList.summary.activeMembers / memberList.summary.totalMembers) * 100
      : 0,
    
    // Member status breakdown
    statusBreakdown: memberList?.members.reduce((acc, member) => {
      acc[member.membershipStatus] = (acc[member.membershipStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
    
    // Risk assessment
    highRiskMembers: memberList?.members.filter(m => m.reliabilityScore < 60).length || 0,
    mediumRiskMembers: memberList?.members.filter(m => m.reliabilityScore >= 60 && m.reliabilityScore < 80).length || 0,
    lowRiskMembers: memberList?.members.filter(m => m.reliabilityScore >= 80).length || 0,
  };
  
  return {
    statistics,
    isLoading,
    error,
    memberList,
  };
}

/**
 * Hook to watch for member status changes with real-time updates
 */
export function useMemberStatusWatch(chamaAddress: Address, memberAddress?: Address) {
  const queryClient = useQueryClient();
  const { primaryWallet } = useDynamicContext();
  const userAddress = primaryWallet?.address as Address;
  
  const targetAddress = memberAddress || userAddress;
  
  const { data: memberInfo, isLoading } = useEnhancedMemberInfo(
    chamaAddress, 
    targetAddress || '0x0'
  );
  
  // Auto-refresh when member status might change
  const refreshInterval = (() => {
    if (!memberInfo) return false;
    
    // More frequent updates for active states
    switch (memberInfo.membershipStatus) {
      case 'pending_deposit':
        return 10 * 1000; // 10 seconds
      case 'deposit_paid':
        return 30 * 1000; // 30 seconds
      case 'active':
        return 60 * 1000; // 1 minute
      default:
        return false; // No auto-refresh for stable states
    }
  })();
  
  // Optimistic update helper
  const updateMemberStatus = (updates: Partial<EnhancedMemberInfo>) => {
    if (!targetAddress) return;
    
    queryClient.setQueryData(
      memberKeys.detail(chamaAddress, targetAddress),
      (old: EnhancedMemberInfo | null) => 
        old ? { ...old, ...updates } : null
    );
  };
  
  return {
    memberInfo,
    isLoading,
    refreshInterval,
    updateMemberStatus,
    isCurrentUser: targetAddress === userAddress,
  };
}

/**
 * Prefetch member data for better UX
 */
export function usePrefetchMemberData() {
  const queryClient = useQueryClient();
  
  const prefetchMemberList = (chamaAddress: Address) => {
    queryClient.prefetchQuery({
      queryKey: memberKeys.list(chamaAddress),
      queryFn: () => blockchainService.getEnhancedMemberList(chamaAddress),
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  };
  
  const prefetchMemberInfo = (chamaAddress: Address, memberAddress: Address) => {
    queryClient.prefetchQuery({
      queryKey: memberKeys.detail(chamaAddress, memberAddress),
      queryFn: () => blockchainService.getEnhancedMemberInfo(chamaAddress, memberAddress),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };
  
  const prefetchContributionHistory = (chamaAddress: Address, memberAddress: Address) => {
    queryClient.prefetchQuery({
      queryKey: memberKeys.history(chamaAddress, memberAddress),
      queryFn: () => blockchainService.getMemberContributionHistory(chamaAddress, memberAddress),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
  
  return {
    prefetchMemberList,
    prefetchMemberInfo,
    prefetchContributionHistory,
  };
}

/**
 * Utility hook for member data operations
 */
export function useMemberDataUtils() {
  const queryClient = useQueryClient();
  
  const invalidateMemberData = (chamaAddress: Address, memberAddress?: Address) => {
    if (memberAddress) {
      // Invalidate specific member data
      queryClient.invalidateQueries({ queryKey: memberKeys.detail(chamaAddress, memberAddress) });
    } else {
      // Invalidate all member data for the chama
      queryClient.invalidateQueries({ queryKey: memberKeys.list(chamaAddress) });
    }
  };
  
  const getCachedMemberInfo = (chamaAddress: Address, memberAddress: Address): EnhancedMemberInfo | null => {
    return queryClient.getQueryData(memberKeys.detail(chamaAddress, memberAddress)) || null;
  };
  
  const getCachedMemberList = (chamaAddress: Address): EnhancedMemberList | null => {
    return queryClient.getQueryData(memberKeys.list(chamaAddress)) || null;
  };
  
  return {
    invalidateMemberData,
    getCachedMemberInfo,
    getCachedMemberList,
  };
}
