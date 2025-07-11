import React from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { Address, parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { JENGA_CONTRACT } from '../contracts/jenga-contract';
import { citreaTestnet } from '../wagmi';

// Read hooks based on actual contract
export function useGetChamaInfo(chamaId: bigint) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'chamas',
    args: [chamaId],
    chainId: citreaTestnet.id,
    query: {
      enabled: chamaId > 0n,
    },
  });
}

export function useGetChamaCount() {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'chamaCount',
    args: [],
    chainId: citreaTestnet.id,
  });
}

export function useGetUserScore(userAddress: Address) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'scores',
    args: [userAddress],
    chainId: citreaTestnet.id,
    query: {
      enabled: !!userAddress,
    },
  });
}

export function useGetUserContributions(chamaId: bigint, userAddress: Address) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'contributions',
    args: [chamaId, userAddress],
    chainId: citreaTestnet.id,
    query: {
      enabled: !!userAddress && chamaId > 0n,
    },
  });
}

// Check if user has contributed in current cycle
export function useHasContributedThisCycle(chamaId: bigint, userAddress: Address) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'hasContributedThisCycle',
    args: [chamaId, userAddress],
    chainId: citreaTestnet.id,
    query: {
      enabled: !!userAddress && chamaId > 0n,
    },
  });
}

// Check last contribution timestamp
export function useLastContributionTimestamp(chamaId: bigint, userAddress: Address) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'lastContributionTimestamp',
    args: [chamaId, userAddress],
    chainId: citreaTestnet.id,
    query: {
      enabled: !!userAddress && chamaId > 0n,
    },
  });
}

// New ROSCA-specific hooks
// New collateral-related hooks
export function useGetMemberCollateral(chamaId: bigint, userAddress: Address) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'getMemberCollateral',
    args: [chamaId, userAddress],
    chainId: citreaTestnet.id,
    query: {
      enabled: !!userAddress && chamaId > 0n,
    },
  });
}

export function useIsCollateralReturned(chamaId: bigint, userAddress: Address) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'isCollateralReturned',
    args: [chamaId, userAddress],
    chainId: citreaTestnet.id,
    query: {
      enabled: !!userAddress && chamaId > 0n,
    },
  });
}

export function useGetTotalCollateral(chamaId: bigint) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'getTotalCollateral',
    args: [chamaId],
    chainId: citreaTestnet.id,
    query: {
      enabled: chamaId > 0n,
    },
  });
}

export function useGetChamaMembers(chamaId: bigint) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'getChamaMembers',
    args: [chamaId],
    chainId: citreaTestnet.id,
    query: {
      enabled: chamaId > 0n,
    },
  });
}

export function useGetMemberPayoutPosition(chamaId: bigint, userAddress: Address) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'getMemberPayoutPosition',
    args: [chamaId, userAddress],
    chainId: citreaTestnet.id,
    query: {
      enabled: !!userAddress && chamaId > 0n,
    },
  });
}

export function useHasMemberReceivedPayout(chamaId: bigint, userAddress: Address) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'hasMemberReceivedPayout',
    args: [chamaId, userAddress],
    chainId: citreaTestnet.id,
    query: {
      enabled: !!userAddress && chamaId > 0n,
    },
  });
}

export function useGetCycleInfo(chamaId: bigint, cycle: bigint) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'getCycleInfo',
    args: [chamaId, cycle],
    chainId: citreaTestnet.id,
    query: {
      enabled: chamaId > 0n && cycle > 0n,
    },
  });
}

// Note: The actual Jenga.sol contract doesn't have a getUserChamas function
// This implementation fetches chama count and checks membership for each chama
export function useGetUserChamas(userAddress: Address) {
  // First get the total number of chamas
  const { data: chamaCount, isLoading: countLoading } = useGetChamaCount();
  
  // For now, let's limit to checking the first 10 chamas to avoid too many hook calls
  // In a production app, you'd want to implement pagination or use events
  const MAX_CHAMAS_TO_CHECK = 10;
  
  // Always call the same number of hooks (fixed number)
  const chama1 = useGetChamaInfo(1n);
  const chama2 = useGetChamaInfo(2n);
  const chama3 = useGetChamaInfo(3n);
  const chama4 = useGetChamaInfo(4n);
  const chama5 = useGetChamaInfo(5n);
  const chama6 = useGetChamaInfo(6n);
  const chama7 = useGetChamaInfo(7n);
  const chama8 = useGetChamaInfo(8n);
  const chama9 = useGetChamaInfo(9n);
  const chama10 = useGetChamaInfo(10n);

  const chamaQueries = [chama1, chama2, chama3, chama4, chama5, chama6, chama7, chama8, chama9, chama10];

  // Process the results
  const userChamas = React.useMemo(() => {
    if (!userAddress || !chamaCount || chamaCount === 0n) return [];
    
    const chamas = [];
    const totalChamas = Math.min(Number(chamaCount), MAX_CHAMAS_TO_CHECK);
    
    for (let i = 0; i < totalChamas; i++) {
      const query = chamaQueries[i];
      if (query.data) {
        const chamaInfo = formatChamaInfo(query.data);
        if (chamaInfo) {
          // Add the chama ID to the info
          chamas.push({
            id: BigInt(i + 1),
            ...chamaInfo,
          });
        }
      }
    }
    return chamas;
  }, [chamaQueries, userAddress, chamaCount]);

  const isLoading = countLoading || chamaQueries.some(query => query.isLoading);
  const error = chamaQueries.find(query => query.error)?.error || null;

  return {
    data: userChamas,
    isLoading,
    error,
    refetch: () => {
      chamaQueries.forEach(query => query.refetch?.());
    },
  };
}

// Write hooks
export function useCreateChama() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createChama = (
    name: string,
    contributionSats: number,
    payoutPeriodSeconds: bigint,
    maxMembers: bigint
  ) => {
    // Convert sats to wei: 1 sat = 1e10 wei (since 1 BTC = 1e8 sats and 1 BTC = 1e18 wei)
    const contributionAmount = BigInt(contributionSats) * 10n ** 10n;
    
    writeContract({
      ...JENGA_CONTRACT,
      functionName: 'createChama',
      args: [name, contributionAmount, payoutPeriodSeconds, maxMembers],
      value: contributionAmount, // Send collateral equal to contribution amount
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    createChama,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useJoinChama() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const joinChama = (chamaId: bigint, collateralAmount: bigint) => {
    writeContract({
      ...JENGA_CONTRACT,
      functionName: 'joinChama',
      args: [chamaId],
      value: collateralAmount, // Send collateral equal to contribution amount
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    joinChama,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useStackBTC() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const stackBTC = (chamaId: bigint, contributionSats: number) => {
    // Convert sats to wei: 1 sat = 1e10 wei
    const contributionAmount = BigInt(contributionSats) * 10n ** 10n;
    
    writeContract({
      ...JENGA_CONTRACT,
      functionName: 'stackBTC',
      args: [chamaId],
      value: contributionAmount,
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    stackBTC,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

// New hook for processing missed contributions
export function useProcessMissedContributions() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const processMissedContributions = (chamaId: bigint) => {
    writeContract({
      ...JENGA_CONTRACT,
      functionName: 'processMissedContributions',
      args: [chamaId],
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    processMissedContributions,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

// Legacy function names for backward compatibility
export const useContribute = useStackBTC;

// Utility functions
export function formatChamaInfo(data: any) {
  if (!data || !Array.isArray(data)) return null;
  
  return {
    name: data[0] || '',
    contributionAmount: data[1] || 0n,
    cycleDuration: data[2] || 0n,
    maxMembers: data[3] || 0n,
    members: data[4] || [], // This might be empty from the mapping
    active: data[5] || false,
    currentCycle: data[6] || 0n,
    currentRecipientIndex: data[7] || 0n,
    lastCycleTimestamp: data[8] || 0n,
    totalPool: data[9] || 0n,
  };
}

// Helper function to convert sats to display format
export function formatSatsFromWei(weiAmount: bigint): number {
  // Convert wei back to sats: wei / 1e10
  return Number(weiAmount / 10n ** 10n);
}

// Helper function to format sats for display
export function formatSats(sats: number): string {
  return sats.toLocaleString() + ' sats';
}

// Helper function to determine user's status in a chama
export function getChamaUserStatus(
  chamaInfo: any,
  userAddress: Address,
  hasContributed: boolean,
  hasReceivedPayout: boolean,
  memberPosition: number,
  chamaMembers: Address[] | undefined
) {
  // Use chamaMembers from getChamaMembers hook instead of chamaInfo.members
  const members = chamaMembers || [];
  
  if (!members.includes(userAddress)) {
    return 'not_member';
  }
  
  if (!chamaInfo.active) {
    return 'completed';
  }
  
  if (chamaInfo.currentCycle === 0) {
    return 'waiting_to_start';
  }
  
  if (hasReceivedPayout) {
    return 'received_payout';
  }
  
  if (chamaInfo.currentRecipientIndex === memberPosition) {
    return 'current_recipient';
  }
  
  if (hasContributed) {
    return 'contributed_this_cycle';
  }
  
  return 'needs_to_contribute';
}
