import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { 
  useCreateProfile,
  useCreateStackingGoal,
  useMakeDeposit,
  useCreatePool,
  useJoinPool,
  useContributeToCycle,
  useGetProfile,
  useGetStackingGoal,
  useGetPoolCount,
  useGetPool
} from './useWagmiContracts';
import { formatUnits } from 'viem';

export const useJengaProfile = () => {
  const { address, isConnected } = useAccount();
  const { createProfile, isLoading: isCreating, isSuccess: createSuccess } = useCreateProfile();
  const { data: profileData, isLoading: isLoadingProfile, refetch } = useGetProfile(address || '0x0');

  const createUserProfile = useCallback(async (username: string) => {
    if (!isConnected) return;
    await createProfile(username);
  }, [createProfile, isConnected]);

  // Refetch profile when creation is successful
  useEffect(() => {
    if (createSuccess) {
      refetch();
    }
  }, [createSuccess, refetch]);

  return {
    profile: profileData,
    isLoading: isLoadingProfile || isCreating,
    createProfile: createUserProfile,
    refreshProfile: refetch,
    isConnected
  };
};

export const useStackingVault = () => {
  const { address, isConnected } = useAccount();
  const { createGoal, isLoading: isCreatingGoal, isSuccess: goalSuccess } = useCreateStackingGoal();
  const { deposit, isLoading: isDepositing, isSuccess: depositSuccess } = useMakeDeposit();
  const { data: stackingGoalData, isLoading: isLoadingGoal, refetch } = useGetStackingGoal(address || '0x0');

  const createStackingGoalHandler = useCallback(async (dailyAmount: string) => {
    if (!isConnected) return;
    await createGoal(dailyAmount);
  }, [createGoal, isConnected]);

  const makeDepositHandler = useCallback(async (amount: string) => {
    if (!isConnected) return;
    await deposit(amount);
  }, [deposit, isConnected]);

  // Refetch goal when operations are successful
  useEffect(() => {
    if (goalSuccess || depositSuccess) {
      refetch();
    }
  }, [goalSuccess, depositSuccess, refetch]);

  return {
    stackingGoal: stackingGoalData,
    isLoading: isLoadingGoal || isCreatingGoal || isDepositing,
    createGoal: createStackingGoalHandler,
    deposit: makeDepositHandler,
    refreshGoal: refetch,
    isConnected
  };
};

export const useSaccoFactory = () => {
  const { address, isConnected } = useAccount();
  const [pools, setPools] = useState<any[]>([]);
  const [isLoadingPools, setIsLoadingPools] = useState(false);
  
  const { createPool, isLoading: isCreatingPool, isSuccess: createSuccess } = useCreatePool();
  const { joinPool, isLoading: isJoining, isSuccess: joinSuccess } = useJoinPool();
  const { contribute, isLoading: isContributing, isSuccess: contributeSuccess } = useContributeToCycle();
  const { data: poolCount, refetch: refetchPoolCount } = useGetPoolCount();

  const loadPools = useCallback(async () => {
    if (!isConnected || !poolCount) return;
    
    setIsLoadingPools(true);
    try {
      const poolsData = [];
      const count = Number(poolCount);
      
      for (let i = 0; i < count; i++) {
        // You would need to implement useGetPool hook or fetch pool data here
        // For now, we'll create a placeholder structure
        poolsData.push({
          id: i,
          contributionAmount: '0',
          members: []
        });
      }
      
      setPools(poolsData);
    } catch (error) {
      console.error('Error loading pools:', error);
    } finally {
      setIsLoadingPools(false);
    }
  }, [isConnected, poolCount]);

  const createSaccoPool = useCallback(async (
    contribution: string,
    cycleDuration: number,
    totalCycles: number,
    initialMembers: string[] = []
  ) => {
    if (!isConnected) return;
    await createPool(contribution, cycleDuration, totalCycles, initialMembers);
  }, [createPool, isConnected]);

  const joinSaccoPool = useCallback(async (poolId: number, amount: string) => {
    if (!isConnected) return;
    await joinPool(poolId, amount);
  }, [joinPool, isConnected]);

  const contributeToPool = useCallback(async (poolId: number, amount: string) => {
    if (!isConnected) return;
    await contribute(poolId, amount);
  }, [contribute, isConnected]);

  // Refetch pools when operations are successful
  useEffect(() => {
    if (createSuccess || joinSuccess || contributeSuccess) {
      refetchPoolCount();
      loadPools();
    }
  }, [createSuccess, joinSuccess, contributeSuccess, refetchPoolCount, loadPools]);

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  return {
    pools,
    isLoading: isLoadingPools || isCreatingPool || isJoining || isContributing,
    createPool: createSaccoPool,
    joinPool: joinSaccoPool,
    contribute: contributeToPool,
    refreshPools: loadPools,
    isConnected
  };
};

// Utility hook to get formatted stacking data
export const useFormattedStackingData = () => {
  const { stackingGoal } = useStackingVault();
  
  const formattedData = {
    dailyGoalSats: stackingGoal ? parseFloat(formatUnits(BigInt(stackingGoal.dailyAmount || 0), 18)) * 100000000 : 0,
    totalStackedSats: stackingGoal ? parseFloat(formatUnits(BigInt(stackingGoal.totalStacked || 0), 18)) * 100000000 : 0,
    streakDays: stackingGoal ? Number(stackingGoal.streakDays || 0) : 0,
    lastDeposit: stackingGoal ? Number(stackingGoal.lastDeposit || 0) : 0
  };

  return formattedData;
};
