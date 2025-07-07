import { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { parseEther, type Address } from 'viem';
import { CONTRACT_ADDRESSES } from '@/config';
import { 
  createZeroDevClients, 
  shouldSponsorGas, 
  getUserLevel,
  GAS_POLICIES,
  USER_LEVELS,
  RATE_LIMITS 
} from '@/config/zerodev';
import { useToast } from './use-toast';

// Import ABIs
import SaccoFactoryABI from '@/abi/SaccoFactory.json';
import JengaRegistryABI from '@/abi/JengaRegistry.json';
import StackingVaultABI from '@/abi/StackingVault.json';

interface UseZeroDevContractOptions {
  sponsorGas?: boolean;
  userLevel?: keyof typeof USER_LEVELS;
  userStats?: {
    transactionCount: number;
    accountAge: number;
    totalContributed: bigint;
    chamasJoined: number;
    reputationScore?: number;
    referrals?: number;
    dailyTransactions: number;
    weeklyTransactions: number;
    monthlyTransactions: number;
  };
}

export const useZeroDevCreatePool = (options: UseZeroDevContractOptions = {}) => {
  const { toast } = useToast();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const createPool = useCallback(async (
    contribution: string,
    cycleDuration: number,
    totalCycles: number,
    initialMembers: string[] = []
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // Check if we should sponsor gas for this operation
      const sponsorshipCheck = shouldSponsorGas(
        'createPool', 
        undefined, 
        options.userLevel, 
        options.userStats
      );
      
      if (options.sponsorGas && sponsorshipCheck.eligible) {
        // Use ZeroDev for sponsored transaction
        const { kernelClient } = await createZeroDevClients();
        
        const hash = await kernelClient.writeContract({
          address: CONTRACT_ADDRESSES.SACCO_FACTORY as Address,
          abi: SaccoFactoryABI,
          functionName: 'createPool',
          args: [
            parseEther(contribution),
            cycleDuration,
            totalCycles,
            initialMembers
          ],
        });

        setTxHash(hash);
        
        toast({
          title: "🎉 Pool Created (Gas Sponsored!)",
          description: `${sponsorshipCheck.reason}. Hash: ${hash.slice(0, 10)}...`,
        });
      } else {
        // Show why gas wasn't sponsored
        toast({
          title: "Gas Sponsorship Not Available",
          description: sponsorshipCheck.reason || "This transaction will use your wallet's gas.",
          variant: "default"
        });
        
        // Here you would fallback to regular Wagmi transaction
        throw new Error('Regular transaction fallback needed');
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      toast({
        title: "Pool Creation Failed",
        description: error.message,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, options, toast]);

  return {
    createPool,
    isLoading,
    txHash,
    error,
    isSuccess: !!txHash,
  };
};

export const useZeroDevContribute = (options: UseZeroDevContractOptions = {}) => {
  const { toast } = useToast();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const contribute = useCallback(async (poolId: number, amount: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const amountBigInt = parseEther(amount);
      
      // Check if we should sponsor gas for this contribution
      const sponsorshipCheck = shouldSponsorGas(
        'contributeToCycle', 
        amountBigInt, 
        options.userLevel,
        options.userStats
      );
      
      if (options.sponsorGas && sponsorshipCheck.eligible) {
        // Use ZeroDev for sponsored transaction
        const { kernelClient } = await createZeroDevClients();
        
        const hash = await kernelClient.writeContract({
          address: CONTRACT_ADDRESSES.SACCO_FACTORY as Address,
          abi: SaccoFactoryABI,
          functionName: 'contributeToCycle',
          args: [poolId],
          value: amountBigInt,
        });

        setTxHash(hash);
        
        toast({
          title: "🎉 Contribution Successful (Gas Sponsored!)",
          description: `${sponsorshipCheck.reason}. Hash: ${hash.slice(0, 10)}...`,
        });
      } else {
        // Show gas sponsorship info
        const microPolicy = GAS_POLICIES.MICRO_CONTRIBUTIONS;
        toast({
          title: "Gas Sponsorship Info",
          description: `Contributions under ${Number(microPolicy.maxAmount) / 100000000} BTC qualify for sponsored gas.`,
          variant: "default"
        });
        
        // Fallback to regular transaction
        throw new Error('Regular transaction fallback needed');
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      toast({
        title: "Contribution Failed",
        description: error.message,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, options, toast]);

  return {
    contribute,
    isLoading,
    txHash,
    error,
    isSuccess: !!txHash,
  };
};

export const useZeroDevCreateProfile = (options: UseZeroDevContractOptions = {}) => {
  const { toast } = useToast();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const createProfile = useCallback(async (username: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // Profile creation should always be sponsored for new users
      const sponsorshipCheck = shouldSponsorGas(
        'createProfile', 
        undefined, 
        options.userLevel,
        options.userStats
      );
      
      if (options.sponsorGas && sponsorshipCheck.eligible) {
        const { kernelClient } = await createZeroDevClients();
        
        const hash = await kernelClient.writeContract({
          address: CONTRACT_ADDRESSES.JENGA_REGISTRY as Address,
          abi: JengaRegistryABI,
          functionName: 'createProfile',
          args: [username],
        });

        setTxHash(hash);
        
        toast({
          title: "🎉 Welcome to Jenga! (Gas Sponsored)",
          description: `Your profile was created with sponsored gas. Welcome aboard!`,
        });
      } else {
        toast({
          title: "Profile Creation",
          description: sponsorshipCheck.reason,
          variant: sponsorshipCheck.eligible ? "default" : "destructive"
        });
        
        throw new Error('Profile creation sponsorship not available');
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      toast({
        title: "Profile Creation Failed",
        description: error.message,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, options, toast]);

  return {
    createProfile,
    isLoading,
    txHash,
    error,
    isSuccess: !!txHash,
  };
};

// Enhanced hook to check gas sponsorship eligibility with detailed info
export const useGasSponsorshipInfo = () => {
  const { address } = useAccount();
  const [userLevel, setUserLevel] = useState<keyof typeof USER_LEVELS>('NEW');
  const [userStats, setUserStats] = useState({
    transactionCount: 0,
    accountAge: 0,
    totalContributed: 0n,
    chamasJoined: 0,
    reputationScore: 0,
    referrals: 0,
    dailyTransactions: 0,
    weeklyTransactions: 0,
    monthlyTransactions: 0
  });
  
  useEffect(() => {
    const loadUserStats = async () => {
      if (!address) return;
      
      // In a real app, you'd fetch this from your backend/blockchain
      // For now, we'll use localStorage as a mock
      const storedStats = localStorage.getItem(`user-stats-${address}`);
      
      if (storedStats) {
        const stats = JSON.parse(storedStats);
        setUserStats({
          ...stats,
          totalContributed: BigInt(stats.totalContributed || 0)
        });
        
        // Determine user level based on stats
        const level = getUserLevel(stats);
        setUserLevel(level);
      } else {
        // New user - set default stats
        const newUserStats = {
          transactionCount: 0,
          accountAge: 0,
          totalContributed: 0n,
          chamasJoined: 0,
          reputationScore: 0,
          referrals: 0,
          dailyTransactions: 0,
          weeklyTransactions: 0,
          monthlyTransactions: 0
        };
        
        setUserStats(newUserStats);
        setUserLevel('NEW');
        
        // Store initial stats
        localStorage.setItem(`user-stats-${address}`, JSON.stringify({
          ...newUserStats,
          totalContributed: '0',
          createdAt: Date.now()
        }));
      }
    };
    
    loadUserStats();
  }, [address]);

  const getEligibleOperations = () => {
    const eligible: Array<{
      operation: string;
      policy: string;
      description: string;
      costEstimate?: number;
    }> = [];
    
    // Check each policy
    Object.entries(GAS_POLICIES).forEach(([policyName, policy]) => {
      policy.operations.forEach(operation => {
        const check = shouldSponsorGas(operation, undefined, userLevel, userStats);
        if (check.eligible) {
          eligible.push({
            operation,
            policy: policyName,
            description: check.reason,
            costEstimate: check.costEstimate
          });
        }
      });
    });
    
    return eligible;
  };

  const getProgressToNextLevel = () => {
    const currentLevel = USER_LEVELS[userLevel];
    const levels = Object.keys(USER_LEVELS) as Array<keyof typeof USER_LEVELS>;
    const currentIndex = levels.indexOf(userLevel);
    
    if (currentIndex === levels.length - 1) {
      return null; // Already at highest level
    }
    
    const nextLevel = levels[currentIndex + 1];
    const nextLevelCriteria = USER_LEVELS[nextLevel].criteria;
    
    const progress = {
      nextLevel,
      requirements: {
        transactionCount: {
          current: userStats.transactionCount,
          required: nextLevelCriteria.transactionCount,
          progress: Math.min(100, (userStats.transactionCount / nextLevelCriteria.transactionCount) * 100)
        },
        accountAge: {
          current: userStats.accountAge,
          required: nextLevelCriteria.accountAge,
          progress: Math.min(100, (userStats.accountAge / nextLevelCriteria.accountAge) * 100)
        },
        totalContributed: {
          current: userStats.totalContributed,
          required: nextLevelCriteria.totalContributed,
          progress: Math.min(100, Number(userStats.totalContributed * 100n / nextLevelCriteria.totalContributed))
        },
        chamasJoined: {
          current: userStats.chamasJoined,
          required: nextLevelCriteria.chamasJoined,
          progress: Math.min(100, (userStats.chamasJoined / nextLevelCriteria.chamasJoined) * 100)
        }
      }
    };
    
    return progress;
  };

  const updateUserStats = (updates: Partial<typeof userStats>) => {
    const newStats = { ...userStats, ...updates };
    setUserStats(newStats);
    
    // Update localStorage
    localStorage.setItem(`user-stats-${address}`, JSON.stringify({
      ...newStats,
      totalContributed: newStats.totalContributed.toString()
    }));
    
    // Recalculate user level
    const newLevel = getUserLevel(newStats);
    if (newLevel !== userLevel) {
      setUserLevel(newLevel);
      
      // Show level up notification
      toast({
        title: `🎉 Level Up!`,
        description: `You've reached ${USER_LEVELS[newLevel].description}`,
      });
    }
  };

  return {
    userLevel,
    userStats,
    eligibleOperations: getEligibleOperations(),
    policies: GAS_POLICIES,
    userLevels: USER_LEVELS,
    rateLimits: RATE_LIMITS,
    progressToNextLevel: getProgressToNextLevel(),
    updateUserStats
  };
};
