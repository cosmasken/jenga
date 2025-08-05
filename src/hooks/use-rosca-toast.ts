import { useToast } from "./use-toast";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

// Citrea testnet explorer URL
const CITREA_EXPLORER_URL = "https://explorer.testnet.citrea.xyz";

/**
 * Create a transaction link button for the toast action
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
      className="h-8 px-2 text-xs hover:bg-gray-100"
    >
      <ExternalLink className="h-3 w-3 mr-1" />
      View Tx
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

  return {
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
    // Expose the base toast function for custom use
    toast,
  };
}
