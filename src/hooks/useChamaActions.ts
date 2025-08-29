import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { offchainChamaService } from '@/services/offchainChamaService';
import { blockchainService } from '@/services/blockchainService';
import { toast } from '@/hooks/use-toast';
import type { Address } from 'viem';

export function useChamaActions(chamaId: string) {
  const queryClient = useQueryClient();
  const { primaryWallet } = useDynamicContext();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['chama-offchain', chamaId] });
    queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
    queryClient.invalidateQueries({ queryKey: ['current-round', chamaId] });
  };

  // Join chama (off-chain first)
  const joinMutation = useMutation({
    mutationFn: async (userAddress: string) => {
      console.log('🚀 Joining chama:', chamaId, 'with address:', userAddress);
      return offchainChamaService.addMember(chamaId, userAddress, 'direct_join');
    },
    onSuccess: (data) => {
      console.log('✅ Successfully joined chama:', data);
      toast({
        title: '✅ Joined Successfully!',
        description: 'You have joined the chama. Deposit payment is pending.',
      });
      invalidateQueries();
    },
    onError: (error: Error) => {
      console.error('❌ Failed to join chama:', error);
      toast({
        title: '❌ Failed to Join',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Record contribution (off-chain first)
  const contributeMutation = useMutation({
    mutationFn: async ({ userAddress, amount }: { userAddress: string; amount: string }) => {
      console.log('🚀 Recording contribution:', { chamaId, userAddress, amount });
      
      const currentRound = await offchainChamaService.getCurrentRound(chamaId);
      if (!currentRound) {
        throw new Error('No active round found');
      }
      
      return offchainChamaService.recordContribution(chamaId, currentRound.id, userAddress, amount);
    },
    onSuccess: (data) => {
      console.log('✅ Successfully recorded contribution:', data);
      toast({
        title: '💰 Contribution Recorded!',
        description: 'Your contribution has been recorded. Chain confirmation pending.',
      });
      invalidateQueries();
    },
    onError: (error: Error) => {
      console.error('❌ Failed to record contribution:', error);
      toast({
        title: '❌ Contribution Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update chama status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, metadata }: { status: any; metadata?: any }) => {
      console.log('🚀 Updating chama status:', { chamaId, status, metadata });
      return offchainChamaService.updateChamaStatus(chamaId, status, metadata);
    },
    onSuccess: (data) => {
      console.log('✅ Successfully updated chama status:', data);
      toast({
        title: '✅ Status Updated!',
        description: 'Chama status has been updated successfully.',
      });
      invalidateQueries();
    },
    onError: (error: Error) => {
      console.error('❌ Failed to update status:', error);
      toast({
        title: '❌ Status Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Deploy chama to blockchain
  const deployToChainMutation = useMutation({
    mutationFn: async () => {
      if (!primaryWallet?.address) {
        throw new Error('Wallet not connected');
      }
      
      console.log('🚀 Deploying chama to blockchain:', chamaId);
      return offchainChamaService.deployToChain(
        chamaId,
        primaryWallet.address,
        blockchainService
      );
    },
    onSuccess: (data) => {
      console.log('✅ Successfully deployed chama to blockchain:', data);
      toast({
        title: '🚀 Deployed to Blockchain!',
        description: `Chama deployed successfully! Address: ${data.chainAddress.slice(0, 8)}...`,
      });
      invalidateQueries();
      // Also invalidate user chamas list
      queryClient.invalidateQueries({ queryKey: ['user-chamas'] });
    },
    onError: (error: Error) => {
      console.error('❌ Failed to deploy chama:', error);
      toast({
        title: '❌ Deployment Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create new chama
  const createChamaMutation = useMutation({
    mutationFn: async ({ userAddress, data }: { userAddress: string; data: any }) => {
      console.log('🚀 Creating new chama:', data);
      return offchainChamaService.createChama(userAddress, data);
    },
    onSuccess: (data) => {
      console.log('✅ Successfully created chama:', data);
      toast({
        title: '🎉 Chama Created!',
        description: `Your chama "${data.name}" has been created successfully.`,
      });
      // Invalidate user chamas query
      queryClient.invalidateQueries({ queryKey: ['user-chamas'] });
    },
    onError: (error: Error) => {
      console.error('❌ Failed to create chama:', error);
      toast({
        title: '❌ Failed to Create Chama',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    // Actions
    join: joinMutation.mutate,
    contribute: contributeMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    createChama: createChamaMutation.mutate,
    deployToChain: deployToChainMutation.mutate,
    
    // Loading states
    isJoining: joinMutation.isPending,
    isContributing: contributeMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isCreatingChama: createChamaMutation.isPending,
    isDeployingToChain: deployToChainMutation.isPending,

    // Manual refresh
    refresh: invalidateQueries,
  };
}
