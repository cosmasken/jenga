/**
 * Hook to fetch user's hybrid chamas (both off-chain and on-chain)
 */

import { useQuery } from '@tanstack/react-query';
import { offchainChamaService, type OffchainChama } from '@/services/offchainChamaService';

export function useHybridChamas(userAddress?: string) {
  return useQuery({
    queryKey: ['user-chamas', userAddress],
    queryFn: async () => {
      if (!userAddress) return [];
      
      console.log('🔍 Fetching hybrid chamas for user:', userAddress);
      
      try {
        const chamas = await offchainChamaService.getUserChamas(userAddress);
        console.log('✅ Fetched', chamas.length, 'chamas:', chamas);
        
        return chamas;
      } catch (error) {
        console.error('❌ Failed to fetch user chamas:', error);
        throw error;
      }
    },
    enabled: !!userAddress,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
}

/**
 * Helper to get chama status info
 */
export function getChamaStatusInfo(chama: OffchainChama) {
  const statusColors = {
    draft: 'gray',
    recruiting: 'blue', 
    waiting: 'orange',
    registered: 'purple',
    active: 'green',
    completed: 'gray',
    cancelled: 'red',
  };

  const statusLabels = {
    draft: 'Draft',
    recruiting: 'Recruiting',
    waiting: 'Waiting',
    registered: 'On-Chain',
    active: 'Active',
    completed: 'Completed', 
    cancelled: 'Cancelled',
  };

  return {
    color: statusColors[chama.status],
    label: statusLabels[chama.status],
    isDeployable: chama.status === 'waiting' || chama.status === 'recruiting',
    isOnChain: !!chama.chain_address,
  };
}

export default useHybridChamas;
