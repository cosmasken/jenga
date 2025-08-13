// src/hooks/useInviteHandler.ts
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { InviteCodeGenerator } from '@/utils/inviteCodeGenerator';
import { InviteStorageService } from '@/services/inviteStorage';
import { toast } from '@/hooks/use-toast';

export interface InviteHandlerState {
  hasInviteCode: boolean;
  inviteCode: string | null;
  inviteType: 'platform' | 'chama' | null;
  chamaAddress: string | null;
  isProcessing: boolean;
  error: string | null;
}

/**
 * Hook for handling invite codes from URL parameters
 * Processes invite codes when users visit the app via invite links
 */
export function useInviteHandler() {
  const [, navigate] = useLocation();
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();
  
  const [state, setState] = useState<InviteHandlerState>({
    hasInviteCode: false,
    inviteCode: null,
    inviteType: null,
    chamaAddress: null,
    isProcessing: false,
    error: null
  });

  // Check for invite codes in URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    const chamaAddress = urlParams.get('chama');

    if (inviteCode) {
      const inviteType = InviteCodeGenerator.getInviteType(inviteCode);
      
      if (!inviteType) {
        setState(prev => ({
          ...prev,
          error: 'Invalid invite code format'
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        hasInviteCode: true,
        inviteCode,
        inviteType,
        chamaAddress,
        error: null
      }));

      // Store pending invite data (including chama address) if user is not logged in
      if (!isLoggedIn) {
        const inviteData = {
          code: inviteCode,
          chamaAddress: chamaAddress || null,
          type: inviteType
        };
        
        localStorage.setItem('sacco_pending_invite_data', JSON.stringify(inviteData));
        
        toast({
          title: '🎉 Invite Code Detected!',
          description: 'Please connect your wallet to complete the invitation.',
        });
      } else {
        // If already logged in, process immediately
        processInviteCode(inviteCode, chamaAddress, inviteType);
      }
    }
  }, []);

  // Process invite code when user logs in
  useEffect(() => {
    if (isLoggedIn && primaryWallet?.address) {
      processPendingInvite();
    }
  }, [isLoggedIn, primaryWallet?.address]);

  const processPendingInvite = async () => {
    try {
      // Get stored invite data
      const storedData = localStorage.getItem('sacco_pending_invite_data');
      if (!storedData) return;

      const inviteData = JSON.parse(storedData);
      const { code, chamaAddress, type } = inviteData;

      setState(prev => ({ ...prev, isProcessing: true }));

      await processInviteCode(code, chamaAddress, type);

      // Clear stored data
      localStorage.removeItem('sacco_pending_invite_data');

    } catch (error: any) {
      console.error('Failed to process pending invite:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to process pending invite'
      }));
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const processInviteCode = async (inviteCode: string, chamaAddress: string | null, inviteType: 'platform' | 'chama') => {
    try {
      console.log('🔄 Processing invite code:', inviteCode.slice(-6));
      
      // Record the click/usage
      if (primaryWallet?.address) {
        InviteStorageService.recordUsage(inviteCode, primaryWallet.address as Address, 'click');
      }

      // Validate the invite code
      const storedInvite = InviteStorageService.getInviteCode(inviteCode);
      
      if (!storedInvite) {
        // Code not found locally - this is expected for codes from other users
        console.log('📝 External invite code detected');
        toast({
          title: '✅ Invite Code Applied!',
          description: 'Welcome! You\'ve joined via an invite link.',
        });
      } else if (!storedInvite.isActive) {
        throw new Error('This invite code has expired or reached its usage limit');
      } else {
        // Increment usage count with real tracking
        const success = InviteStorageService.incrementUsage(inviteCode, primaryWallet?.address as Address);
        
        if (!success) {
          throw new Error('This invite code has reached its usage limit');
        }

        console.log('✅ Invite code usage incremented');
        toast({
          title: '✅ Invite Code Applied!',
          description: 'Welcome! You\'ve successfully used an invite code.',
        });
      }

      // Navigate based on invite type
      if (inviteType === 'chama' && chamaAddress) {
        console.log('🎯 Navigating to chama join page');
        // Navigate to chama join page with parameters
        navigate(`/join?chama=${chamaAddress}&invite=${inviteCode}`);
      } else {
        console.log('🏠 Navigating to dashboard');
        // Navigate to dashboard for platform invites
        navigate('/dashboard');
      }

      // Clear URL parameters from current page
      window.history.replaceState({}, document.title, window.location.pathname);

    } catch (error: any) {
      console.error('❌ Failed to process invite code:', error);
      
      toast({
        title: '❌ Invite Code Error',
        description: error.message || 'Failed to process invite code',
        variant: 'destructive'
      });
      
      throw error;
    }
  };

  const clearInviteState = () => {
    setState({
      hasInviteCode: false,
      inviteCode: null,
      inviteType: null,
      chamaAddress: null,
      isProcessing: false,
      error: null
    });
  };

  return {
    ...state,
    processPendingInvite,
    processInviteCode,
    clearInviteState
  };
}
