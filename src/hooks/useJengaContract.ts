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

// Hook to get all chamas (for browsing) with members data
export function useGetAllChamas() {
  // First get the total number of chamas
  const { data: chamaCount, isLoading: countLoading, refetch: refetchCount } = useGetChamaCount();
  
  // For now, let's limit to checking the first 20 chamas to avoid too many hook calls
  // In a production app, you'd want to implement pagination or use events
  const MAX_CHAMAS_TO_FETCH = 20;
  
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
  const chama11 = useGetChamaInfo(11n);
  const chama12 = useGetChamaInfo(12n);
  const chama13 = useGetChamaInfo(13n);
  const chama14 = useGetChamaInfo(14n);
  const chama15 = useGetChamaInfo(15n);
  const chama16 = useGetChamaInfo(16n);
  const chama17 = useGetChamaInfo(17n);
  const chama18 = useGetChamaInfo(18n);
  const chama19 = useGetChamaInfo(19n);
  const chama20 = useGetChamaInfo(20n);

  // Get members for each chama
  const members1 = useGetChamaMembers(1n);
  const members2 = useGetChamaMembers(2n);
  const members3 = useGetChamaMembers(3n);
  const members4 = useGetChamaMembers(4n);
  const members5 = useGetChamaMembers(5n);
  const members6 = useGetChamaMembers(6n);
  const members7 = useGetChamaMembers(7n);
  const members8 = useGetChamaMembers(8n);
  const members9 = useGetChamaMembers(9n);
  const members10 = useGetChamaMembers(10n);
  const members11 = useGetChamaMembers(11n);
  const members12 = useGetChamaMembers(12n);
  const members13 = useGetChamaMembers(13n);
  const members14 = useGetChamaMembers(14n);
  const members15 = useGetChamaMembers(15n);
  const members16 = useGetChamaMembers(16n);
  const members17 = useGetChamaMembers(17n);
  const members18 = useGetChamaMembers(18n);
  const members19 = useGetChamaMembers(19n);
  const members20 = useGetChamaMembers(20n);

  const chamaQueries = [
    chama1, chama2, chama3, chama4, chama5, 
    chama6, chama7, chama8, chama9, chama10,
    chama11, chama12, chama13, chama14, chama15,
    chama16, chama17, chama18, chama19, chama20
  ];

  const memberQueries = [
    members1, members2, members3, members4, members5,
    members6, members7, members8, members9, members10,
    members11, members12, members13, members14, members15,
    members16, members17, members18, members19, members20
  ];

  // Process the results
  const allChamas = React.useMemo(() => {
    if (!chamaCount || chamaCount === 0n) return [];
    
    const chamas = [];
    const totalChamas = Math.min(Number(chamaCount), MAX_CHAMAS_TO_FETCH);
    
    for (let i = 0; i < totalChamas; i++) {
      const chamaQuery = chamaQueries[i];
      const memberQuery = memberQueries[i];
      
      if (chamaQuery.data) {
        const chamaInfo = formatChamaInfo(chamaQuery.data);
        if (chamaInfo) {
          // Use members from getChamaMembers if available, otherwise use empty array
          const members = Array.isArray(memberQuery.data) ? memberQuery.data : [];
          
          // Add the chama ID and members to the info
          chamas.push({
            id: BigInt(i + 1),
            ...chamaInfo,
            members: members, // Override with actual members data
          });
        }
      }
    }
    return chamas;
  }, [chamaQueries, memberQueries, chamaCount]);

  const isLoading = countLoading || 
    chamaQueries.some(query => query.isLoading) || 
    memberQueries.some(query => query.isLoading);
    
  const error = chamaQueries.find(query => query.error)?.error || 
    memberQueries.find(query => query.error)?.error || 
    null;

  return {
    data: allChamas,
    isLoading,
    error,
    refetch: () => {
      refetchCount();
      chamaQueries.forEach(query => query.refetch?.());
      memberQueries.forEach(query => query.refetch?.());
    },
  };
}
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
    
    console.log('=== useCreateChama Debug ===');
    console.log('Input parameters:', {
      name,
      contributionSats,
      payoutPeriodSeconds: payoutPeriodSeconds.toString(),
      maxMembers: maxMembers.toString()
    });
    
    console.log('Calculated values:', {
      contributionAmount: contributionAmount.toString(),
      contributionAmountInEther: contributionAmount.toString(),
      contractAddress: JENGA_CONTRACT.address,
      chainId: citreaTestnet.id
    });
    
    console.log('Final writeContract call:', {
      contract: JENGA_CONTRACT.address,
      functionName: 'createChama',
      args: [name, contributionAmount, payoutPeriodSeconds, maxMembers],
      value: contributionAmount.toString(),
      account: address
    });
    
    try {
      writeContract({
        ...JENGA_CONTRACT,
        functionName: 'createChama',
        args: [name, contributionAmount, payoutPeriodSeconds, maxMembers],
        value: contributionAmount, // Send collateral equal to contribution amount
        chain: citreaTestnet,
        account: address,
      });
      console.log('writeContract called successfully');
    } catch (error) {
      console.error('Error in writeContract call:', error);
      throw error;
    }
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

// Hook to start a chama (creator only, one-time)
export function useStartChama() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const startChama = (chamaId: bigint) => {
    console.log('Starting chama:', {
      chamaId: chamaId.toString(),
      caller: address,
    });

    writeContract({
      ...JENGA_CONTRACT,
      functionName: 'startChama', // This function needs to be added to contract
      args: [chamaId],
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    startChama,
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
  
  // Ensure members is always an array
  let members = [];
  if (Array.isArray(data[4])) {
    members = data[4];
  } else if (data[4]) {
    // If it's not an array but has a value, try to convert it
    console.warn('Members data is not an array:', data[4]);
    members = [];
  }
  
  return {
    name: data[0] || '',
    contributionAmount: data[1] || 0n,
    cycleDuration: data[2] || 0n,
    maxMembers: data[3] || 0n,
    members: members, // Always an array
    active: data[5] || false,
    currentCycle: data[6] || 0n,
    currentRecipientIndex: data[7] || 0n,
    lastCycleTimestamp: data[8] || 0n,
    totalPool: data[9] || 0n,
    // Note: membersPaid array might be at data[10] but could be empty
    // totalCollateral might be at data[11] or later depending on what's returned
    totalCollateral: data[11] || data[10] || 0n,
  };
}

// Helper function to convert sats to display format
export function formatSatsFromWei(weiAmount: bigint | number | string): number {
  // Handle different input types
  let bigIntAmount: bigint;
  
  if (typeof weiAmount === 'bigint') {
    bigIntAmount = weiAmount;
  } else if (typeof weiAmount === 'number') {
    bigIntAmount = BigInt(weiAmount);
  } else if (typeof weiAmount === 'string') {
    bigIntAmount = BigInt(weiAmount);
  } else {
    return 0;
  }
  
  // Convert wei back to sats: wei / 1e10
  return Number(bigIntAmount / 10n ** 10n);
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
