import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Abi } from 'viem';
import { citreaTestnet } from '../config';
import JENGA_FACTORY_ABI from '../abi/JengaFactory.json';
import { ChamaGamificationHooks } from './useChamaGamification';
import { ChamaHooks } from './useChama';
import { P2PHooks } from './useP2P';

// Contract configuration
const JENGA_FACTORY_CONTRACT = {
  address: process.env.REACT_APP_JENGA_FACTORY_CONTRACT_ADDRESS as `0x${string}`,
  abi: JENGA_FACTORY_ABI.abi as Abi,
} as const;

// Re-export types from modular hooks
export type { ChamaDetails, Contribution, CycleInfo } from './useChama';

export type { Profile, Achievement } from './useChamaGamification';

export type { Transaction, RedEnvelopeDetails } from './useP2P';

// Factory-specific write hooks
export const useCreateChamaWithGamification = () => {
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
      ...JENGA_FACTORY_CONTRACT,
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

export const useJoinChamaWithGamification = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const joinChama = (chamaId: bigint, collateralAmount: bigint) => {
    writeContract({
      ...JENGA_FACTORY_CONTRACT,
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

export const useStackBTCWithGamification = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const stackBTC = (chamaId: bigint, contributionAmount: bigint) => {
    writeContract({
      ...JENGA_FACTORY_CONTRACT,
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

export const useSendP2PWithGamification = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const sendP2P = (receiver: string, amount: bigint) => {
    writeContract({
      ...JENGA_FACTORY_CONTRACT,
      functionName: 'sendP2P',
      args: [receiver as `0x${string}`],
      value: amount,
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    sendP2P,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

export const useSendRedEnvelopeWithGamification = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const sendRedEnvelope = (
    recipients: string[],
    totalAmount: bigint,
    isRandom: boolean,
    message: string
  ) => {
    writeContract({
      ...JENGA_FACTORY_CONTRACT,
      functionName: 'sendRedEnvelope',
      args: [
        recipients as `0x${string}`[],
        totalAmount,
        isRandom,
        message,
      ],
      value: totalAmount,
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    sendRedEnvelope,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

// Factory-specific read hooks
export const useGetUserCompleteProfile = (userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  const { data: moduleAddresses } = useReadContract({
    functionName: 'getModuleAddresses',
    address: citreaTestnet.smartContracts.jengaFactory as `0x${string}`,
    abi: JENGA_FACTORY_ABI.abi as Abi,
  });

  return useReadContract({
    ...JENGA_FACTORY_CONTRACT,
    functionName: 'getUserCompleteProfile',
    args: [targetAddress as `0x${string}`],
    query: {
      enabled: !!targetAddress,
    },
  });
};

export const useGetModuleAddresses = () => {
  return useReadContract({
    ...JENGA_FACTORY_CONTRACT,
    functionName: 'getModuleAddresses',
  });
};

// Re-export all modular hooks for direct access
export { ChamaHooks } from './useChama';
export { ChamaGamificationHooks as GamificationHooks } from './useChamaGamification';
export { P2PHooks } from './useP2P';

// Unified hooks that combine multiple modules
export const useJengaUserData = (userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  // Get data from all modules
  const gamificationData = ChamaGamificationHooks.useUserGamificationData(targetAddress);
  const p2pData = P2PHooks.useUserP2PData(targetAddress);
  
  return {
    // Gamification data
    profile: gamificationData.profile,
    score: gamificationData.score,
    achievements: gamificationData.achievements,
    inviteHash: gamificationData.inviteHash,
    referralCount: gamificationData.referralCount,
    referrals: gamificationData.referrals,
    hasProfile: gamificationData.hasProfile,
    
    // P2P data
    transactionHistory: p2pData.transactionHistory,
    redEnvelopes: p2pData.redEnvelopes,
    p2pCount: p2pData.p2pCount,
    redEnvelopeCount: p2pData.redEnvelopeCount,
  };
};

export const useJengaChamaData = (chamaId: bigint, userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  // Get chama data
  const chamaDetails = ChamaHooks.useGetChamaDetails(chamaId);
  const chamaMembers = ChamaHooks.useGetChamaMembers(chamaId);
  const chamaStatus = ChamaHooks.useChamaStatus(chamaId);
  const memberInfo = ChamaHooks.useMemberChamaInfo(chamaId, targetAddress);

  return {
    details: chamaDetails.data,
    members: chamaMembers.data,
    status: chamaStatus,
    memberInfo,
    isLoading: chamaDetails.isLoading || chamaMembers.isLoading,
    error: chamaDetails.error || chamaMembers.error,
  };
};

// Backward compatibility hooks (for existing components)
export const useCreateChama = useCreateChamaWithGamification;
export const useJoinChama = useJoinChamaWithGamification;
export const useStackBTC = useStackBTCWithGamification;
export const useSendP2P = useSendP2PWithGamification;
export const useSendRedEnvelope = useSendRedEnvelopeWithGamification;

// Direct access to core functionality
export const useStartChama = ChamaHooks.useStartChama;
export const useProcessMissedContributions = ChamaHooks.useProcessMissedContributions;
export const useClaimRedEnvelope = P2PHooks.useClaimRedEnvelope;
export const useExpireRedEnvelope = P2PHooks.useExpireRedEnvelope;

// Profile management
export const useCreateProfile = ChamaGamificationHooks.useCreateProfile;
export const useUpdateProfile = ChamaGamificationHooks.useUpdateProfile;
export const useGenerateInvite = ChamaGamificationHooks.useGenerateInvite;
export const useAcceptInvite = ChamaGamificationHooks.useAcceptInvite;

// Read hooks for backward compatibility
export const useChamaCount = ChamaHooks.useChamaCount;
export const useGetChamaCount = ChamaHooks.useChamaCount;
export const useGetChamaDetails = ChamaHooks.useGetChamaDetails;
export const useGetChamaInfo = ChamaHooks.useGetChamaDetails;
export const useGetChamaMembers = ChamaHooks.useGetChamaMembers;
export const useGetAllChamas = ChamaHooks.useGetAllChamas;
export const useGetUserChamas = ChamaHooks.useGetUserChamas;
export const useGetUserScore = ChamaGamificationHooks.useGetUserScore;
export const useGetUserAchievements = ChamaGamificationHooks.useGetUserAchievements;
export const useGetUserProfile = ChamaGamificationHooks.useGetUserProfile;
export const useGetUserTransactionHistory = P2PHooks.useGetUserTransactionHistory;
export const useGetRedEnvelopeDetails = P2PHooks.useGetRedEnvelopeDetails;
export const useHasContributedThisCycle = ChamaHooks.useHasContributedThisCycle;

// Utility hooks
export const useIsChamaMember = ChamaHooks.useIsChamaMember;
export const useChamaStatus = ChamaHooks.useChamaStatus;
export const useLeaderboard = ChamaGamificationHooks.useLeaderboard;
export const useInviteSystem = ChamaGamificationHooks.useInviteSystem;
export const useP2PStats = P2PHooks.useP2PStats;
export const useActiveRedEnvelopes = P2PHooks.useActiveRedEnvelopes;

// Advanced utility hooks
export const useJengaStats = (userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  const userData = useJengaUserData(targetAddress);
  const p2pStats = P2PHooks.useP2PStats(targetAddress);
  const achievementProgress = ChamaGamificationHooks.useAchievementProgress(targetAddress);

  return {
    // User stats
    totalScore: userData.score,
    achievementsUnlocked: achievementProgress.unlockedCount,
    achievementProgress: achievementProgress.progress,
    
    // P2P stats
    p2pTransactionCount: p2pStats.p2pCount,
    redEnvelopesSent: p2pStats.redEnvelopeCount,
    totalSent: p2pStats.totalSent,
    totalReceived: p2pStats.totalReceived,
    
    // Social stats
    referralCount: userData.referralCount,
    hasInviteLink: !!userData.inviteHash,
    
    // Activity level
    activityScore: Number(userData.score) + 
                  Number(p2pStats.p2pCount) * 5 + 
                  Number(userData.referralCount) * 10,
  };
};

export const useJengaDashboard = (userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  const userData = useJengaUserData(targetAddress);
  const stats = useJengaStats(targetAddress);
  const inviteSystem = ChamaGamificationHooks.useInviteSystem();
  const activeEnvelopes = P2PHooks.useActiveRedEnvelopes();

  return {
    user: userData,
    stats,
    inviteSystem,
    activeEnvelopes,
    isLoading: !userData.hasProfile && !!targetAddress,
  };
};

// Utility functions for backward compatibility
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
  return Number(bigIntAmount / (BigInt(10) * BigInt(10) * BigInt(10) * BigInt(10) * BigInt(10) * BigInt(10) * BigInt(10) * BigInt(10) * BigInt(10) * BigInt(10)));
}

export function formatChamaInfo(data: any) {
  if (!data || !Array.isArray(data)) return null;
  
  return {
    name: data[0] || '',
    contributionAmount: data[1] || BigInt(0),
    cycleDuration: data[2] || BigInt(0),
    maxMembers: data[3] || BigInt(0),
    members: [], // Will be populated separately via getChamaMembers
    active: data[4] || false,
    currentCycle: data[5] || BigInt(0),
    currentRecipientIndex: data[6] || BigInt(0),
    lastCycleTimestamp: data[7] || BigInt(0),
    totalPool: data[8] || BigInt(0),
    totalCollateral: data[9] || BigInt(0),
  };
}
