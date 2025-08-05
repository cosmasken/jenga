import React from "react";
import { useToast } from "./use-toast";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

// Citrea testnet explorer URL
const CITREA_EXPLORER_URL = "https://explorer.testnet.citrea.xyz";

/**
 * Create a transaction link button for the toast action
 * Styled with Bitcoin yellow theming and dark mode support
 */
const createTxLinkAction = (txHash: string) => {
  const handleClick = () => {
    window.open(`${CITREA_EXPLORER_URL}/tx/${txHash}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="h-8 px-3 text-xs font-medium bg-[#F7931A]/10 hover:bg-[#F7931A]/20 text-[#F7931A] border border-[#F7931A]/20 hover:border-[#F7931A]/30 transition-all duration-200 dark:bg-[#F7931A]/15 dark:hover:bg-[#F7931A]/25 dark:border-[#F7931A]/30 dark:hover:border-[#F7931A]/40"
    >
      <ExternalLink className="h-3 w-3 mr-1.5" />
      View Transaction
    </Button>
  );
};

/**
 * Custom hook for ROSCA/Chama-specific toast notifications
 * Provides predefined toast types with appropriate styling and messaging
 */
export function useRoscaToast() {
  const { toast } = useToast();

  /**
   * Show success toast for contribution made
   */
  const contributionSuccess = (amount: string, groupName?: string, txHash?: string) => {
    return toast({
      variant: "contribution",
      title: "Contribution Successful! 🎉",
      description: `You contributed ${amount} cBTC${groupName ? ` to ${groupName}` : ''}`,
      action: txHash ? createTxLinkAction(txHash) : undefined,
    });
  };

  /**
   * Show success toast for payout received
   */
  const payoutReceived = (amount: string, groupName?: string, txHash?: string) => {
    return toast({
      variant: "payout",
      title: "Payout Received! 💰",
      description: `You received ${amount} cBTC${groupName ? ` from ${groupName}` : ''}`,
      action: txHash ? createTxLinkAction(txHash) : undefined,
    });
  };

  /**
   * Show success toast for group creation
   */
  const groupCreated = (groupName: string, memberCount?: number, txHash?: string) => {
    return toast({
      variant: "groupCreated",
      title: "Group Created Successfully! 🚀",
      description: `${groupName} is ready${memberCount ? ` with ${memberCount} members` : ''}`,
      action: txHash ? createTxLinkAction(txHash) : undefined,
    });
  };

  /**
   * Show success toast for member joining
   */
  const memberJoined = (memberName: string, groupName?: string) => {
    return toast({
      variant: "memberJoined",
      title: "New Member Joined! 👋",
      description: `${memberName} joined${groupName ? ` ${groupName}` : ' your group'}`,
    });
  };

  /**
   * Show warning toast for risks or important notices
   */
  const warning = (title: string, description: string) => {
    return toast({
      variant: "warning",
      title,
      description,
    });
  };

  /**
   * Show pending transaction toast
   */
  const transactionPending = (action: string) => {
    return toast({
      variant: "pending",
      title: "Transaction Pending ⏳",
      description: `Your ${action} is being processed on the blockchain`,
    });
  };

  /**
   * Show general success toast
   */
  const success = (title: string, description?: string) => {
    return toast({
      variant: "success",
      title,
      description,
    });
  };

  /**
   * Show error toast
   */
  const error = (title: string, description?: string) => {
    return toast({
      variant: "destructive",
      title,
      description,
    });
  };

  /**
   * Show welcome toast for new users
   */
  const welcome = (userName: string) => {
    return toast({
      variant: "success",
      title: `Welcome to Jenga, ${userName}! 🎉`,
      description: "Start your Bitcoin savings journey with trusted friends",
    });
  };

  /**
   * Show round completion toast
   */
  const roundCompleted = (roundNumber: number, groupName?: string) => {
    return toast({
      variant: "success",
      title: "Round Completed! 🎯",
      description: `Round ${roundNumber}${groupName ? ` of ${groupName}` : ''} has been completed successfully`,
    });
  };

  /**
   * Show reminder toast for upcoming contributions
   */
  const contributionReminder = (daysLeft: number, amount: string) => {
    return toast({
      variant: "warning",
      title: "Contribution Due Soon! ⏰",
      description: `${amount} cBTC contribution due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
    });
  };

  /**
   * Show Bitcoin network status toast
   */
  const networkStatus = (status: 'connected' | 'disconnected' | 'slow') => {
    const statusConfig = {
      connected: {
        variant: "success" as const,
        title: "Network Connected! ⚡",
        description: "Connected to Citrea testnet successfully"
      },
      disconnected: {
        variant: "destructive" as const,
        title: "Network Disconnected! 🔌",
        description: "Lost connection to Citrea testnet"
      },
      slow: {
        variant: "warning" as const,
        title: "Network Slow! 🐌",
        description: "Citrea testnet is experiencing delays"
      }
    };

    const config = statusConfig[status];
    return toast({
      variant: config.variant,
      title: config.title,
      description: config.description,
    });
  };

  /**
   * Show Bitcoin price update toast (for fun/engagement)
   */
  const bitcoinPriceUpdate = (price: string, change: number) => {
    const isPositive = change >= 0;
    return toast({
      variant: isPositive ? "success" : "warning",
      title: `₿ Bitcoin ${isPositive ? '📈' : '📉'} $${price}`,
      description: `${isPositive ? '+' : ''}${change.toFixed(2)}% in the last 24h`,
    });
  };

  /**
   * Show wallet balance update toast
   */
  const balanceUpdate = (newBalance: string, change?: string) => {
    return toast({
      variant: "contribution",
      title: "Balance Updated! 💰",
      description: `Your wallet balance: ${newBalance} cBTC${change ? ` (${change})` : ''}`,
    });
  };

  /**
   * Show group milestone toast
   */
  const groupMilestone = (milestone: string, groupName: string) => {
    return toast({
      variant: "groupCreated",
      title: "Milestone Achieved! 🏆",
      description: `${groupName} has reached ${milestone}`,
    });
  };

  return {
    // Core ROSCA functions
    contributionSuccess,
    payoutReceived,
    groupCreated,
    memberJoined,
    warning,
    transactionPending,
    success,
    error,
    welcome,
    roundCompleted,
    contributionReminder,
    
    // Bitcoin-specific functions
    networkStatus,
    bitcoinPriceUpdate,
    balanceUpdate,
    groupMilestone,
    
    // Expose the base toast function for custom use
    toast,
  };
}
