import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESSES } from '@/config';
import { useToast } from './use-toast';
import { useState } from 'react';

// Import ABIs
import SaccoFactoryABI from '@/abi/SaccoFactory.json';
import JengaRegistryABI from '@/abi/JengaRegistry.json';
import StackingVaultABI from '@/abi/StackingVault.json';

export const useCreatePool = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createPool = async (
    contribution: string,
    cycleDuration: number,
    totalCycles: number,
    initialMembers: string[] = []
  ) => {
    setIsLoading(true);
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.SACCO_FACTORY as `0x${string}`,
        abi: SaccoFactoryABI,
        functionName: 'createPool',
        args: [
          parseEther(contribution),
          cycleDuration,
          totalCycles,
          initialMembers
        ],
      });
    } catch (error) {
      console.error('Error creating pool:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create chama. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPool,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    hash,
    error
  };
};

export const useJoinPool = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const joinPool = async (poolId: number, amount: string) => {
    setIsLoading(true);
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.SACCO_FACTORY as `0x${string}`,
        abi: SaccoFactoryABI,
        functionName: 'joinPool',
        args: [poolId],
        value: parseEther(amount),
      });
    } catch (error) {
      console.error('Error joining pool:', error);
      toast({
        title: "Join Failed",
        description: "Failed to join chama. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    joinPool,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    hash,
    error
  };
};

export const useContributeToCycle = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const contribute = async (poolId: number, amount: string) => {
    setIsLoading(true);
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.SACCO_FACTORY as `0x${string}`,
        abi: SaccoFactoryABI,
        functionName: 'contributeToCycle',
        args: [poolId],
        value: parseEther(amount),
      });
    } catch (error) {
      console.error('Error contributing:', error);
      toast({
        title: "Contribution Failed",
        description: "Failed to contribute. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    contribute,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    hash,
    error
  };
};

export const useCreateProfile = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createProfile = async (username: string) => {
    setIsLoading(true);
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.JENGA_REGISTRY as `0x${string}`,
        abi: JengaRegistryABI,
        functionName: 'createProfile',
        args: [username],
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Profile Creation Failed",
        description: "Failed to create profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createProfile,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    hash,
    error
  };
};

export const useCreateStackingGoal = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createGoal = async (dailyAmount: string) => {
    setIsLoading(true);
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.STACKING_VAULT as `0x${string}`,
        abi: StackingVaultABI,
        functionName: 'createStackingGoal',
        args: [parseEther(dailyAmount)],
      });
    } catch (error) {
      console.error('Error creating stacking goal:', error);
      toast({
        title: "Goal Creation Failed",
        description: "Failed to create stacking goal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createGoal,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    hash,
    error
  };
};

export const useMakeDeposit = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deposit = async (amount: string) => {
    setIsLoading(true);
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.STACKING_VAULT as `0x${string}`,
        abi: StackingVaultABI,
        functionName: 'makeDeposit',
        args: [],
        value: parseEther(amount),
      });
    } catch (error) {
      console.error('Error making deposit:', error);
      toast({
        title: "Deposit Failed",
        description: "Failed to make deposit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deposit,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    hash,
    error
  };
};

// Read hooks
export const useGetProfile = (address: string) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.JENGA_REGISTRY as `0x${string}`,
    abi: JengaRegistryABI,
    functionName: 'profiles',
    args: [address],
  });
};

export const useGetStackingGoal = (address: string) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.STACKING_VAULT as `0x${string}`,
    abi: StackingVaultABI,
    functionName: 'goals',
    args: [address],
  });
};

export const useGetPoolCount = () => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SACCO_FACTORY as `0x${string}`,
    abi: SaccoFactoryABI,
    functionName: 'poolCount',
  });
};

export const useGetPool = (poolId: number) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SACCO_FACTORY as `0x${string}`,
    abi: SaccoFactoryABI,
    functionName: 'pools',
    args: [poolId],
  });
};
