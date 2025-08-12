import { useState, useEffect, useCallback } from 'react';
import { type Address } from 'viem';
import { type ChamaData, type UIStateConfig } from '@/types/chama';
import { useRosca } from '@/hooks/useRosca';
import { chamaStateManager } from '@/services/chamaStateManager';
import { FACTORY_ADDRESS } from '@/utils/constants';
import { toast } from '@/hooks/use-toast';

export function useChamaStateIntegrated(chamaAddress: Address, userAddress: Address | null) {
  const [chamaData, setChamaData] = useState<ChamaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, isLate: false });
  
  // Use the existing rosca hook
  const roscaHook = useRosca(FACTORY_ADDRESS);

  // Load chama data using the state manager
  const loadChamaData = useCallback(async () => {
    if (!chamaAddress) return;
    
    setIsLoading(true);
    try {
      const data = await chamaStateManager.getChamaData(chamaAddress, userAddress, roscaHook);
      setChamaData(data);
    } catch (error) {
      console.error('Failed to load chama data:', error);
      toast({
        title: "Error loading chama data",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [chamaAddress, userAddress, roscaHook]);

  // Update countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      if (!chamaData || !chamaData.rounds[chamaData.currentRound - 1]) return;
      
      const deadline = chamaData.rounds[chamaData.currentRound - 1].deadline;
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setCountdown({
        days: Math.max(0, days),
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
        isLate: diff < (30 * 60 * 1000), // Less than 30 minutes
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [chamaData]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadChamaData();
  }, [loadChamaData]);

  // Action handlers that integrate with useRosca
  const handleContribute = useCallback(async () => {
    if (!chamaData || !userAddress) return;

    try {
      // Use the real rosca hook function
      await roscaHook.contribute(chamaAddress);
      
      // Update state using state manager
      const updatedData = await chamaStateManager.handleActionResult(
        'contribute',
        chamaAddress,
        userAddress,
        roscaHook
      );
      setChamaData(updatedData);
      
      toast({
        title: "💸 Contribution sent!",
        description: `${chamaData.contributionAmount} ${chamaData.token} contributed successfully`,
      });
    } catch (error) {
      toast({
        title: "❌ Contribution failed",
        description: roscaHook.error || "Please try again",
        variant: "destructive",
      });
    }
  }, [chamaData, userAddress, chamaAddress, roscaHook]);

  const handleJoinChama = useCallback(async () => {
    if (!chamaData || !userAddress) return;

    try {
      // Use the real rosca hook function
      await roscaHook.join(chamaAddress);
      
      // Update state using state manager
      const updatedData = await chamaStateManager.handleActionResult(
        'join',
        chamaAddress,
        userAddress,
        roscaHook
      );
      setChamaData(updatedData);
      
      toast({
        title: "🎉 Joined successfully!",
        description: "Welcome to the savings circle",
      });
    } catch (error) {
      toast({
        title: "❌ Failed to join",
        description: roscaHook.error || "Please try again",
        variant: "destructive",
      });
    }
  }, [chamaData, userAddress, chamaAddress, roscaHook]);

  const handleLeaveAndWithdraw = useCallback(async () => {
    if (!chamaData || !userAddress) return;

    try {
      // Use the real rosca hook function for leave
      await roscaHook.leave(chamaAddress);
      
      toast({
        title: "✅ Withdrawal successful",
        description: `${chamaData.securityDeposit} ${chamaData.token} security deposit returned`,
      });
      
      // Refresh data
      await loadChamaData();
    } catch (error) {
      toast({
        title: "❌ Withdrawal failed", 
        description: roscaHook.error || "Please try again",
        variant: "destructive",
      });
    }
  }, [chamaData, userAddress, chamaAddress, roscaHook, loadChamaData]);

  const handleResolveDispute = useCallback(async () => {
    if (!chamaData || !userAddress) return;

    try {
      // TODO: Add dispute resolution function to useRosca hook
      // For now, we'll just show a toast and refresh data
      toast({
        title: "⚖️ Dispute resolution",
        description: "Dispute resolution functionality will be implemented in a future update",
      });
      
      // Refresh data
      await loadChamaData();
    } catch (error) {
      toast({
        title: "❌ Failed to resolve dispute",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [chamaData, userAddress, loadChamaData]);

  const handleCopyInviteLink = useCallback(async () => {
    if (!chamaData) return;

    const inviteLink = `${window.location.origin}/join?address=${chamaData.address}`;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({
        title: "📋 Link copied!",
        description: "Invite link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "❌ Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  }, [chamaData]);

  // Generate UI configuration based on current state
  const getUIConfig = useCallback((): UIStateConfig | null => {
    if (!chamaData) return null;

    const { state, userHasJoined, userIsCreator, userContributedCurrentRound, 
            currentMemberCount, memberTarget, hasDispute, userBalance, 
            contributionAmount, token } = chamaData;

    switch (state) {
      case 'PRE_LAUNCH':
        return {
          title: "Waiting for friends…",
          description: `Share this invite link so others can join. Once ${memberTarget} members join, the first round will begin.`,
          primaryCTA: {
            text: "Share Invite Link",
            color: "bg-sky-500 hover:bg-sky-600",
            disabled: false,
            action: handleCopyInviteLink,
          },
          showCountdown: false,
          showMemberList: true,
          showProgressBar: true,
        };

      case 'ROUND_OPEN':
        const isLate = countdown.isLate;
        const contributionText = isLate 
          ? `Contribute ${contributionAmount} ${token} (late fee)`
          : `Contribute ${contributionAmount} ${token}`;
        
        return {
          title: `Round ${chamaData.currentRound} / ${chamaData.totalRounds}`,
          description: "Contribution window is open",
          primaryCTA: {
            text: userContributedCurrentRound ? "✔ Contributed" : contributionText,
            color: userContributedCurrentRound 
              ? "bg-green-600" 
              : isLate 
                ? "bg-amber-500 hover:bg-amber-600" 
                : "bg-sky-500 hover:bg-sky-600",
            disabled: userContributedCurrentRound || roscaHook.isLoading,
            action: handleContribute,
          },
          showCountdown: true,
          showMemberList: true,
          showProgressBar: true,
        };

      case 'ROUND_COMPLETE':
        return {
          title: "🎉 Round complete!",
          description: "Winner received the pot. Next round starts soon…",
          primaryCTA: {
            text: "Next Round Starting...",
            color: "bg-emerald-500",
            disabled: true,
            action: () => {},
          },
          banner: {
            type: 'success',
            message: "🎉 Round complete! Winner received the pot.",
          },
          showCountdown: false,
          showMemberList: true,
          showProgressBar: true,
        };

      case 'ALL_ROUNDS_FINISHED':
        return {
          title: "Circle finished",
          description: "Everyone has received their payout. You can now leave and reclaim your security deposit.",
          primaryCTA: {
            text: "Leave & Withdraw Deposit",
            color: "bg-emerald-600 hover:bg-emerald-700",
            disabled: hasDispute,
            action: handleLeaveAndWithdraw,
          },
          banner: hasDispute ? {
            type: 'error',
            message: "⚠️ Cannot withdraw while dispute is active",
          } : undefined,
          showCountdown: false,
          showMemberList: true,
          showProgressBar: false,
        };

      case 'DISPUTE_ACTIVE':
        return {
          title: "Dispute in Progress",
          description: "All contributions and payouts are paused until the dispute is resolved.",
          primaryCTA: {
            text: "All Actions Disabled",
            color: "bg-gray-500",
            disabled: true,
            action: () => {},
          },
          secondaryCTA: userIsCreator ? {
            text: "Resolve Dispute",
            color: "bg-red-600 hover:bg-red-700",
            disabled: false,
            action: handleResolveDispute,
          } : undefined,
          banner: {
            type: 'error',
            message: "⚠️ A dispute is in progress.",
          },
          showCountdown: false,
          showMemberList: true,
          showProgressBar: false,
        };

      case 'MEMBER_EMPTY_STATES':
        if (!userHasJoined) {
          return {
            title: "Join the Circle",
            description: "Ready to join this savings circle?",
            primaryCTA: {
              text: roscaHook.isLoading ? "Joining..." : "Join Circle",
              color: "bg-sky-500 hover:bg-sky-600",
              disabled: roscaHook.isLoading,
              action: handleJoinChama,
            },
            showCountdown: false,
            showMemberList: false,
            showProgressBar: false,
          };
        }
        
        if (currentMemberCount < memberTarget) {
          return {
            title: "Waiting for Members",
            description: `${currentMemberCount} of ${memberTarget} members have joined. Invite more friends!`,
            primaryCTA: {
              text: "Share Invite Link",
              color: "bg-sky-500 hover:bg-sky-600",
              disabled: false,
              action: handleCopyInviteLink,
            },
            showCountdown: false,
            showMemberList: true,
            showProgressBar: true,
          };
        }

        return {
          title: "All Good",
          description: "All good. Awaiting payout…",
          primaryCTA: {
            text: "Waiting for Payout",
            color: "bg-green-600",
            disabled: true,
            action: () => {},
          },
          showCountdown: false,
          showMemberList: true,
          showProgressBar: false,
        };

      case 'CREATOR_EMPTY_STATES':
        if (currentMemberCount === 1) {
          return {
            title: "Start Your Circle",
            description: "Start by sharing the link",
            primaryCTA: {
              text: "Share Invite Link",
              color: "bg-sky-500 hover:bg-sky-600",
              disabled: false,
              action: handleCopyInviteLink,
            },
            showCountdown: false,
            showMemberList: false,
            showProgressBar: false,
          };
        }

        return {
          title: "Almost Ready!",
          description: "One more friend needed to kick-off!",
          primaryCTA: {
            text: "Share Invite Link",
            color: "bg-sky-500 hover:bg-sky-600",
            disabled: false,
            action: handleCopyInviteLink,
          },
          showCountdown: false,
          showMemberList: true,
          showProgressBar: true,
        };

      case 'ERROR_STATES':
        const hasInsufficientBalance = parseFloat(userBalance) < parseFloat(contributionAmount);
        
        if (hasInsufficientBalance) {
          return {
            title: "Insufficient Balance",
            description: `You need ${contributionAmount} ${token} + gas to contribute.`,
            primaryCTA: {
              text: "Add Funds",
              color: "bg-red-500 hover:bg-red-600",
              disabled: false,
              action: () => toast({
                title: "Add funds to your wallet",
                description: "Please add funds and try again",
                variant: "destructive",
              }),
            },
            banner: {
              type: 'error',
              message: `You need ${contributionAmount} ${token} + gas to contribute.`,
            },
            showCountdown: true,
            showMemberList: true,
            showProgressBar: true,
          };
        }

        return {
          title: "Round Closed",
          description: "Past late-window. Wait for next round.",
          primaryCTA: {
            text: "Wait for Next Round",
            color: "bg-gray-500",
            disabled: true,
            action: () => {},
          },
          banner: {
            type: 'error',
            message: "Round closed. Wait for next one.",
          },
          showCountdown: false,
          showMemberList: true,
          showProgressBar: true,
        };

      default:
        return null;
    }
  }, [chamaData, countdown, handleContribute, handleJoinChama, handleLeaveAndWithdraw, 
      handleResolveDispute, handleCopyInviteLink, roscaHook.isLoading]);

  // Utility function to clear cache and refresh
  const forceRefresh = useCallback(() => {
    chamaStateManager.clearCache();
    loadChamaData();
  }, [loadChamaData]);

  return {
    chamaData,
    uiConfig: getUIConfig(),
    countdown,
    isLoading: isLoading || roscaHook.isLoading,
    error: roscaHook.error,
    actions: {
      contribute: handleContribute,
      join: handleJoinChama,
      leaveAndWithdraw: handleLeaveAndWithdraw,
      resolveDispute: handleResolveDispute,
      copyInviteLink: handleCopyInviteLink,
      forceRefresh,
    },
    refresh: loadChamaData,
  };
}