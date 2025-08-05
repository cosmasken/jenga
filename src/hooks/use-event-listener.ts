/**
 * Event Listener Hook
 * Provides real-time blockchain event monitoring with toast notifications
 */

import { useEffect, useCallback, useRef } from 'react';
import type { Address } from 'viem';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { EventMonitorService, type EventMonitorConfig } from '@/services/event-monitor';
import { NotificationService, type NotificationServiceConfig } from '@/services/notification-service';
import { useRoscaToast } from './use-rosca-toast';
import { type BlockchainEvent, EventType } from '@/types/events';
import type { Notification } from '@/types/notifications';

// Default configuration
const DEFAULT_EVENT_CONFIG: EventMonitorConfig = {
  contractAddress: '0xbCd9c60030c34dF782eec0249b931851BD941235' as Address, // Your contract address
  rpcUrl: 'https://rpc.testnet.citrea.xyz',
  pollingInterval: 5000, // 5 seconds
  fromBlock: 0n,
  batchSize: 100
};

const DEFAULT_NOTIFICATION_CONFIG: NotificationServiceConfig = {
  explorerUrl: 'https://explorer.testnet.citrea.xyz',
  defaultExpireTime: 10 // 10 minutes
};

export interface UseEventListenerOptions {
  enabled?: boolean;
  eventTypes?: EventType[];
  contractAddress?: Address;
  pollingInterval?: number;
  showToasts?: boolean;
}

export interface UseEventListenerReturn {
  isMonitoring: boolean;
  lastProcessedBlock: bigint;
  subscriberCount: number;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;
  getUserEvents: (fromBlock?: number) => Promise<BlockchainEvent[]>;
}

export function useEventListener(options: UseEventListenerOptions = {}): UseEventListenerReturn {
  const {
    enabled = true,
    eventTypes = Object.values(EventType),
    contractAddress = DEFAULT_EVENT_CONFIG.contractAddress,
    pollingInterval = DEFAULT_EVENT_CONFIG.pollingInterval,
    showToasts = true
  } = options;

  const { primaryWallet } = useDynamicContext();
  const toast = useRoscaToast();
  
  const eventMonitorRef = useRef<EventMonitorService | null>(null);
  const notificationServiceRef = useRef<NotificationService | null>(null);
  const unsubscribeFunctionsRef = useRef<(() => void)[]>([]);

  // Initialize services
  useEffect(() => {
    if (!eventMonitorRef.current) {
      const config = {
        ...DEFAULT_EVENT_CONFIG,
        contractAddress,
        pollingInterval
      };
      eventMonitorRef.current = EventMonitorService.getInstance(config);
    }

    if (!notificationServiceRef.current) {
      notificationServiceRef.current = NotificationService.getInstance(DEFAULT_NOTIFICATION_CONFIG);
    }
  }, [contractAddress, pollingInterval]);

  /**
   * Handle incoming blockchain events
   */
  const handleEvent = useCallback((event: BlockchainEvent) => {
    if (!showToasts || !notificationServiceRef.current) return;

    const userAddress = primaryWallet?.address;
    const notification = notificationServiceRef.current.eventToNotification(event, userAddress);
    
    if (notification) {
      showNotificationAsToast(notification);
    }
  }, [primaryWallet?.address, showToasts]);

  /**
   * Show notification as toast
   */
  const showNotificationAsToast = useCallback((notification: Notification) => {
    const { title, message, action } = notification;

    // Create action for toast if notification has one
    const toastAction = action ? {
      label: action.label,
      onClick: action.handler
    } : undefined;

    // Show appropriate toast based on notification type
    switch (notification.type) {
      case 'success':
        const successNotif = notification as any;
        if (successNotif.variant === 'contribution') {
          toast.contributionSuccess(parseFloat(successNotif.metadata?.amount || '0'), successNotif.metadata?.groupId, successNotif.transactionHash);
        } else if (successNotif.variant === 'payout') {
          toast.payoutReceived(parseFloat(successNotif.metadata?.amount || '0'), successNotif.metadata?.groupId, successNotif.transactionHash);
        } else if (successNotif.variant === 'groupCreated') {
          toast.groupCreated(successNotif.metadata?.groupId, successNotif.transactionHash);
        } else if (successNotif.variant === 'memberJoined') {
          toast.memberJoined(successNotif.metadata?.groupId, successNotif.transactionHash);
        } else {
          toast.success(title, message, toastAction);
        }
        break;

      case 'error':
        toast.error(title, message, toastAction);
        break;

      case 'warning':
        toast.warning(title, message, toastAction);
        break;

      case 'info':
        toast.success(title, message, toastAction); // Use success variant for info
        break;

      case 'event':
        toast.success(title, message, toastAction);
        break;

      default:
        toast.success(title, message, toastAction);
    }
  }, [toast]);

  /**
   * Subscribe to event types
   */
  const subscribeToEvents = useCallback(() => {
    if (!eventMonitorRef.current) return;

    // Clear existing subscriptions
    unsubscribeFunctionsRef.current.forEach(unsubscribe => unsubscribe());
    unsubscribeFunctionsRef.current = [];

    // Subscribe to each event type
    eventTypes.forEach(eventType => {
      if (eventMonitorRef.current) {
        const unsubscribe = eventMonitorRef.current.subscribe(eventType, handleEvent);
        unsubscribeFunctionsRef.current.push(unsubscribe);
      }
    });
  }, [eventTypes, handleEvent]);

  /**
   * Start monitoring events
   */
  const startMonitoring = useCallback(async () => {
    if (!eventMonitorRef.current || !enabled) return;

    try {
      subscribeToEvents();
      await eventMonitorRef.current.startMonitoring();
      console.log('🔍 Event monitoring started');
    } catch (error) {
      console.error('Failed to start event monitoring:', error);
      toast.error('Event Monitoring Failed', 'Unable to start real-time event monitoring');
    }
  }, [enabled, subscribeToEvents, toast]);

  /**
   * Stop monitoring events
   */
  const stopMonitoring = useCallback(() => {
    if (!eventMonitorRef.current) return;

    // Unsubscribe from all events
    unsubscribeFunctionsRef.current.forEach(unsubscribe => unsubscribe());
    unsubscribeFunctionsRef.current = [];

    eventMonitorRef.current.stopMonitoring();
    console.log('⏹️ Event monitoring stopped');
  }, []);

  /**
   * Get historical events for current user
   */
  const getUserEvents = useCallback(async (fromBlock?: number): Promise<BlockchainEvent[]> => {
    if (!eventMonitorRef.current || !primaryWallet?.address) return [];

    try {
      return await eventMonitorRef.current.getUserEvents(
        primaryWallet.address as Address,
        { fromBlock }
      );
    } catch (error) {
      console.error('Failed to get user events:', error);
      return [];
    }
  }, [primaryWallet?.address]);

  /**
   * Auto-start monitoring when wallet is connected and enabled
   */
  useEffect(() => {
    if (enabled && primaryWallet?.address) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    // Cleanup on unmount
    return () => {
      stopMonitoring();
    };
  }, [enabled, primaryWallet?.address, startMonitoring, stopMonitoring]);

  /**
   * Get monitoring status
   */
  const getStatus = useCallback(() => {
    return eventMonitorRef.current?.getStatus() || {
      isMonitoring: false,
      lastProcessedBlock: 0n,
      subscriberCount: 0
    };
  }, []);

  const status = getStatus();

  return {
    isMonitoring: status.isMonitoring,
    lastProcessedBlock: status.lastProcessedBlock,
    subscriberCount: status.subscriberCount,
    startMonitoring,
    stopMonitoring,
    getUserEvents
  };
}

/**
 * Hook for monitoring specific group events
 */
export function useGroupEventListener(groupId?: string, options: UseEventListenerOptions = {}) {
  const baseOptions = {
    ...options,
    eventTypes: [
      EventType.MEMBER_JOINED,
      EventType.CONTRIBUTION_MADE,
      EventType.PAYOUT_DISTRIBUTED,
      EventType.ROUND_COMPLETED,
      EventType.GROUP_COMPLETED
    ]
  };

  const eventListener = useEventListener(baseOptions);

  /**
   * Get events for specific group
   */
  const getGroupEvents = useCallback(async (fromBlock?: number): Promise<BlockchainEvent[]> => {
    const allEvents = await eventListener.getUserEvents(fromBlock);
    
    if (!groupId) return allEvents;

    // Filter events for specific group
    return allEvents.filter(event => {
      const eventData = event.data as any;
      return eventData.groupId?.toString() === groupId;
    });
  }, [eventListener, groupId]);

  return {
    ...eventListener,
    getGroupEvents
  };
}

/**
 * Hook for monitoring user-specific events only
 */
export function useUserEventListener(options: UseEventListenerOptions = {}) {
  const { primaryWallet } = useDynamicContext();
  
  const baseOptions = {
    ...options,
    eventTypes: [
      EventType.GROUP_CREATED,
      EventType.MEMBER_JOINED,
      EventType.CONTRIBUTION_MADE,
      EventType.PAYOUT_DISTRIBUTED
    ]
  };

  return useEventListener(baseOptions);
}
