import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, parseEther, formatEther } from 'viem';
import { JENGA_CONTRACT } from '../contracts/jenga-contract';
import { citreaTestnet } from '../wagmi';

// Read hooks
export function useGetChamaInfo(chamaId: bigint) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'getChamaInfo',
    args: [chamaId],
    chainId: citreaTestnet.id,
  });
}

export function useGetUserChamas(userAddress: Address) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'getUserChamas',
    args: [userAddress],
    chainId: citreaTestnet.id,
    query: {
      enabled: !!userAddress,
    },
  });
}

export function useGetChamaMembers(chamaId: bigint) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'getChamaMembers',
    args: [chamaId],
    chainId: citreaTestnet.id,
  });
}

export function useGetUserScore(userAddress: Address) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'getUserScore',
    args: [userAddress],
    chainId: citreaTestnet.id,
    query: {
      enabled: !!userAddress,
    },
  });
}

// Write hooks
export function useCreateChama() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createChama = (
    name: string,
    contributionAmount: string, // in BTC
    cycleDuration: bigint,
    maxMembers: bigint
  ) => {
    const contributionWei = parseEther(contributionAmount);
    
    writeContract({
      ...JENGA_CONTRACT,
      functionName: 'createChama',
      args: [name, contributionWei, cycleDuration, maxMembers],
      chainId: citreaTestnet.id,
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
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const joinChama = (chamaId: bigint) => {
    writeContract({
      ...JENGA_CONTRACT,
      functionName: 'joinChama',
      args: [chamaId],
      chainId: citreaTestnet.id,
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

export function useContribute() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const contribute = (chamaId: bigint, amount: string) => {
    const amountWei = parseEther(amount);
    
    writeContract({
      ...JENGA_CONTRACT,
      functionName: 'contribute',
      args: [chamaId],
      value: amountWei,
      chainId: citreaTestnet.id,
    });
  };

  return {
    contribute,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useRequestPayout() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const requestPayout = (chamaId: bigint) => {
    writeContract({
      ...JENGA_CONTRACT,
      functionName: 'requestPayout',
      args: [chamaId],
      chainId: citreaTestnet.id,
    });
  };

  return {
    requestPayout,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

// Utility functions
export function formatChamaInfo(data: any) {
  if (!data) return null;
  
  return {
    id: data[0],
    name: data[1],
    creator: data[2],
    contributionAmount: formatEther(data[3]),
    cycleDuration: data[4],
    maxMembers: data[5],
    currentMembers: data[6],
    totalContributions: formatEther(data[7]),
    isActive: data[8],
    currentCycle: data[9],
  };
}
