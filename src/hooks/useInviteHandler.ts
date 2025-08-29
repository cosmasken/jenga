import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { offchainChamaService } from '@/services/offchainChamaService';
import { toast } from '@/hooks/use-toast';

export function useInviteHandler(chamaId: string) {
  const queryClient = useQueryClient();
  const { primaryWallet } = useDynamicContext();

  // Send invites
  const sendInvitesMutation = useMutation({
    mutationFn: async (emails: string[]) => {
      if (!primaryWallet?.address) {
        throw new Error('Wallet not connected');
      }
      
      return offchainChamaService.sendInvitations(
        chamaId,
        primaryWallet.address,
        emails
      );
    },
    onSuccess: (data) => {
      toast({
        title: '📧 Invites Sent!',
        description: `Successfully sent ${data.length} invitations.`,
      });
      queryClient.invalidateQueries({ queryKey: ['chama-invites', chamaId] });
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Failed to Send Invites',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Accept invite
  const acceptInviteMutation = useMutation({
    mutationFn: async (inviteToken: string) => {
      if (!primaryWallet?.address) {
        throw new Error('Wallet not connected');
      }
      
      return offchainChamaService.acceptInvitation(inviteToken, primaryWallet.address);
    },
    onSuccess: () => {
      toast({
        title: '✅ Invite Accepted!',
        description: 'You have successfully joined the chama.',
      });
      queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Failed to Accept Invite',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    sendInvites: sendInvitesMutation.mutate,
    acceptInvite: acceptInviteMutation.mutate,
    isSendingInvites: sendInvitesMutation.isPending,
    isAcceptingInvite: acceptInviteMutation.isPending,
  };
}
