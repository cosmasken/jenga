/**
 * Notifications Hook
 * Manages notification state, preferences, and history
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  type Notification, 
  type NotificationPreferences, 
  type NotificationCenterState,
  type NotificationQueueItem,
  NotificationType,
  NotificationPriority
} from '@/types/notifications';
import { EventType } from '@/types/events';

// Default notification preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  types: {
    [NotificationType.SUCCESS]: true,
    [NotificationType.ERROR]: true,
    [NotificationType.WARNING]: true,
    [NotificationType.INFO]: true,
    [NotificationType.EVENT]: true
  },
  events: {
    [EventType.GROUP_CREATED]: true,
    [EventType.MEMBER_JOINED]: true,
    [EventType.CONTRIBUTION_MADE]: true,
    [EventType.PAYOUT_DISTRIBUTED]: true,
    [EventType.ROUND_COMPLETED]: true,
    [EventType.GROUP_COMPLETED]: true,
    [EventType.NETWORK_CHANGED]: true,
    [EventType.WALLET_CONNECTED]: true,
    [EventType.WALLET_DISCONNECTED]: true,
    [EventType.TRANSACTION_CONFIRMED]: true,
    [EventType.TRANSACTION_FAILED]: true
  },
  priority: {
    [NotificationPriority.LOW]: true,
    [NotificationPriority.MEDIUM]: true,
    [NotificationPriority.HIGH]: true,
    [NotificationPriority.URGENT]: true
  },
  autoExpire: true,
  defaultExpireTime: 10, // minutes
  soundEnabled: false,
  desktopNotifications: false
};

const STORAGE_KEYS = {
  NOTIFICATIONS: 'jenga_notifications',
  PREFERENCES: 'jenga_notification_preferences',
  LAST_READ: 'jenga_notifications_last_read'
};

export interface UseNotificationsReturn {
  // State
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  preferences: NotificationPreferences;
  
  // Actions
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  clearExpired: () => void;
  
  // UI Controls
  openCenter: () => void;
  closeCenter: () => void;
  toggleCenter: () => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  resetPreferences: () => void;
  
  // Filtering
  getNotificationsByType: (type: NotificationType) => Notification[];
  getNotificationsByPriority: (priority: NotificationPriority) => Notification[];
  getRecentNotifications: (hours?: number) => Notification[];
}

export function useNotifications(): UseNotificationsReturn {
  const [state, setState] = useState<NotificationCenterState>(() => {
    // Load from localStorage
    const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const savedPreferences = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    
    const notifications = savedNotifications ? JSON.parse(savedNotifications) : [];
    const preferences = savedPreferences ? JSON.parse(savedPreferences) : DEFAULT_PREFERENCES;
    
    // Convert date strings back to Date objects
    const parsedNotifications = notifications.map((notif: any) => ({
      ...notif,
      timestamp: new Date(notif.timestamp),
      expiresAt: notif.expiresAt ? new Date(notif.expiresAt) : undefined
    }));

    return {
      notifications: parsedNotifications,
      unreadCount: parsedNotifications.filter((n: Notification) => !n.read).length,
      isOpen: false,
      preferences,
      queue: []
    };
  });

  const cleanupTimerRef = useRef<NodeJS.Timeout>();

  /**
   * Save state to localStorage
   */
  const saveToStorage = useCallback((notifications: Notification[], preferences: NotificationPreferences) => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  }, []);

  /**
   * Add a new notification
   */
  const addNotification = useCallback((notification: Notification) => {
    setState(prevState => {
      // Check if notification type is enabled
      if (!prevState.preferences.enabled || !prevState.preferences.types[notification.type]) {
        return prevState;
      }

      // Check if priority is enabled
      if (!prevState.preferences.priority[notification.priority]) {
        return prevState;
      }

      // Set expiration if auto-expire is enabled and not already set
      let finalNotification = { ...notification };
      if (prevState.preferences.autoExpire && !finalNotification.expiresAt && !finalNotification.persistent) {
        finalNotification.expiresAt = new Date(
          Date.now() + prevState.preferences.defaultExpireTime * 60 * 1000
        );
      }

      const newNotifications = [finalNotification, ...prevState.notifications];
      const newUnreadCount = newNotifications.filter(n => !n.read).length;

      // Save to storage
      saveToStorage(newNotifications, prevState.preferences);

      // Show desktop notification if enabled
      if (prevState.preferences.desktopNotifications && 'Notification' in window) {
        showDesktopNotification(finalNotification);
      }

      return {
        ...prevState,
        notifications: newNotifications,
        unreadCount: newUnreadCount
      };
    });
  }, [saveToStorage]);

  /**
   * Remove a notification
   */
  const removeNotification = useCallback((id: string) => {
    setState(prevState => {
      const newNotifications = prevState.notifications.filter(n => n.id !== id);
      const newUnreadCount = newNotifications.filter(n => !n.read).length;

      saveToStorage(newNotifications, prevState.preferences);

      return {
        ...prevState,
        notifications: newNotifications,
        unreadCount: newUnreadCount
      };
    });
  }, [saveToStorage]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((id: string) => {
    setState(prevState => {
      const newNotifications = prevState.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      const newUnreadCount = newNotifications.filter(n => !n.read).length;

      saveToStorage(newNotifications, prevState.preferences);

      return {
        ...prevState,
        notifications: newNotifications,
        unreadCount: newUnreadCount
      };
    });
  }, [saveToStorage]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    setState(prevState => {
      const newNotifications = prevState.notifications.map(n => ({ ...n, read: true }));
      
      saveToStorage(newNotifications, prevState.preferences);
      localStorage.setItem(STORAGE_KEYS.LAST_READ, new Date().toISOString());

      return {
        ...prevState,
        notifications: newNotifications,
        unreadCount: 0
      };
    });
  }, [saveToStorage]);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    setState(prevState => {
      saveToStorage([], prevState.preferences);

      return {
        ...prevState,
        notifications: [],
        unreadCount: 0
      };
    });
  }, [saveToStorage]);

  /**
   * Clear expired notifications
   */
  const clearExpired = useCallback(() => {
    setState(prevState => {
      const now = new Date();
      const newNotifications = prevState.notifications.filter(n => 
        !n.expiresAt || n.expiresAt > now
      );
      const newUnreadCount = newNotifications.filter(n => !n.read).length;

      if (newNotifications.length !== prevState.notifications.length) {
        saveToStorage(newNotifications, prevState.preferences);
      }

      return {
        ...prevState,
        notifications: newNotifications,
        unreadCount: newUnreadCount
      };
    });
  }, [saveToStorage]);

  /**
   * UI Controls
   */
  const openCenter = useCallback(() => {
    setState(prevState => ({ ...prevState, isOpen: true }));
  }, []);

  const closeCenter = useCallback(() => {
    setState(prevState => ({ ...prevState, isOpen: false }));
  }, []);

  const toggleCenter = useCallback(() => {
    setState(prevState => ({ ...prevState, isOpen: !prevState.isOpen }));
  }, []);

  /**
   * Update preferences
   */
  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    setState(prevState => {
      const updatedPreferences = { ...prevState.preferences, ...newPreferences };
      saveToStorage(prevState.notifications, updatedPreferences);

      return {
        ...prevState,
        preferences: updatedPreferences
      };
    });
  }, [saveToStorage]);

  /**
   * Reset preferences to default
   */
  const resetPreferences = useCallback(() => {
    setState(prevState => {
      saveToStorage(prevState.notifications, DEFAULT_PREFERENCES);

      return {
        ...prevState,
        preferences: DEFAULT_PREFERENCES
      };
    });
  }, [saveToStorage]);

  /**
   * Filtering functions
   */
  const getNotificationsByType = useCallback((type: NotificationType): Notification[] => {
    return state.notifications.filter(n => n.type === type);
  }, [state.notifications]);

  const getNotificationsByPriority = useCallback((priority: NotificationPriority): Notification[] => {
    return state.notifications.filter(n => n.priority === priority);
  }, [state.notifications]);

  const getRecentNotifications = useCallback((hours: number = 24): Notification[] => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return state.notifications.filter(n => n.timestamp > cutoff);
  }, [state.notifications]);

  /**
   * Auto-cleanup expired notifications
   */
  useEffect(() => {
    const cleanup = () => {
      clearExpired();
    };

    // Clean up every 5 minutes
    cleanupTimerRef.current = setInterval(cleanup, 5 * 60 * 1000);

    return () => {
      if (cleanupTimerRef.current) {
        clearInterval(cleanupTimerRef.current);
      }
    };
  }, [clearExpired]);

  /**
   * Request desktop notification permission
   */
  useEffect(() => {
    if (state.preferences.desktopNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [state.preferences.desktopNotifications]);

  return {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isOpen: state.isOpen,
    preferences: state.preferences,
    
    // Actions
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearExpired,
    
    // UI Controls
    openCenter,
    closeCenter,
    toggleCenter,
    
    // Preferences
    updatePreferences,
    resetPreferences,
    
    // Filtering
    getNotificationsByType,
    getNotificationsByPriority,
    getRecentNotifications
  };
}

/**
 * Show desktop notification
 */
function showDesktopNotification(notification: Notification) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico', // Your app icon
      tag: notification.id,
      requireInteraction: notification.persistent
    });
  }
}
