import { useState, useCallback, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { toast } from 'sonner';
import { useErrorHandler } from '@/hooks/use-error-handler';

// Simplified types for database entities - only user and notification data
export interface User {
  id: string;
  wallet_address: string;
  email?: string;
  phone?: string;
  display_name?: string;
  avatar_url?: string;
  dynamic_user_id?: string;
  bio?: string;
  location?: string;
  preferred_language: string;
  timezone?: string;
  trust_score: number;
  total_contributions: number;
  successful_rounds: number;
  notification_preferences: Record<string, boolean>;
  privacy_settings: Record<string, boolean>;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string;
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  requirements: Record<string, any>;
  reward_points: number;
  badge_icon_url?: string;
  badge_color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
  is_hidden: boolean;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress: Record<string, any>;
  is_featured: boolean;
  transaction_hash?: string;
  achievement?: Achievement;
}

export interface Notification {
  id: string;
  user_wallet_address: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'dispute' | 'payment';
  category: string;
  data: Record<string, any>;
  action_url?: string;
  is_read: boolean;
  is_sent: boolean;
  delivery_method: string[];
  scheduled_for: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_wallet_address: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create singleton Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

const getSupabaseInstance = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log('🔧 Supabase client instance created');
  }
  return supabaseInstance;
};

export function useSupabase() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { primaryWallet } = useDynamicContext();
  const { handleError } = useErrorHandler();

  const supabase: SupabaseClient = getSupabaseInstance();

  // Set user context for RLS
  useEffect(() => {
    if (primaryWallet?.address) {
      console.log('✅ User context set for:', primaryWallet.address);
    }
  }, [primaryWallet?.address]);

  // =====================================================
  // USER OPERATIONS (Onboarding & Profile)
  // =====================================================

  /**
   * Create or update user profile
   */
  const upsertUser = useCallback(async (userData: Partial<User>): Promise<User | null> => {
    if (!primaryWallet?.address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const userPayload = {
        wallet_address: primaryWallet.address,
        last_active_at: new Date().toISOString(),
        ...userData
      };

      console.log('🔄 Upserting user with payload:', userPayload);

      const { data, error } = await supabase
        .from('users')
        .upsert(userPayload, { 
          onConflict: 'wallet_address',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ User upserted successfully:', data);
      return data;
    } catch (err) {
      const errorMessage = `Failed to upsert user: ${err}`;
      console.error('❌', errorMessage);
      setError(errorMessage);
      handleError(err, { context: 'upserting user' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, supabase, handleError]);

  /**
   * Get user by wallet address
   */
  const getUser = useCallback(async (walletAddress: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (err) {
      console.error('❌ Failed to get user:', err);
      return null;
    }
  }, [supabase]);

  /**
   * Update user trust score
   */
  const updateTrustScore = useCallback(async (walletAddress: string, newScore: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          trust_score: newScore,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('❌ Failed to update trust score:', err);
      return false;
    }
  }, [supabase]);

  // =====================================================
  // ACHIEVEMENT OPERATIONS
  // =====================================================

  /**
   * Get user achievements
   */
  const getUserAchievements = useCallback(async (walletAddress: string): Promise<UserAchievement[]> => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', walletAddress)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('❌ Failed to get user achievements:', err);
      return [];
    }
  }, [supabase]);

  /**
   * Award achievement to user
   */
  const awardAchievement = useCallback(async (
    achievementId: string,
    progress: Record<string, any> = {},
    transactionHash?: string
  ): Promise<boolean> => {
    if (!primaryWallet?.address) return false;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: primaryWallet.address,
          achievement_id: achievementId,
          progress,
          transaction_hash: transactionHash,
          earned_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('❌ Failed to award achievement:', err);
      return false;
    }
  }, [primaryWallet, supabase]);

  // =====================================================
  // NOTIFICATION OPERATIONS
  // =====================================================

  /**
   * Create notification
   */
  const createNotification = useCallback(async (
    userWalletAddress: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    data: Record<string, any> = {}
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_wallet_address: userWalletAddress,
          title,
          message,
          type,
          category: type,
          data,
          is_read: false,
          is_sent: false,
          delivery_method: ['in_app'],
          scheduled_for: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('❌ Failed to create notification:', err);
      return false;
    }
  }, [supabase]);

  /**
   * Get notifications for user
   */
  const getNotifications = useCallback(async (
    walletAddress: string,
    filters?: { limit?: number; is_read?: boolean }
  ): Promise<Notification[]> => {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_wallet_address', walletAddress)
        .order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('❌ Failed to get notifications:', err);
      return [];
    }
  }, [supabase]);

  /**
   * Mark notification as read
   */
  const markNotificationRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('❌ Failed to mark notification as read:', err);
      return false;
    }
  }, [supabase]);

  // =====================================================
  // ACTIVITY LOGGING
  // =====================================================

  /**
   * Log user activity
   */
  const logActivity = useCallback(async (
    action: string,
    entityType: string,
    entityId?: string,
    description?: string,
    metadata: Record<string, any> = {}
  ): Promise<boolean> => {
    if (!primaryWallet?.address) return false;

    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          user_wallet_address: primaryWallet.address,
          action,
          entity_type: entityType,
          entity_id: entityId,
          description: description || `${action} ${entityType}`,
          metadata
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('❌ Failed to log activity:', err);
      return false;
    }
  }, [primaryWallet, supabase]);

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  /**
   * Subscribe to user notifications
   */
  const subscribeToNotifications = useCallback((walletAddress: string, callback: (payload: any) => void) => {
    const subscription = supabase
      .channel(`notifications-${walletAddress}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_wallet_address=eq.${walletAddress}`
      }, callback)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [supabase]);

  return {
    // State
    isLoading,
    error,
    
    // User operations (onboarding & profile)
    upsertUser,
    getUser,
    updateTrustScore,
    
    // Achievement operations
    getUserAchievements,
    awardAchievement,
    
    // Notification operations
    createNotification,
    getNotifications,
    markNotificationRead,
    
    // Activity logging
    logActivity,
    
    // Real-time subscriptions
    subscribeToNotifications,
    
    // Direct Supabase client access for advanced operations
    supabase
  };
}
