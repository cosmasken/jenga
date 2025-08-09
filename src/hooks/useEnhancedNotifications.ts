/**
 * Enhanced Notification System
 * Advanced features: Push notifications, smart batching, delivery optimization
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';

// Types for enhanced notifications
export interface EnhancedNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'social' | 'financial' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  
  // Enhanced metadata
  actionable: boolean;
  actions?: NotificationAction[];
  deepLink?: string;
  groupable: boolean;
  batchKey?: string;
  
  // Delivery options
  channels: NotificationChannel[];
  deliveryOptions: DeliveryOptions;
  
  // Context
  contextData: Record<string, any>;
  userId: string;
  
  // Timestamps
  createdAt: Date;
  scheduledFor?: Date;
  expiresAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  
  // Status
  status: 'pending' | 'scheduled' | 'delivered' | 'read' | 'dismissed' | 'failed';
  deliveryAttempts: number;
  
  // Personalization
  personalizedContent?: {
    title: string;
    message: string;
    emoji?: string;
  };
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'destructive';
  action: string; // Function name or deep link
  params?: Record<string, any>;
  icon?: string;
}

export type NotificationChannel = 'in_app' | 'push' | 'email' | 'sms' | 'webhook';

export interface DeliveryOptions {
  immediate: boolean;
  batchable: boolean;
  maxBatchSize: number;
  batchDelay: number; // minutes
  retryAttempts: number;
  retryDelay: number; // minutes
  fallbackChannels: NotificationChannel[];
}

export interface NotificationBatch {
  id: string;
  userId: string;
  batchKey: string;
  notifications: EnhancedNotification[];
  scheduledFor: Date;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  createdAt: Date;
}

export interface UserNotificationPreferences {
  channels: {
    [key in NotificationChannel]: {
      enabled: boolean;
      quietHours?: { start: string; end: string };
      frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    };
  };
  types: {
    [key: string]: {
      enabled: boolean;
      preferredChannel: NotificationChannel;
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
  };
  batching: {
    enabled: boolean;
    maxBatchSize: number;
    batchDelay: number;
  };
  smart: {
    personalizedContent: boolean;
    contextAware: boolean;
    learningEnabled: boolean;
  };
}

// Hook for enhanced notifications
export function useEnhancedNotifications() {
  const { primaryWallet } = useDynamicContext();
  const { supabase } = useSupabase();
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
  const [batches, setBatches] = useState<NotificationBatch[]>([]);
  const [preferences, setPreferences] = useState<UserNotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Service worker for push notifications
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);
  
  // Batching timer
  const batchTimerRef = useRef<NodeJS.Timeout>();

  /**
   * Initialize push notification support
   */
  const initializePushNotifications = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Check for existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setPushSubscription(existingSubscription);
      }
      
      setPushSupported(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }, []);

  /**
   * Subscribe to push notifications
   */
  const subscribeToPushNotifications = useCallback(async (): Promise<boolean> => {
    if (!pushSupported || !primaryWallet?.address) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || '')
      });

      // Save subscription to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_wallet_address: primaryWallet.address,
          subscription: JSON.stringify(subscription),
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setPushSubscription(subscription);
      toast.success('Push notifications enabled!');
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast.error('Failed to enable push notifications');
      return false;
    }
  }, [pushSupported, primaryWallet?.address, supabase]);

  /**
   * Create enhanced notification
   */
  const createNotification = useCallback(async (
    notification: Partial<EnhancedNotification>
  ): Promise<string | null> => {
    if (!primaryWallet?.address) return null;

    try {
      const enhancedNotification: EnhancedNotification = {
        id: crypto.randomUUID(),
        title: notification.title || 'Notification',
        message: notification.message || '',
        type: notification.type || 'info',
        priority: notification.priority || 'medium',
        category: notification.category || 'general',
        actionable: notification.actionable || false,
        actions: notification.actions || [],
        groupable: notification.groupable || false,
        channels: notification.channels || ['in_app'],
        deliveryOptions: {
          immediate: true,
          batchable: false,
          maxBatchSize: 5,
          batchDelay: 5,
          retryAttempts: 3,
          retryDelay: 1,
          fallbackChannels: ['in_app'],
          ...notification.deliveryOptions
        },
        contextData: notification.contextData || {},
        userId: primaryWallet.address,
        createdAt: new Date(),
        status: 'pending',
        deliveryAttempts: 0,
        ...notification
      };

      // Save to database
      const { error } = await supabase
        .from('enhanced_notifications')
        .insert({
          id: enhancedNotification.id,
          user_wallet_address: enhancedNotification.userId,
          title: enhancedNotification.title,
          message: enhancedNotification.message,
          type: enhancedNotification.type,
          priority: enhancedNotification.priority,
          category: enhancedNotification.category,
          actionable: enhancedNotification.actionable,
          actions: enhancedNotification.actions,
          channels: enhancedNotification.channels,
          delivery_options: enhancedNotification.deliveryOptions,
          context_data: enhancedNotification.contextData,
          status: enhancedNotification.status,
          created_at: enhancedNotification.createdAt.toISOString(),
          scheduled_for: enhancedNotification.scheduledFor?.toISOString(),
          expires_at: enhancedNotification.expiresAt?.toISOString()
        });

      if (error) throw error;

      // Process delivery
      await processNotificationDelivery(enhancedNotification);

      return enhancedNotification.id;
    } catch (error) {
      console.error('Failed to create enhanced notification:', error);
      return null;
    }
  }, [primaryWallet?.address, supabase]);

  /**
   * Process notification delivery based on preferences and batching
   */
  const processNotificationDelivery = useCallback(async (
    notification: EnhancedNotification
  ) => {
    if (!preferences) return;

    // Check if should be batched
    if (notification.deliveryOptions.batchable && preferences.batching.enabled) {
      await addToBatch(notification);
      return;
    }

    // Immediate delivery
    await deliverNotification(notification);
  }, [preferences]);

  /**
   * Add notification to batch
   */
  const addToBatch = useCallback(async (notification: EnhancedNotification) => {
    const batchKey = notification.batchKey || notification.category;
    
    // Find existing batch or create new one
    let batch = batches.find(b => 
      b.userId === notification.userId && 
      b.batchKey === batchKey && 
      b.status === 'pending'
    );

    if (!batch) {
      batch = {
        id: crypto.randomUUID(),
        userId: notification.userId,
        batchKey,
        notifications: [],
        scheduledFor: new Date(Date.now() + notification.deliveryOptions.batchDelay * 60 * 1000),
        status: 'pending',
        createdAt: new Date()
      };
      setBatches(prev => [...prev, batch!]);
    }

    batch.notifications.push(notification);

    // If batch is full, process immediately
    if (batch.notifications.length >= notification.deliveryOptions.maxBatchSize) {
      await processBatch(batch.id);
    }
  }, [batches]);

  /**
   * Process a notification batch
   */
  const processBatch = useCallback(async (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    try {
      // Create batched notification content
      const batchedNotification = createBatchedNotification(batch);
      
      // Deliver the batched notification
      await deliverNotification(batchedNotification);
      
      // Update batch status
      setBatches(prev => 
        prev.map(b => 
          b.id === batchId 
            ? { ...b, status: 'sent' as const }
            : b
        )
      );
    } catch (error) {
      console.error('Failed to process batch:', error);
      setBatches(prev => 
        prev.map(b => 
          b.id === batchId 
            ? { ...b, status: 'failed' as const }
            : b
        )
      );
    }
  }, [batches]);

  /**
   * Create batched notification content
   */
  const createBatchedNotification = useCallback((
    batch: NotificationBatch
  ): EnhancedNotification => {
    const count = batch.notifications.length;
    const firstNotification = batch.notifications[0];
    
    return {
      ...firstNotification,
      id: batch.id,
      title: `${count} New ${batch.batchKey} Updates`,
      message: batch.notifications.length > 1 
        ? `You have ${count} new ${batch.batchKey} notifications`
        : firstNotification.message,
      contextData: {
        ...firstNotification.contextData,
        batchId: batch.id,
        batchCount: count,
        batchedNotifications: batch.notifications.map(n => n.id)
      }
    };
  }, []);

  /**
   * Deliver notification through specified channels
   */
  const deliverNotification = useCallback(async (
    notification: EnhancedNotification
  ) => {
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case 'in_app':
            await deliverInAppNotification(notification);
            break;
          case 'push':
            await deliverPushNotification(notification);
            break;
          case 'email':
            await deliverEmailNotification(notification);
            break;
          case 'sms':
            await deliverSMSNotification(notification);
            break;
          default:
            console.warn('Unsupported notification channel:', channel);
        }
      } catch (error) {
        console.error(`Failed to deliver notification via ${channel}:`, error);
        // Try fallback channels if available
        // Implementation for fallback logic would go here
      }
    }

    // Update notification status
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id 
          ? { ...n, status: 'delivered', deliveredAt: new Date() }
          : n
      )
    );
  }, []);

  /**
   * Deliver in-app notification
   */
  const deliverInAppNotification = useCallback(async (
    notification: EnhancedNotification
  ) => {
    // Add to in-app notifications state
    setNotifications(prev => [...prev, notification]);
    
    // Show toast for immediate notifications
    if (notification.deliveryOptions.immediate) {
      const emoji = getEmojiForType(notification.type);
      toast(notification.title, {
        description: notification.message,
        action: notification.actions?.[0] ? {
          label: notification.actions[0].label,
          onClick: () => handleNotificationAction(notification.actions![0], notification)
        } : undefined
      });
    }
  }, []);

  /**
   * Deliver push notification
   */
  const deliverPushNotification = useCallback(async (
    notification: EnhancedNotification
  ) => {
    if (!pushSubscription) return;

    try {
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: pushSubscription,
          notification: {
            title: notification.title,
            body: notification.message,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: notification.id,
            data: {
              notificationId: notification.id,
              deepLink: notification.deepLink,
              actions: notification.actions
            }
          }
        })
      });

      if (!response.ok) throw new Error('Push notification failed');
    } catch (error) {
      console.error('Failed to send push notification:', error);
      throw error;
    }
  }, [pushSubscription]);

  /**
   * Deliver email notification (placeholder)
   */
  const deliverEmailNotification = useCallback(async (
    notification: EnhancedNotification
  ) => {
    // Implementation would integrate with email service
    // e.g., SendGrid, AWS SES, etc.
    console.log('Email notification delivery:', notification);
  }, []);

  /**
   * Deliver SMS notification (placeholder)
   */
  const deliverSMSNotification = useCallback(async (
    notification: EnhancedNotification
  ) => {
    // Implementation would integrate with SMS service
    // e.g., Twilio, AWS SNS, etc.
    console.log('SMS notification delivery:', notification);
  }, []);

  /**
   * Handle notification action
   */
  const handleNotificationAction = useCallback(async (
    action: NotificationAction,
    notification: EnhancedNotification
  ) => {
    try {
      // Mark as read when action is taken
      await markAsRead(notification.id);
      
      // Handle different action types
      switch (action.type) {
        case 'primary':
          // Navigate or perform primary action
          if (action.action.startsWith('http') || action.action.startsWith('/')) {
            window.open(action.action, '_blank');
          } else {
            // Call function or emit event
            console.log('Primary action:', action.action, action.params);
          }
          break;
        default:
          console.log('Action:', action.action, action.params);
      }
    } catch (error) {
      console.error('Failed to handle notification action:', error);
    }
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('enhanced_notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, status: 'read', readAt: new Date() }
            : n
        )
      );

      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }, [supabase]);

  /**
   * Get emoji for notification type
   */
  const getEmojiForType = useCallback((type: EnhancedNotification['type']): string => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'achievement': return '🏆';
      case 'social': return '👥';
      case 'financial': return '💰';
      case 'system': return '🔧';
      default: return 'ℹ️';
    }
  }, []);

  /**
   * Load user preferences
   */
  const loadPreferences = useCallback(async () => {
    if (!primaryWallet?.address) return;

    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_wallet_address', primaryWallet.address)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences(data.preferences);
      } else {
        // Create default preferences
        const defaultPreferences: UserNotificationPreferences = {
          channels: {
            in_app: { enabled: true, frequency: 'immediate' },
            push: { enabled: false, frequency: 'immediate' },
            email: { enabled: false, frequency: 'daily' },
            sms: { enabled: false, frequency: 'immediate' },
            webhook: { enabled: false, frequency: 'immediate' }
          },
          types: {
            achievement: { enabled: true, preferredChannel: 'in_app', priority: 'high' },
            social: { enabled: true, preferredChannel: 'push', priority: 'medium' },
            financial: { enabled: true, preferredChannel: 'push', priority: 'high' },
            system: { enabled: true, preferredChannel: 'in_app', priority: 'low' }
          },
          batching: {
            enabled: true,
            maxBatchSize: 5,
            batchDelay: 5
          },
          smart: {
            personalizedContent: true,
            contextAware: true,
            learningEnabled: true
          }
        };

        setPreferences(defaultPreferences);
        await savePreferences(defaultPreferences);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }, [primaryWallet?.address, supabase]);

  /**
   * Save user preferences
   */
  const savePreferences = useCallback(async (
    newPreferences: UserNotificationPreferences
  ): Promise<boolean> => {
    if (!primaryWallet?.address) return false;

    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_wallet_address: primaryWallet.address,
          preferences: newPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setPreferences(newPreferences);
      return true;
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      return false;
    }
  }, [primaryWallet?.address, supabase]);

  // Initialize on mount
  useEffect(() => {
    if (primaryWallet?.address) {
      initializePushNotifications();
      loadPreferences();
    }
  }, [primaryWallet?.address, initializePushNotifications, loadPreferences]);

  // Setup batch processing timer
  useEffect(() => {
    const processPendingBatches = () => {
      const now = new Date();
      batches.forEach(batch => {
        if (batch.status === 'pending' && batch.scheduledFor <= now) {
          processBatch(batch.id);
        }
      });
    };

    batchTimerRef.current = setInterval(processPendingBatches, 60000); // Check every minute

    return () => {
      if (batchTimerRef.current) {
        clearInterval(batchTimerRef.current);
      }
    };
  }, [batches, processBatch]);

  return {
    // State
    notifications,
    batches,
    preferences,
    isLoading,
    pushSupported,
    pushSubscription,

    // Actions
    createNotification,
    markAsRead,
    handleNotificationAction,

    // Push notifications
    subscribeToPushNotifications,

    // Preferences
    loadPreferences,
    savePreferences,

    // Batch processing
    processBatch
  };
}

// Utility function to convert VAPID key
function urlB64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
