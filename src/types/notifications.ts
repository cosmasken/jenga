/**
 * Notification System Types
 * Type definitions for the notification system
 */

import { EventType, NotificationPriority } from './events';
import { ErrorSeverity } from './errors';

// Re-export for convenience
export { NotificationPriority };

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  EVENT = 'event'
}

export interface NotificationAction {
  label: string;
  handler: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'bitcoin';
  icon?: string;
}

export interface BaseNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent: boolean;
  expiresAt?: Date;
  action?: NotificationAction;
  metadata?: Record<string, any>;
}

// Success notifications
export interface SuccessNotification extends BaseNotification {
  type: NotificationType.SUCCESS;
  variant?: 'contribution' | 'payout' | 'groupCreated' | 'memberJoined' | 'default';
  transactionHash?: string;
}

// Error notifications
export interface ErrorNotification extends BaseNotification {
  type: NotificationType.ERROR;
  severity: ErrorSeverity;
  errorCode?: string;
  suggestion?: string;
  retryAction?: () => void;
}

// Warning notifications
export interface WarningNotification extends BaseNotification {
  type: NotificationType.WARNING;
  deadline?: Date;
  actionRequired?: boolean;
}

// Info notifications
export interface InfoNotification extends BaseNotification {
  type: NotificationType.INFO;
  category?: 'update' | 'tip' | 'announcement' | 'reminder';
}

// Event-based notifications
export interface EventNotification extends BaseNotification {
  type: NotificationType.EVENT;
  eventType: EventType;
  eventId: string;
  blockNumber?: number;
  transactionHash?: string;
}

// Union type for all notifications
export type Notification = 
  | SuccessNotification
  | ErrorNotification
  | WarningNotification
  | InfoNotification
  | EventNotification;

// Notification preferences
export interface NotificationPreferences {
  enabled: boolean;
  types: {
    [NotificationType.SUCCESS]: boolean;
    [NotificationType.ERROR]: boolean;
    [NotificationType.WARNING]: boolean;
    [NotificationType.INFO]: boolean;
    [NotificationType.EVENT]: boolean;
  };
  events: {
    [EventType.GROUP_CREATED]: boolean;
    [EventType.MEMBER_JOINED]: boolean;
    [EventType.CONTRIBUTION_MADE]: boolean;
    [EventType.PAYOUT_DISTRIBUTED]: boolean;
    [EventType.ROUND_COMPLETED]: boolean;
    [EventType.GROUP_COMPLETED]: boolean;
    [EventType.NETWORK_CHANGED]: boolean;
    [EventType.WALLET_CONNECTED]: boolean;
    [EventType.WALLET_DISCONNECTED]: boolean;
    [EventType.TRANSACTION_CONFIRMED]: boolean;
    [EventType.TRANSACTION_FAILED]: boolean;
  };
  priority: {
    [NotificationPriority.LOW]: boolean;
    [NotificationPriority.MEDIUM]: boolean;
    [NotificationPriority.HIGH]: boolean;
    [NotificationPriority.URGENT]: boolean;
  };
  autoExpire: boolean;
  defaultExpireTime: number; // in minutes
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

// Notification queue item
export interface NotificationQueueItem {
  notification: Notification;
  retryCount: number;
  maxRetries: number;
  nextRetry?: Date;
}

// Notification center state
export interface NotificationCenterState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  preferences: NotificationPreferences;
  queue: NotificationQueueItem[];
}

// Notification templates for common scenarios
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  titleTemplate: string;
  messageTemplate: string;
  persistent: boolean;
  expiresIn?: number; // minutes
  actionTemplate?: {
    label: string;
    variant: NotificationAction['variant'];
  };
}

// Predefined notification templates
export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  CONTRIBUTION_SUCCESS: {
    id: 'contribution_success',
    type: NotificationType.SUCCESS,
    priority: NotificationPriority.HIGH,
    titleTemplate: 'Contribution Successful! 🎉',
    messageTemplate: 'You contributed {amount} cBTC to {groupName}',
    persistent: false,
    expiresIn: 10,
    actionTemplate: {
      label: 'View Transaction',
      variant: 'bitcoin'
    }
  },
  PAYOUT_RECEIVED: {
    id: 'payout_received',
    type: NotificationType.SUCCESS,
    priority: NotificationPriority.HIGH,
    titleTemplate: 'Payout Received! 💰',
    messageTemplate: 'You received {amount} cBTC from {groupName}',
    persistent: true,
    actionTemplate: {
      label: 'View Transaction',
      variant: 'bitcoin'
    }
  },
  CONTRIBUTION_DUE: {
    id: 'contribution_due',
    type: NotificationType.WARNING,
    priority: NotificationPriority.HIGH,
    titleTemplate: 'Contribution Due Soon! ⏰',
    messageTemplate: '{amount} cBTC contribution due in {days} days for {groupName}',
    persistent: true,
    actionTemplate: {
      label: 'Make Contribution',
      variant: 'bitcoin'
    }
  },
  TRANSACTION_FAILED: {
    id: 'transaction_failed',
    type: NotificationType.ERROR,
    priority: NotificationPriority.HIGH,
    titleTemplate: 'Transaction Failed ❌',
    messageTemplate: 'Your transaction failed: {reason}',
    persistent: true,
    actionTemplate: {
      label: 'Retry',
      variant: 'destructive'
    }
  },
  NETWORK_CHANGED: {
    id: 'network_changed',
    type: NotificationType.INFO,
    priority: NotificationPriority.MEDIUM,
    titleTemplate: 'Network Changed 🔄',
    messageTemplate: 'Switched to {networkName}',
    persistent: false,
    expiresIn: 5
  }
};
