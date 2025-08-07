import { useState, useCallback, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { toast } from 'sonner';

// ==================================================
// TYPES (matching our new database schema)
// ==================================================

export interface UserProfile {
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
  groups_created: number;
  groups_joined: number;
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy_settings: {
    profile_public: boolean;
    stats_public: boolean;
  };
  onboarding_completed: boolean;
  onboarding_completed_at?: string;
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

export interface SimpleNotification {
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

// ==================================================
// SUPABASE CLIENT
// ==================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

let supabaseInstance: SupabaseClient | null = null;

const getSupabaseInstance = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// ==================================================
// SIMPLE SUPABASE HOOK
// ==================================================

export function useSimpleSupabase() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const { primaryWallet } = useDynamicContext();
  
  const supabase = getSupabaseInstance();

  // ==================================================
  // USER MANAGEMENT
  // ==================================================

  /**
   * Load user profile
   */
  const loadUser = useCallback(async (): Promise<UserProfile | null> => {
    if (!primaryWallet?.address) return null;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', primaryWallet.address)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error loading user:', error);
        return null;
      }

      if (data) {
        setUser(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error('❌ Failed to load user:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [primaryWallet?.address, supabase]);

  /**
   * Create or update user profile (for onboarding)
   */
  const saveUser = useCallback(async (userData: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!primaryWallet?.address) {
      toast.error('Wallet not connected');
      return null;
    }

    try {
      setLoading(true);
      
      const userPayload = {
        wallet_address: primaryWallet.address,
        last_active_at: new Date().toISOString(),
        ...userData
      };

      const { data, error } = await supabase
        .from('users')
        .upsert(userPayload, { 
          onConflict: 'wallet_address',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving user:', error);
        toast.error('Failed to save profile');
        return null;
      }

      setUser(data);
      toast.success('Profile saved successfully!');
      return data;
    } catch (err) {
      console.error('❌ Failed to save user:', err);
      toast.error('Failed to save profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [primaryWallet?.address, supabase]);

  /**
   * Complete onboarding
   */
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!primaryWallet?.address) return false;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', primaryWallet.address);

      if (error) {
        console.error('❌ Error completing onboarding:', error);
        return false;
      }

      // Reload user to get updated data
      await loadUser();
      
      // Award onboarding achievement
      await awardAchievement('Welcome to Jenga!', { profile_complete: true });
      
      return true;
    } catch (err) {
      console.error('❌ Failed to complete onboarding:', err);
      return false;
    }
  }, [primaryWallet?.address, supabase]);

  // ==================================================
  // NOTIFICATIONS
  // ==================================================

  /**
   * Load user notifications
   */
  const loadNotifications = useCallback(async (limit = 20): Promise<SimpleNotification[]> => {
    if (!primaryWallet?.address) return [];

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_wallet_address', primaryWallet.address)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error loading notifications:', error);
        return [];
      }

      setNotifications(data || []);
      return data || [];
    } catch (err) {
      console.error('❌ Failed to load notifications:', err);
      return [];
    }
  }, [primaryWallet?.address, supabase]);

  /**
   * Create notification
   */
  const createNotification = useCallback(async (
    userWalletAddress: string,
    title: string,
    message: string,
    type: SimpleNotification['type'] = 'info',
    category: string = 'general',
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
          category,
          data,
          is_read: false,
          is_sent: false,
          delivery_method: ['in_app'],
          scheduled_for: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error creating notification:', error);
        return false;
      }

      // If it's for the current user, reload notifications
      if (userWalletAddress === primaryWallet?.address) {
        await loadNotifications();
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to create notification:', err);
      return false;
    }
  }, [primaryWallet?.address, supabase, loadNotifications]);

  /**
   * Mark notification as read
   */
  const markNotificationRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Error marking notification as read:', error);
        return false;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );

      return true;
    } catch (err) {
      console.error('❌ Failed to mark notification as read:', err);
      return false;
    }
  }, [supabase]);

  // ==================================================
  // ACHIEVEMENTS
  // ==================================================

  /**
   * Award achievement to user
   */
  const awardAchievement = useCallback(async (
    achievementName: string,
    progress: Record<string, any> = {},
    transactionHash?: string
  ): Promise<boolean> => {
    if (!primaryWallet?.address) return false;

    try {
      // First, find the achievement by name
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('id, name')
        .eq('name', achievementName)
        .eq('is_active', true)
        .single();

      if (achievementError || !achievement) {
        console.error('❌ Achievement not found:', achievementName);
        return false;
      }

      // Check if user already has this achievement
      const { data: existingAchievement } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', primaryWallet.address)
        .eq('achievement_id', achievement.id)
        .single();

      if (existingAchievement) {
        console.log('ℹ️ User already has this achievement:', achievementName);
        return true;
      }

      // Award the achievement
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: primaryWallet.address,
          achievement_id: achievement.id,
          progress,
          transaction_hash: transactionHash,
          earned_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error awarding achievement:', error);
        return false;
      }

      // Create notification for the achievement
      await createNotification(
        primaryWallet.address,
        'Achievement Unlocked! 🏆',
        `You earned the "${achievement.name}" achievement!`,
        'achievement',
        'achievement',
        { achievement_id: achievement.id, achievement_name: achievement.name }
      );

      // Reload achievements
      await loadUserAchievements();

      toast.success(`Achievement unlocked: ${achievement.name}! 🏆`);
      return true;
    } catch (err) {
      console.error('❌ Failed to award achievement:', err);
      return false;
    }
  }, [primaryWallet?.address, supabase, createNotification]);

  /**
   * Load user achievements
   */
  const loadUserAchievements = useCallback(async (): Promise<UserAchievement[]> => {
    if (!primaryWallet?.address) return [];

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', primaryWallet.address)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading user achievements:', error);
        return [];
      }

      setAchievements(data || []);
      return data || [];
    } catch (err) {
      console.error('❌ Failed to load user achievements:', err);
      return [];
    }
  }, [primaryWallet?.address, supabase]);

  // ==================================================
  // ACTIVITY LOGGING
  // ==================================================

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
          description: description || `User ${action} ${entityType}`,
          metadata,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error logging activity:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to log activity:', err);
      return false;
    }
  }, [primaryWallet?.address, supabase]);

  // ==================================================
  // AUTO-LOAD DATA ON WALLET CHANGE
  // ==================================================

  useEffect(() => {
    if (primaryWallet?.address) {
      loadUser();
      loadNotifications();
      loadUserAchievements();
    } else {
      setUser(null);
      setNotifications([]);
      setAchievements([]);
    }
  }, [primaryWallet?.address, loadUser, loadNotifications, loadUserAchievements]);

  // ==================================================
  // COMPUTED VALUES
  // ==================================================

  const unreadNotificationCount = notifications.filter(n => !n.is_read).length;
  const isOnboardingComplete = user?.onboarding_completed || false;

  return {
    // State
    loading,
    user,
    notifications,
    achievements,
    unreadNotificationCount,
    isOnboardingComplete,

    // User management
    loadUser,
    saveUser,
    completeOnboarding,

    // Notifications
    loadNotifications,
    createNotification,
    markNotificationRead,

    // Achievements
    awardAchievement,
    loadUserAchievements,

    // Activity
    logActivity
  };
}
