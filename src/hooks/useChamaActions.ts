import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { offchainChamaService } from '@/services/offchainChamaService';
import { useRosca } from '@/hooks/useRosca';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import type { Address } from 'viem';

export function useChamaActions(chamaId: string) {
  const queryClient = useQueryClient();
  const { primaryWallet } = useDynamicContext();
  const roscaHook = useRosca();

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
    mutationKey: ['contribute', chamaId, primaryWallet?.address],
    mutationFn: async ({ userAddress, amount }: { userAddress: string; amount: string }) => {
      console.log('🚀 Recording contribution:', { chamaId, userAddress, amount });
      
      const chama = await offchainChamaService.getChama(chamaId);
      if (!chama?.chain_address) {
        throw new Error('Chama not deployed to blockchain');
      }
      
      // Contribute using useRosca hook
      const txHash = await roscaHook.contribute(chama.chain_address);
      
      if (!txHash) throw new Error('Failed to contribute');
      
      // Record contribution off-chain
      const currentRound = await offchainChamaService.getCurrentRound(chama.id);
      if (currentRound) {
        await offchainChamaService.recordContribution(chama.id, currentRound.id, userAddress, amount);
      }
      
      return { txHash };
    },
    onSuccess: (data) => {
      console.log('✅ Successfully recorded contribution:', data);
      toast({
        title: '💰 Contribution Recorded!',
        description: 'Your contribution has been recorded successfully.',
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['chama-offchain', chamaId] });
        queryClient.invalidateQueries({ queryKey: ['current-round', chamaId] });
      }, 500);
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

  // Manual status transition for creators
  const transitionStatusMutation = useMutation({
    mutationFn: async ({ newStatus, metadata }: { newStatus: any; metadata?: any }) => {
      if (!primaryWallet?.address) {
        throw new Error('Wallet not connected');
      }
      console.log('🚀 Transitioning chama status:', { chamaId, newStatus, metadata });
      return offchainChamaService.transitionChamaStatus(chamaId, primaryWallet.address, newStatus, metadata);
    },
    onSuccess: (data) => {
      console.log('✅ Successfully transitioned chama status:', data);
      toast({
        title: '✅ Status Transitioned!',
        description: 'Chama status has been updated successfully.',
      });
      invalidateQueries();
    },
    onError: (error: Error) => {
      console.error('❌ Failed to transition status:', error);
      toast({
        title: '❌ Status Transition Failed',
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
      
      // Get chama data first
      const chama = await offchainChamaService.getChama(chamaId);
      if (!chama) throw new Error('Chama not found');
      
      // Verify creator
      if (chama.creator_address !== primaryWallet.address) {
        throw new Error('Only creator can deploy chama to chain');
      }
      
      // Verify chama is ready for deployment
      if (chama.status !== 'waiting' && chama.status !== 'recruiting') {
        throw new Error('Chama must be in waiting or recruiting status to deploy');
      }
      
      // Check if already deployed
      if (chama.chain_address) {
        throw new Error('Chama is already deployed to blockchain');
      }
      
      // Deploy using useRosca hook directly
      const txHash = await roscaHook.createNativeROSCA(
        String(chama.contribution_amount),
        chama.round_duration_hours * 3600,
        chama.member_target,
        chama.name
      );
      
      if (!txHash) throw new Error('Failed to create ROSCA on blockchain');
      
      // Extract ROSCA address from transaction receipt
      const chainAddress = await roscaHook.extractROSCAAddressFromReceipt(txHash);
      
      if (!chainAddress) {
        throw new Error('Failed to extract ROSCA address from transaction');
      }
      
      // Update chama with chain details
      const { error: updateError } = await supabase
        .from('chamas')
        .update({
          chain_address: chainAddress,
          chain_tx_hash: txHash,
          chain_deployed_at: new Date().toISOString(),
          status: 'registered',
          chain_status: 0,
        })
        .eq('id', chamaId);
      
      if (updateError) {
        throw new Error('Deployed to chain but failed to update database');
      }
      
      return { txHash, chainAddress };
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

  // Pay deposit for registered chama
  const payDepositMutation = useMutation({
    mutationKey: ['pay-deposit', chamaId, primaryWallet?.address],
    mutationFn: async () => {
      if (!primaryWallet?.address) {
        throw new Error('Wallet not connected');
      }
      
      console.log('💰 Paying deposit for chama:', chamaId);
      
      const chama = await offchainChamaService.getChama(chamaId);
      if (!chama?.chain_address) {
        throw new Error('Chama not deployed to blockchain');
      }
      
      // Pay deposit using useRosca hook
      const txHash = await roscaHook.joinROSCA(chama.chain_address);
      
      if (!txHash) throw new Error('Failed to pay deposit');
      
      // Update member status using correct filter - try both possible address fields
      const { error } = await supabase
        .from('chama_members')
        .update({ 
          status: 'confirmed', 
          deposit_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('chama_id', chama.id)
        .or(`member_address.eq.${primaryWallet.address},user_address.eq.${primaryWallet.address}`);
      
      if (error) {
        console.warn('Failed to update member status:', error);
        // Don't throw - deposit was successful
      }
      
      return { txHash };
    },
    onSuccess: (data) => {
      console.log('✅ Successfully paid deposit:', data);
      toast({
        title: '💰 Deposit Paid!',
        description: 'Your deposit has been paid successfully.',
      });
      // Invalidate all relevant queries to refresh UI
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
        queryClient.invalidateQueries({ queryKey: ['user-membership', chamaId, primaryWallet?.address] });
        queryClient.invalidateQueries({ queryKey: ['chama-offchain', chamaId] });
        queryClient.invalidateQueries({ queryKey: ['hybrid-chama-data', chamaId] });
        queryClient.invalidateQueries({ queryKey: ['user-context', chamaId, primaryWallet?.address] });
      }, 500);
    },
    onError: (error: Error) => {
      console.error('❌ Failed to pay deposit:', error);
      toast({
        title: '❌ Deposit Payment Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
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
    transitionStatus: transitionStatusMutation.mutate,
    createChama: createChamaMutation.mutate,
    deployToChain: deployToChainMutation.mutate,
    payDeposit: payDepositMutation.mutate,
    
    // Loading states
    isJoining: joinMutation.isPending,
    isContributing: contributeMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isTransitioningStatus: transitionStatusMutation.isPending,
    isCreatingChama: createChamaMutation.isPending,
    isDeployingToChain: deployToChainMutation.isPending,
    isPayingDeposit: payDepositMutation.isPending,

    // Manual refresh
    refresh: invalidateQueries,
  };
}
