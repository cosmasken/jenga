import { useState, useCallback, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { parseEther, formatEther, type Address } from 'viem';
import { CONTRACT_ADDRESSES } from '@/config';
import { useToast } from './use-toast';
import SaccoFactoryABI from '@/abi/SaccoFactory.json';

// Types based on the contract
export interface Pool {
  id: number;
  creator: Address;
  contributionAmount: bigint;
  cycleDuration: number;
  currentCycle: number;
  totalCycles: number;
  lastPayout: number;
  state: 0 | 1 | 2; // ACTIVE = 0, COMPLETED = 1, CANCELLED = 2
  members: Address[];
  totalContributed: bigint;
  nextPayoutTime: number;
}

export interface ChamaDisplayData {
  id: number;
  name: string;
  creator: Address;
  members: number;
  maxMembers: number;
  weeklyTarget: number; // in sats
  currentPool: number; // in sats
  nextPayout: string;
  myContribution: number; // in sats
  role: 'Creator' | 'Member' | 'Non-member';
  state: 'Active' | 'Completed' | 'Cancelled';
  currentCycle: number;
  totalCycles: number;
  progress: number; // percentage
  canContribute: boolean;
  canJoin: boolean;
  contributionAmountBTC: string;
}

export const useSaccoFactory = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [pools, setPools] = useState<ChamaDisplayData[]>([]);
  const [isLoadingPools, setIsLoadingPools] = useState(false);

  // Contract read hooks
  const { data: poolCount, refetch: refetchPoolCount } = useReadContract({
    address: CONTRACT_ADDRESSES.SACCO_FACTORY as Address,
    abi: SaccoFactoryABI,
    functionName: 'poolCount',
  });

  // Contract write hooks
  const { writeContract: createPoolWrite, data: createTxHash, error: createError, isPending: isCreating } = useWriteContract();
  const { writeContract: joinPoolWrite, data: joinTxHash, error: joinError, isPending: isJoining } = useWriteContract();
  const { writeContract: contributeWrite, data: contributeTxHash, error: contributeError, isPending: isContributing } = useWriteContract();

  // Transaction confirmations
  const { isLoading: isCreateConfirming, isSuccess: createSuccess } = useWaitForTransactionReceipt({ hash: createTxHash });
  const { isLoading: isJoinConfirming, isSuccess: joinSuccess } = useWaitForTransactionReceipt({ hash: joinTxHash });
  const { isLoading: isContributeConfirming, isSuccess: contributeSuccess } = useWaitForTransactionReceipt({ hash: contributeTxHash });

  // Watch for contract events
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.SACCO_FACTORY as Address,
    abi: SaccoFactoryABI,
    eventName: 'PoolCreated',
    onLogs(logs) {
      console.log('New pool created:', logs);
      loadPools(); // Refresh pools when new one is created
      toast({
        title: "🎉 New Chama Created!",
        description: "A new savings circle has been created in the community.",
      });
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.SACCO_FACTORY as Address,
    abi: SaccoFactoryABI,
    eventName: 'MemberJoined',
    onLogs(logs) {
      console.log('Member joined:', logs);
      loadPools(); // Refresh pools when someone joins
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.SACCO_FACTORY as Address,
    abi: SaccoFactoryABI,
    eventName: 'WinnerSelected',
    onLogs(logs) {
      console.log('Winner selected:', logs);
      loadPools(); // Refresh pools when payout happens
      toast({
        title: "🎊 Payout Distributed!",
        description: "A chama member has received their payout.",
      });
    },
  });

  // Load individual pool data
  const loadPoolData = useCallback(async (poolId: number): Promise<ChamaDisplayData | null> => {
    try {
      // Get basic pool info
      const poolData = await useReadContract({
        address: CONTRACT_ADDRESSES.SACCO_FACTORY as Address,
        abi: SaccoFactoryABI,
        functionName: 'pools',
        args: [poolId],
      });

      if (!poolData) return null;

      const [creator, contributionAmount, cycleDuration, currentCycle, totalCycles, lastPayout, state] = poolData as any[];

      // Calculate derived data
      const contributionAmountBTC = formatEther(contributionAmount);
      const weeklyTargetSats = Math.round(parseFloat(contributionAmountBTC) * 100000000);
      const nextPayoutTime = lastPayout + cycleDuration;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilPayout = Math.max(0, nextPayoutTime - now);
      
      // Format time until payout
      const formatTimeUntilPayout = (seconds: number): string => {
        if (seconds === 0) return "Ready for payout";
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
      };

      // Determine user's role and status
      let role: 'Creator' | 'Member' | 'Non-member' = 'Non-member';
      let myContribution = 0;
      let canContribute = false;
      let canJoin = false;

      if (address) {
        if (creator.toLowerCase() === address.toLowerCase()) {
          role = 'Creator';
          canContribute = state === 0; // Can contribute if pool is active
        } else {
          // Check if user is a member (this would require additional contract calls or indexing)
          // For now, we'll assume non-members can join if pool is active
          canJoin = state === 0;
        }
      }

      const chamaData: ChamaDisplayData = {
        id: poolId,
        name: `Savings Circle #${poolId}`,
        creator,
        members: 1, // Would need to track this separately or in contract
        maxMembers: totalCycles, // Assuming max members = total cycles
        weeklyTarget: weeklyTargetSats,
        currentPool: weeklyTargetSats * currentCycle, // Rough estimate
        nextPayout: formatTimeUntilPayout(timeUntilPayout),
        myContribution,
        role,
        state: state === 0 ? 'Active' : state === 1 ? 'Completed' : 'Cancelled',
        currentCycle,
        totalCycles,
        progress: totalCycles > 0 ? (currentCycle / totalCycles) * 100 : 0,
        canContribute,
        canJoin,
        contributionAmountBTC
      };

      return chamaData;
    } catch (error) {
      console.error(`Error loading pool ${poolId}:`, error);
      return null;
    }
  }, [address]);

  // Load all pools
  const loadPools = useCallback(async () => {
    if (!isConnected || !poolCount) return;
    
    setIsLoadingPools(true);
    try {
      const count = Number(poolCount);
      const poolPromises = [];
      
      for (let i = 0; i < count; i++) {
        poolPromises.push(loadPoolData(i));
      }
      
      const poolsData = await Promise.all(poolPromises);
      const validPools = poolsData.filter((pool): pool is ChamaDisplayData => pool !== null);
      
      setPools(validPools);
    } catch (error) {
      console.error('Error loading pools:', error);
      toast({
        title: "Error Loading Chamas",
        description: "Failed to load savings circles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPools(false);
    }
  }, [isConnected, poolCount, loadPoolData, toast]);

  // Create new pool
  const createPool = useCallback(async (
    contributionBTC: string,
    cycleDurationDays: number,
    totalCycles: number,
    initialMembers: Address[] = []
  ) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const contributionWei = parseEther(contributionBTC);
      const cycleDurationSeconds = cycleDurationDays * 24 * 60 * 60;

      createPoolWrite({
        address: CONTRACT_ADDRESSES.SACCO_FACTORY as Address,
        abi: SaccoFactoryABI,
        functionName: 'createPool',
        args: [contributionWei, cycleDurationSeconds, totalCycles, initialMembers],
      });

    } catch (error) {
      console.error('Error creating pool:', error);
      throw error;
    }
  }, [isConnected, createPoolWrite]);

  // Join existing pool
  const joinPool = useCallback(async (poolId: number) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get pool info to determine contribution amount
      const pool = pools.find(p => p.id === poolId);
      if (!pool) {
        throw new Error('Pool not found');
      }

      joinPoolWrite({
        address: CONTRACT_ADDRESSES.SACCO_FACTORY as Address,
        abi: SaccoFactoryABI,
        functionName: 'joinPool',
        args: [poolId],
        value: parseEther(pool.contributionAmountBTC),
      });

    } catch (error) {
      console.error('Error joining pool:', error);
      throw error;
    }
  }, [isConnected, joinPoolWrite, pools]);

  // Contribute to cycle
  const contributeToCycle = useCallback(async (poolId: number) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get pool info to determine contribution amount
      const pool = pools.find(p => p.id === poolId);
      if (!pool) {
        throw new Error('Pool not found');
      }

      contributeWrite({
        address: CONTRACT_ADDRESSES.SACCO_FACTORY as Address,
        abi: SaccoFactoryABI,
        functionName: 'contributeToCycle',
        args: [poolId],
        value: parseEther(pool.contributionAmountBTC),
      });

    } catch (error) {
      console.error('Error contributing to cycle:', error);
      throw error;
    }
  }, [isConnected, contributeWrite, pools]);

  // Load pools when component mounts or dependencies change
  useEffect(() => {
    loadPools();
  }, [loadPools]);

  // Handle transaction successes
  useEffect(() => {
    if (createSuccess) {
      toast({
        title: "🎉 Chama Created Successfully!",
        description: "Your savings circle has been created on Citrea.",
      });
      refetchPoolCount();
      loadPools();
    }
  }, [createSuccess, toast, refetchPoolCount, loadPools]);

  useEffect(() => {
    if (joinSuccess) {
      toast({
        title: "🎉 Successfully Joined Chama!",
        description: "You're now part of the savings circle.",
      });
      loadPools();
    }
  }, [joinSuccess, toast, loadPools]);

  useEffect(() => {
    if (contributeSuccess) {
      toast({
        title: "🎉 Contribution Successful!",
        description: "Your contribution has been recorded.",
      });
      loadPools();
    }
  }, [contributeSuccess, toast, loadPools]);

  // Handle errors
  useEffect(() => {
    if (createError) {
      toast({
        title: "Failed to Create Chama",
        description: createError.message,
        variant: "destructive"
      });
    }
  }, [createError, toast]);

  useEffect(() => {
    if (joinError) {
      toast({
        title: "Failed to Join Chama",
        description: joinError.message,
        variant: "destructive"
      });
    }
  }, [joinError, toast]);

  useEffect(() => {
    if (contributeError) {
      toast({
        title: "Failed to Contribute",
        description: contributeError.message,
        variant: "destructive"
      });
    }
  }, [contributeError, toast]);

  return {
    // Data
    pools,
    poolCount: Number(poolCount || 0),
    
    // Loading states
    isLoadingPools,
    isCreating: isCreating || isCreateConfirming,
    isJoining: isJoining || isJoinConfirming,
    isContributing: isContributing || isContributeConfirming,
    
    // Actions
    createPool,
    joinPool,
    contributeToCycle,
    refreshPools: loadPools,
    
    // Transaction hashes
    createTxHash,
    joinTxHash,
    contributeTxHash,
    
    // Success states
    createSuccess,
    joinSuccess,
    contributeSuccess,
    
    // Connection
    isConnected
  };
};
