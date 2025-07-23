import { useWriteContract, useReadContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { citreaTestnet } from '../config';
import CHAMA_CORE_ABI from '../abi/ChamaCore.json';
import { Abi } from 'viem';

// Contract configuration
const CHAMA_CORE_CONTRACT = {
  address: process.env.REACT_APP_CHAMA_CORE_CONTRACT_ADDRESS as `0x${string}`,
  abi: CHAMA_CORE_ABI.abi as Abi,
} as const;

// Types
export interface ChamaDetails {
  name: string;
  contributionAmount: bigint;
  cycleDuration: bigint;
  maxMembers: bigint;
  currentMembers: bigint;
  active: boolean;
  currentCycle: bigint;
  totalPool: bigint;
  totalCollateral: bigint;
}

export interface Contribution {
  contributor: string;
  amount: bigint;
  timestamp: bigint;
}

export interface CycleInfo {
  cycleContributions: bigint;
  recipient: string;
  completed: boolean;
}

// Write hooks
export const useCreateChama = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const createChama = (
    name: string,
    contributionAmount: bigint,
    cycleDuration: bigint,
    maxMembers: bigint,
    collateralAmount: bigint
  ) => {
    writeContract({
      ...CHAMA_CORE_CONTRACT,
      functionName: 'createChama',
      args: [name, contributionAmount, cycleDuration, maxMembers],
      value: collateralAmount,
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
};

export const useJoinChama = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const joinChama = (chamaId: bigint, collateralAmount: bigint) => {
    writeContract({
      ...CHAMA_CORE_CONTRACT,
      functionName: 'joinChama',
      args: [chamaId],
      value: collateralAmount,
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
};

export const useStartChama = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const startChama = (chamaId: bigint) => {
    writeContract({
      ...CHAMA_CORE_CONTRACT,
      functionName: 'startChama',
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
};

export const useStackBTC = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const stackBTC = (chamaId: bigint, contributionAmount: bigint) => {
    writeContract({
      ...CHAMA_CORE_CONTRACT,
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
};

export const useProcessMissedContributions = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const processMissedContributions = (chamaId: bigint) => {
    writeContract({
      ...CHAMA_CORE_CONTRACT,
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
};

// Read hooks
export const useChamaCount = () => {
  return useReadContract({
    ...CHAMA_CORE_CONTRACT,
    functionName: 'chamaCount',
  });
};

export const useGetChamaDetails = (chamaId: bigint) => {
  return useReadContract({
    ...CHAMA_CORE_CONTRACT,
    functionName: 'getChamaDetails',
    args: [chamaId],
  });
};

export const useGetChamaMembers = (chamaId: bigint) => {
  return useReadContract({
    ...CHAMA_CORE_CONTRACT,
    functionName: 'getChamaMembers',
    args: [chamaId],
  });
};

export const useGetMemberContributions = (chamaId: bigint, memberAddress: string) => {
  return useReadContract({
    ...CHAMA_CORE_CONTRACT,
    functionName: 'getMemberContributions',
    args: [chamaId, memberAddress as `0x${string}`],
  });
};

export const useGetCycleInfo = (chamaId: bigint, cycle: bigint) => {
  return useReadContract({
    ...CHAMA_CORE_CONTRACT,
    functionName: 'getCycleInfo',
    args: [chamaId, cycle],
  });
};

export const useGetMemberCollateral = (chamaId: bigint, memberAddress: string) => {
  return useReadContract({
    ...CHAMA_CORE_CONTRACT,
    functionName: 'getMemberCollateral',
    args: [chamaId, memberAddress as `0x${string}`],
  });
};

export const useIsCollateralReturned = (chamaId: bigint, memberAddress: string) => {
  return useReadContract({
    ...CHAMA_CORE_CONTRACT,
    functionName: 'isCollateralReturned',
    args: [chamaId, memberAddress as `0x${string}`],
  });
};

export const useGetTotalCollateral = (chamaId: bigint) => {
  return useReadContract({
    ...CHAMA_CORE_CONTRACT,
    functionName: 'getTotalCollateral',
    args: [chamaId],
  });
};

export const useGetMemberPayoutPosition = (chamaId: bigint, memberAddress: string) => {
  return useReadContract({
    ...CHAMA_CORE_CONTRACT,
    functionName: 'getMemberPayoutPosition',
    args: [chamaId, memberAddress as `0x${string}`],
  });
};

export const useHasMemberReceivedPayout = (chamaId: bigint, memberAddress: string) => {
  return useReadContract({
    ...CHAMA_CORE_CONTRACT,
    functionName: 'hasMemberReceivedPayout',
    args: [chamaId, memberAddress as `0x${string}`],
  });
};

export const useHasContributedThisCycle = (chamaId: bigint, memberAddress: string) => {
  return useReadContract({
    ...CHAMA_CORE_CONTRACT,
    functionName: 'hasContributedThisCycle',
    args: [chamaId, memberAddress as `0x${string}`],
  });
};

export const useLastContributionTimestamp = (chamaId: bigint, memberAddress: string) => {
  return useReadContract({
    ...CHAMA_CORE_CONTRACT,
    functionName: 'lastContributionTimestamp',
    args: [chamaId, memberAddress as `0x${string}`],
  });
};

// Utility hooks
export const useIsChamaMember = (chamaId: bigint, memberAddress?: string) => {
  const { address } = useAccount();
  const userAddress = memberAddress || address;
  
  const { data: members } = useGetChamaMembers(chamaId);
  
  if (!members || !userAddress) return false;
  
  return (members as string[]).includes(userAddress);
};

export const useChamaStatus = (chamaId: bigint) => {
  const { data: chamaDetails } = useGetChamaDetails(chamaId);
  
  if (!chamaDetails) return null;
  
  const details = chamaDetails as ChamaDetails;
  
  return {
    isActive: details.active,
    isFull: details.currentMembers >= details.maxMembers,
    hasStarted: details.currentCycle > BigInt(0),
    isComplete: details.currentCycle > details.maxMembers,
  };
};

export const useMemberChamaInfo = (chamaId: bigint, memberAddress?: string) => {
  const { address } = useAccount();
  const userAddress = memberAddress || address;
  
  const isMember = useIsChamaMember(chamaId, userAddress);
  const { data: contributions } = useGetMemberContributions(chamaId, userAddress || '');
  const { data: collateral } = useGetMemberCollateral(chamaId, userAddress || '');
  const { data: hasReceivedPayout } = useHasMemberReceivedPayout(chamaId, userAddress || '');
  const { data: payoutPosition } = useGetMemberPayoutPosition(chamaId, userAddress || '');
  const { data: hasContributed } = useHasContributedThisCycle(chamaId, userAddress || '');
  
  return {
    isMember,
    contributions: contributions as Contribution[] || [],
    collateral: collateral as bigint || BigInt(0),
    hasReceivedPayout: hasReceivedPayout as boolean || false,
    payoutPosition: payoutPosition as bigint || BigInt(0),
    hasContributedThisCycle: hasContributed as boolean || false,
  };
};

// Export all hooks as a grouped object
export const ChamaHooks = {
  useCreateChama,
  useJoinChama,
  useStartChama,
  useStackBTC,
  useProcessMissedContributions,
  useChamaCount,
  useGetChamaDetails,
  useGetChamaMembers,
  useGetMemberContributions,
  useGetCycleInfo,
  useGetMemberCollateral,
  useIsCollateralReturned,
  useGetTotalCollateral,
  useGetMemberPayoutPosition,
  useHasMemberReceivedPayout,
  useHasContributedThisCycle,
  useLastContributionTimestamp,
  useIsChamaMember,
  useChamaStatus,
  useMemberChamaInfo,
};
