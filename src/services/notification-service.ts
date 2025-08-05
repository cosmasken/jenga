/**
 * Notification Service
 * Converts blockchain events to user-friendly notifications
 */

import { formatEther } from 'viem';
import { 
  type BlockchainEvent, 
  EventType,
  type GroupCreatedEvent,
  type MemberJoinedEvent,
  type ContributionMadeEvent,
  type PayoutDistributedEvent,
  type RoundCompletedEvent,
  type GroupCompletedEvent
} from '@/types/events';
import { 
  type Notification, 
  NotificationType, 
  NotificationPriority,
  type SuccessNotification,
  type EventNotification,
  type InfoNotification
} from '@/types/notifications';

export interface NotificationServiceConfig {
  explorerUrl: string;
  defaultExpireTime: number; // minutes
}

export class NotificationService {
  private static instance: NotificationService;
  private config: NotificationServiceConfig;

  constructor(config: NotificationServiceConfig) {
    this.config = config;
  }

  public static getInstance(config?: NotificationServiceConfig): NotificationService {
    if (!NotificationService.instance && config) {
      NotificationService.instance = new NotificationService(config);
    }
    return NotificationService.instance;
  }

  /**
   * Convert a blockchain event to a user notification
   */
  public eventToNotification(event: BlockchainEvent, userAddress?: string): Notification | null {
    switch (event.type) {
      case EventType.GROUP_CREATED:
        return this.createGroupCreatedNotification(event as GroupCreatedEvent, userAddress);
      
      case EventType.MEMBER_JOINED:
        return this.createMemberJoinedNotification(event as MemberJoinedEvent, userAddress);
      
      case EventType.CONTRIBUTION_MADE:
        return this.createContributionMadeNotification(event as ContributionMadeEvent, userAddress);
      
      case EventType.PAYOUT_DISTRIBUTED:
        return this.createPayoutDistributedNotification(event as PayoutDistributedEvent, userAddress);
      
      case EventType.ROUND_COMPLETED:
        return this.createRoundCompletedNotification(event as RoundCompletedEvent, userAddress);
      
      case EventType.GROUP_COMPLETED:
        return this.createGroupCompletedNotification(event as GroupCompletedEvent, userAddress);
      
      default:
        return null;
    }
  }

  /**
   * Create notification for group creation
   */
  private createGroupCreatedNotification(
    event: GroupCreatedEvent, 
    userAddress?: string
  ): SuccessNotification {
    const { groupId, creator, contribution, maxMembers, cycleDuration } = event.data;
    const contributionAmount = formatEther(contribution);
    const isCreator = userAddress?.toLowerCase() === creator.toLowerCase();

    return {
      id: this.generateNotificationId(event),
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.HIGH,
      title: isCreator ? "Group Created Successfully! 🚀" : "New Group Available! 🎯",
      message: isCreator 
        ? `Your ROSCA group #${groupId} is ready! Contribution: ${contributionAmount} cBTC, ${maxMembers} members max.`
        : `ROSCA group #${groupId} created. Contribution: ${contributionAmount} cBTC, ${maxMembers} members max.`,
      timestamp: event.timestamp,
      read: false,
      persistent: true,
      variant: 'groupCreated',
      transactionHash: event.transactionHash,
      action: {
        label: isCreator ? 'View Group' : 'Join Group',
        handler: () => this.navigateToGroup(groupId.toString()),
        variant: 'bitcoin'
      },
      metadata: {
        groupId: groupId.toString(),
        contributionAmount,
        maxMembers,
        cycleDuration,
        isCreator
      }
    };
  }

  /**
   * Create notification for member joining
   */
  private createMemberJoinedNotification(
    event: MemberJoinedEvent, 
    userAddress?: string
  ): SuccessNotification | InfoNotification {
    const { groupId, member, memberCount } = event.data;
    const isUser = userAddress?.toLowerCase() === member.toLowerCase();

    if (isUser) {
      return {
        id: this.generateNotificationId(event),
        type: NotificationType.SUCCESS,
        priority: NotificationPriority.HIGH,
        title: "Welcome to the Group! 🎉",
        message: `You successfully joined ROSCA group #${groupId}. You're member #${memberCount}.`,
        timestamp: event.timestamp,
        read: false,
        persistent: true,
        variant: 'memberJoined',
        transactionHash: event.transactionHash,
        action: {
          label: 'View Group',
          handler: () => this.navigateToGroup(groupId.toString()),
          variant: 'bitcoin'
        },
        metadata: {
          groupId: groupId.toString(),
          memberCount,
          isUser: true
        }
      };
    } else {
      return {
        id: this.generateNotificationId(event),
        type: NotificationType.INFO,
        priority: NotificationPriority.MEDIUM,
        title: "New Member Joined! 👥",
        message: `A new member joined ROSCA group #${groupId}. Total members: ${memberCount}.`,
        timestamp: event.timestamp,
        read: false,
        persistent: false,
        expiresAt: new Date(Date.now() + this.config.defaultExpireTime * 60 * 1000),
        category: 'update',
        metadata: {
          groupId: groupId.toString(),
          memberCount,
          newMember: member
        }
      };
    }
  }

  /**
   * Create notification for contribution made
   */
  private createContributionMadeNotification(
    event: ContributionMadeEvent, 
    userAddress?: string
  ): SuccessNotification | InfoNotification {
    const { groupId, member, amount, round } = event.data;
    const contributionAmount = formatEther(amount);
    const isUser = userAddress?.toLowerCase() === member.toLowerCase();

    if (isUser) {
      return {
        id: this.generateNotificationId(event),
        type: NotificationType.SUCCESS,
        priority: NotificationPriority.HIGH,
        title: "Contribution Successful! 🎉",
        message: `You contributed ${contributionAmount} cBTC to group #${groupId} for round ${round}.`,
        timestamp: event.timestamp,
        read: false,
        persistent: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        variant: 'contribution',
        transactionHash: event.transactionHash,
        action: {
          label: 'View Transaction',
          handler: () => this.openTransaction(event.transactionHash!),
          variant: 'bitcoin'
        },
        metadata: {
          groupId: groupId.toString(),
          amount: contributionAmount,
          round,
          isUser: true
        }
      };
    } else {
      return {
        id: this.generateNotificationId(event),
        type: NotificationType.INFO,
        priority: NotificationPriority.LOW,
        title: "Group Contribution Made 💰",
        message: `Member contributed ${contributionAmount} cBTC to group #${groupId} (Round ${round}).`,
        timestamp: event.timestamp,
        read: false,
        persistent: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        category: 'update',
        metadata: {
          groupId: groupId.toString(),
          amount: contributionAmount,
          round,
          contributor: member
        }
      };
    }
  }

  /**
   * Create notification for payout distribution
   */
  private createPayoutDistributedNotification(
    event: PayoutDistributedEvent, 
    userAddress?: string
  ): SuccessNotification | InfoNotification {
    const { groupId, recipient, amount, round } = event.data;
    const payoutAmount = formatEther(amount);
    const isRecipient = userAddress?.toLowerCase() === recipient.toLowerCase();

    if (isRecipient) {
      return {
        id: this.generateNotificationId(event),
        type: NotificationType.SUCCESS,
        priority: NotificationPriority.HIGH,
        title: "Payout Received! 💰",
        message: `You received ${payoutAmount} cBTC from group #${groupId} for round ${round}!`,
        timestamp: event.timestamp,
        read: false,
        persistent: true,
        variant: 'payout',
        transactionHash: event.transactionHash,
        action: {
          label: 'View Transaction',
          handler: () => this.openTransaction(event.transactionHash!),
          variant: 'bitcoin'
        },
        metadata: {
          groupId: groupId.toString(),
          amount: payoutAmount,
          round,
          isRecipient: true
        }
      };
    } else {
      return {
        id: this.generateNotificationId(event),
        type: NotificationType.INFO,
        priority: NotificationPriority.MEDIUM,
        title: "Payout Distributed 🎯",
        message: `${payoutAmount} cBTC payout distributed in group #${groupId} for round ${round}.`,
        timestamp: event.timestamp,
        read: false,
        persistent: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        category: 'update',
        metadata: {
          groupId: groupId.toString(),
          amount: payoutAmount,
          round,
          recipient
        }
      };
    }
  }

  /**
   * Create notification for round completion
   */
  private createRoundCompletedNotification(
    event: RoundCompletedEvent, 
    userAddress?: string
  ): InfoNotification {
    const { groupId, round, nextRecipient } = event.data;
    const isNextRecipient = userAddress?.toLowerCase() === nextRecipient.toLowerCase();

    return {
      id: this.generateNotificationId(event),
      type: NotificationType.INFO,
      priority: isNextRecipient ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
      title: isNextRecipient ? "You're Next! 🎯" : "Round Completed! ✅",
      message: isNextRecipient 
        ? `Round ${round} completed in group #${groupId}. You'll receive the next payout!`
        : `Round ${round} completed in group #${groupId}. Next recipient selected.`,
      timestamp: event.timestamp,
      read: false,
      persistent: isNextRecipient,
      expiresAt: isNextRecipient ? undefined : new Date(Date.now() + 15 * 60 * 1000),
      category: 'update',
      action: isNextRecipient ? {
        label: 'View Group',
        handler: () => this.navigateToGroup(groupId.toString()),
        variant: 'bitcoin'
      } : undefined,
      metadata: {
        groupId: groupId.toString(),
        round,
        nextRecipient,
        isNextRecipient
      }
    };
  }

  /**
   * Create notification for group completion
   */
  private createGroupCompletedNotification(
    event: GroupCompletedEvent, 
    userAddress?: string
  ): SuccessNotification {
    const { groupId, totalSaved } = event.data;
    const totalAmount = formatEther(totalSaved);

    return {
      id: this.generateNotificationId(event),
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.HIGH,
      title: "Group Completed! 🏆",
      message: `ROSCA group #${groupId} has completed successfully! Total saved: ${totalAmount} cBTC.`,
      timestamp: event.timestamp,
      read: false,
      persistent: true,
      variant: 'groupCreated',
      transactionHash: event.transactionHash,
      action: {
        label: 'View Summary',
        handler: () => this.navigateToGroup(groupId.toString()),
        variant: 'bitcoin'
      },
      metadata: {
        groupId: groupId.toString(),
        totalSaved: totalAmount,
        completed: true
      }
    };
  }

  /**
   * Generate unique notification ID
   */
  private generateNotificationId(event: BlockchainEvent): string {
    return `notif_${event.type}_${event.id}_${Date.now()}`;
  }

  /**
   * Navigate to group page
   */
  private navigateToGroup(groupId: string): void {
    // This would be implemented based on your routing system
    window.location.href = `/group/${groupId}`;
  }

  /**
   * Open transaction in explorer
   */
  private openTransaction(txHash: string): void {
    window.open(`${this.config.explorerUrl}/tx/${txHash}`, '_blank', 'noopener,noreferrer');
  }

  /**
   * Format notification for display
   */
  public formatNotificationForToast(notification: Notification): {
    variant: string;
    title: string;
    description: string;
    action?: React.ReactNode;
  } {
    return {
      variant: this.getToastVariant(notification),
      title: notification.title,
      description: notification.message,
      action: notification.action ? this.createActionButton(notification.action) : undefined
    };
  }

  /**
   * Get appropriate toast variant for notification
   */
  private getToastVariant(notification: Notification): string {
    switch (notification.type) {
      case NotificationType.SUCCESS:
        const successNotif = notification as SuccessNotification;
        return successNotif.variant || 'success';
      
      case NotificationType.ERROR:
        return 'destructive';
      
      case NotificationType.WARNING:
        return 'warning';
      
      case NotificationType.INFO:
        return 'default';
      
      case NotificationType.EVENT:
        return 'contribution';
      
      default:
        return 'default';
    }
  }

  /**
   * Create action button for notification
   */
  private createActionButton(action: any): React.ReactNode {
    // This would return a React component for the action button
    // Implementation depends on your UI framework
    return null;
  }
}
