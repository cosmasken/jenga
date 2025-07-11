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

// Note: The actual Jenga.sol contract doesn't have a getUserChamas function
// This is a placeholder that returns empty data since we'd need to track this via events
export function useGetUserChamas(userAddress: Address) {
  // Since the contract doesn't have this function, we return a mock structure
  // In a real implementation, you'd need to:
  // 1. Listen to ChamaCreated and ChamaJoined events
  // 2. Filter by user address
  // 3. Build the user's chama list from events
  return {
    data: [], // Empty array as placeholder
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
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

  const joinChama = (chamaId: bigint) => {
    writeContract({
      ...JENGA_CONTRACT,
      functionName: 'joinChama',
      args: [chamaId],
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
    // Note: members array is not returned by the chamas mapping
    // You would need to track this separately or use events
    active: data[4] || false,
    currentCycle: data[5] || 0n,
    currentRecipientIndex: data[6] || 0n,
    lastCycleTimestamp: data[7] || 0n,
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
