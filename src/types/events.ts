/**
 * On-Chain Event Types
 * Type definitions for blockchain events and notifications
 */

export enum EventType {
  // ROSCA Contract Events
  GROUP_CREATED = 'GROUP_CREATED',
  MEMBER_JOINED = 'MEMBER_JOINED',
  CONTRIBUTION_MADE = 'CONTRIBUTION_MADE',
  PAYOUT_DISTRIBUTED = 'PAYOUT_DISTRIBUTED',
  ROUND_COMPLETED = 'ROUND_COMPLETED',
  GROUP_COMPLETED = 'GROUP_COMPLETED',
  
  // System Events
  NETWORK_CHANGED = 'NETWORK_CHANGED',
  WALLET_CONNECTED = 'WALLET_CONNECTED',
  WALLET_DISCONNECTED = 'WALLET_DISCONNECTED',
  TRANSACTION_CONFIRMED = 'TRANSACTION_CONFIRMED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface BaseEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  blockNumber?: number;
  transactionHash?: string;
  userAddress?: string;
}

// ROSCA Contract Event Interfaces
export interface GroupCreatedEvent extends BaseEvent {
  type: EventType.GROUP_CREATED;
  data: {
    groupId: bigint;
    creator: string;
    contribution: bigint;
    maxMembers: number;
    cycleDuration: number;
    groupName?: string;
  };
}

export interface MemberJoinedEvent extends BaseEvent {
  type: EventType.MEMBER_JOINED;
  data: {
    groupId: bigint;
    member: string;
    memberCount: number;
    groupName?: string;
  };
}

export interface ContributionMadeEvent extends BaseEvent {
  type: EventType.CONTRIBUTION_MADE;
  data: {
    groupId: bigint;
    member: string;
    amount: bigint;
    round: number;
    groupName?: string;
  };
}

export interface PayoutDistributedEvent extends BaseEvent {
  type: EventType.PAYOUT_DISTRIBUTED;
  data: {
    groupId: bigint;
    recipient: string;
    amount: bigint;
    round: number;
    groupName?: string;
  };
}

export interface RoundCompletedEvent extends BaseEvent {
  type: EventType.ROUND_COMPLETED;
  data: {
    groupId: bigint;
    round: number;
    nextRecipient: string;
    groupName?: string;
  };
}

export interface GroupCompletedEvent extends BaseEvent {
  type: EventType.GROUP_COMPLETED;
  data: {
    groupId: bigint;
    totalSaved: bigint;
    groupName?: string;
  };
}

// System Event Interfaces
export interface NetworkChangedEvent extends BaseEvent {
  type: EventType.NETWORK_CHANGED;
  data: {
    chainId: number;
    networkName: string;
    previousChainId?: number;
  };
}

export interface WalletConnectedEvent extends BaseEvent {
  type: EventType.WALLET_CONNECTED;
  data: {
    address: string;
    walletType: string;
  };
}

export interface WalletDisconnectedEvent extends BaseEvent {
  type: EventType.WALLET_DISCONNECTED;
  data: {
    address?: string;
    reason?: string;
  };
}

export interface TransactionConfirmedEvent extends BaseEvent {
  type: EventType.TRANSACTION_CONFIRMED;
  data: {
    hash: string;
    confirmations: number;
    gasUsed?: string;
    effectiveGasPrice?: string;
  };
}

export interface TransactionFailedEvent extends BaseEvent {
  type: EventType.TRANSACTION_FAILED;
  data: {
    hash: string;
    reason: string;
    gasUsed?: string;
  };
}

// Union type for all events
export type BlockchainEvent = 
  | GroupCreatedEvent
  | MemberJoinedEvent
  | ContributionMadeEvent
  | PayoutDistributedEvent
  | RoundCompletedEvent
  | GroupCompletedEvent
  | NetworkChangedEvent
  | WalletConnectedEvent
  | WalletDisconnectedEvent
  | TransactionConfirmedEvent
  | TransactionFailedEvent;

// Notification interface based on events
export interface EventNotification {
  id: string;
  eventId: string;
  type: EventType;
  priority: NotificationPriority;
  title: string;
  message: string;
  icon?: string;
  action?: {
    label: string;
    handler: () => void;
  };
  timestamp: Date;
  read: boolean;
  persistent: boolean;
  expiresAt?: Date;
}

// Event listener configuration
export interface EventListenerConfig {
  eventType: EventType;
  enabled: boolean;
  userSpecific: boolean;
  batchSize?: number;
  debounceMs?: number;
}

// Event filter for user-specific events
export interface EventFilter {
  userAddress?: string;
  groupIds?: bigint[];
  eventTypes?: EventType[];
  fromBlock?: number;
  toBlock?: number;
}
