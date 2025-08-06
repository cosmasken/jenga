/**
 * Supabase Hook for Frontend Interactions
 * Provides comprehensive database operations for off-chain functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useRoscaToast } from '@/hooks/use-rosca-toast';
import { useErrorHandler } from '@/hooks/use-error-handler';

// Types for database entities
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
  groups_created: number;
  groups_joined: number;
  successful_rounds: number;
  notification_preferences: Record<string, boolean>;
  privacy_settings: Record<string, boolean>;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string;
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

export interface Group {
  id: string;
  chain_group_id?: number;
  name: string;
  description?: string;
  creator_wallet_address: string;
  contribution_amount: number;
  token_address: string;
  round_length_days: number;
  max_members: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  current_round: number;
  current_members: number;
  total_contributed: number;
  tags: string[];
  category: string;
  is_private: boolean;
  invite_code?: string;
  transaction_hash?: string;
  block_number?: number;
  is_synced: boolean;
  sync_error?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  wallet_address: string;
  joined_at: string;
  member_index?: number;
  is_active: boolean;
  total_contributed: number;
  contributions_made: number;
  missed_contributions: number;
  payout_round?: number;
  payout_amount?: number;
  payout_received_at?: string;
  payout_transaction_hash?: string;
  status: 'active' | 'inactive' | 'left' | 'kicked';
  left_at?: string;
  left_reason?: string;
}

export interface Contribution {
  id: string;
  group_id: string;
  contributor_wallet_address: string;
  round_number: number;
  amount: number;
  transaction_hash?: string;
  block_number?: number;
  gas_used?: number;
  gas_price?: number;
  status: 'pending' | 'confirmed' | 'failed';
  confirmation_count: number;
  created_at: string;
  confirmed_at?: string;
}

export interface Dispute {
  id: string;
  group_id: string;
  title: string;
  description: string;
  category: 'missed_payment' | 'unfair_payout' | 'member_behavior' | 'technical_issue' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  complainant_wallet_address: string;
  defendant_wallet_address?: string;
  affected_members: string[];
  evidence: any[];
  supporting_documents: string[];
  status: 'open' | 'investigating' | 'voting' | 'resolved' | 'closed';
  resolution?: string;
  resolution_type?: 'warning' | 'penalty' | 'removal' | 'compensation' | 'no_action';
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  voting_deadline?: string;
  assigned_moderator?: string;
  priority: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'contribution' | 'social' | 'milestone' | 'special' | 'governance';
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
  group_id?: string;
  transaction_hash?: string;
  achievement?: Achievement;
}

export interface Notification {
  id: string;
  user_wallet_address: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'group' | 'dispute' | 'payment';
  category: string;
  data: Record<string, any>;
  action_url?: string;
  is_read: boolean;
  is_sent: boolean;
  delivery_method: string[];
  scheduled_for: string;
  expires_at?: string;
  group_id?: string;
  dispute_id?: string;
  created_at: string;
  read_at?: string;
  sent_at?: string;
}

export interface ActivityLog {
  id: string;
  actor_wallet_address?: string;
  actor_type: 'user' | 'system' | 'admin';
  action: string;
  entity_type: string;
  entity_id?: string;
  description?: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  group_id?: string;
  created_at: string;
}

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient | null = null;

const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing. Please check environment variables.');
    }
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
};

/**
 * Main Supabase hook for frontend interactions
 */
export function useSupabase() {
  const { primaryWallet, user } = useDynamicContext();
  const toast = useRoscaToast();
  const { handleError } = useErrorHandler();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  // Set user context for RLS policies (simplified for development)
  const setUserContext = useCallback(async () => {
    if (primaryWallet?.address) {
      try {
        console.log('✅ User context set for:', primaryWallet.address);
        // For now, we'll skip the RLS context setting since we disabled RLS
        // This can be re-enabled later when we have proper RLS policies
      } catch (error) {
        console.warn('⚠️ Error setting user context:', error);
      }
    }
  }, [primaryWallet?.address]);

  // Initialize user context when wallet connects
  useEffect(() => {
    setUserContext();
  }, [setUserContext]);

  // =====================================================
  // USER OPERATIONS
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
      // Check if this is an onboarding completion (has display_name)
      const isOnboardingComplete = userData.display_name && userData.display_name.trim().length > 0;
      
      const userPayload = {
        wallet_address: primaryWallet.address,
        dynamic_user_id: user?.userId,
        email: user?.email,
        display_name: userData.display_name || user?.email || `${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`,
        last_active_at: new Date().toISOString(),
        // Set onboarding completion if display_name is provided
        ...(isOnboardingComplete && {
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        }),
        ...userData
      };

      console.log('🔄 Upserting user with payload:', userPayload);

      // Simple upsert without RLS complications
      const { data, error } = await supabase
        .from('users')
        .upsert(userPayload, { 
          onConflict: 'wallet_address',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase upsert error:', error);
        throw error;
      }

      console.log('✅ User upserted successfully:', data);
      return data;
    } catch (err: any) {
      const errorMessage = `Failed to update user profile: ${err.message || err}`;
      console.error('❌', errorMessage, err);
      setError(errorMessage);
      handleError(err, { context: 'upserting user' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, user, supabase, handleError]);

  /**
   * Get user profile
   */
  const getUser = useCallback(async (walletAddress?: string): Promise<User | null> => {
    const address = walletAddress || primaryWallet?.address;
    if (!address) return null;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (err) {
      console.error('❌ Failed to get user:', err);
      return null;
    }
  }, [primaryWallet?.address, supabase]);

  /**
   * Update user trust score
   */
  const updateTrustScore = useCallback(async (walletAddress: string): Promise<number | null> => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_trust_score', { user_wallet: walletAddress });

      if (error) throw error;

      // Update the user's trust score
      await supabase
        .from('users')
        .update({ trust_score: data })
        .eq('wallet_address', walletAddress);

      return data;
    } catch (err) {
      console.error('❌ Failed to update trust score:', err);
      return null;
    }
  }, [supabase]);

  // =====================================================
  // GROUP OPERATIONS
  // =====================================================

  /**
   * Create a new group
   */
  const createGroup = useCallback(async (groupData: Partial<Group>): Promise<Group | null> => {
    if (!primaryWallet?.address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const groupPayload = {
        creator_wallet_address: primaryWallet.address,
        status: 'pending' as const,
        current_members: 1,
        total_contributed: 0,
        is_synced: false,
        ...groupData
      };

      const { data, error } = await supabase
        .from('groups')
        .insert(groupPayload)
        .select()
        .single();

      if (error) throw error;

      // Add creator as first member
      await supabase
        .from('group_members')
        .insert({
          group_id: data.id,
          wallet_address: primaryWallet.address,
          member_index: 0,
          is_active: true,
          status: 'active'
        });

      // Log activity
      await logActivity('group_created', 'group', data.id, 'Created new ROSCA group', { group_name: data.name });

      console.log('✅ Group created:', data);
      toast.success('Group Created!', `${data.name} has been created successfully.`);
      return data;
    } catch (err) {
      const errorMessage = `Failed to create group: ${err}`;
      console.error('❌', errorMessage);
      setError(errorMessage);
      handleError(err, { context: 'creating group' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, supabase, toast, handleError]);

  /**
   * Get groups (with optional filters)
   */
  const getGroups = useCallback(async (filters?: {
    status?: string;
    creator?: string;
    category?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<Group[]> => {
    try {
      let query = supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.creator) {
        query = query.eq('creator_wallet_address', filters.creator);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('❌ Failed to get groups:', err);
      return [];
    }
  }, [supabase]);

  /**
   * Join a group
   */
  const joinGroup = useCallback(async (groupId: string): Promise<boolean> => {
    if (!primaryWallet?.address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('wallet_address', primaryWallet.address)
        .single();

      if (existingMember) {
        toast.error('Already a Member', 'You are already a member of this group.');
        return false;
      }

      // Get group info
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      if (group.current_members >= group.max_members) {
        toast.error('Group Full', 'This group has reached its maximum capacity.');
        return false;
      }

      // Add member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          wallet_address: primaryWallet.address,
          member_index: group.current_members,
          is_active: true,
          status: 'active'
        });

      if (memberError) throw memberError;

      // Update group member count
      const { error: updateError } = await supabase
        .from('groups')
        .update({ current_members: group.current_members + 1 })
        .eq('id', groupId);

      if (updateError) throw updateError;

      // Log activity
      await logActivity('group_joined', 'group', groupId, 'Joined ROSCA group', { group_name: group.name });

      console.log('✅ Joined group:', groupId);
      toast.success('Joined Group!', `You have successfully joined ${group.name}.`);
      return true;
    } catch (err) {
      const errorMessage = `Failed to join group: ${err}`;
      console.error('❌', errorMessage);
      setError(errorMessage);
      handleError(err, { context: 'joining group' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, supabase, toast, handleError]);

  // =====================================================
  // CONTRIBUTION OPERATIONS
  // =====================================================

  /**
   * Record a contribution
   */
  const recordContribution = useCallback(async (contributionData: {
    group_id: string;
    round_number: number;
    amount: number;
    transaction_hash?: string;
    block_number?: number;
  }): Promise<Contribution | null> => {
    if (!primaryWallet?.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const { data, error } = await supabase
        .from('contributions')
        .insert({
          contributor_wallet_address: primaryWallet.address,
          status: contributionData.transaction_hash ? 'pending' : 'confirmed',
          ...contributionData
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await logActivity('contribution_made', 'contribution', data.id, 'Made contribution to group', {
        amount: contributionData.amount,
        round: contributionData.round_number
      });

      console.log('✅ Contribution recorded:', data);
      return data;
    } catch (err) {
      console.error('❌ Failed to record contribution:', err);
      handleError(err, { context: 'recording contribution' });
      return null;
    }
  }, [primaryWallet, supabase, handleError]);

  /**
   * Update contribution status
   */
  const updateContributionStatus = useCallback(async (
    contributionId: string,
    status: 'pending' | 'confirmed' | 'failed',
    confirmationData?: {
      block_number?: number;
      gas_used?: number;
      gas_price?: number;
      confirmation_count?: number;
    }
  ): Promise<boolean> => {
    try {
      const updateData: any = { status };
      
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      }
      
      if (confirmationData) {
        Object.assign(updateData, confirmationData);
      }

      const { error } = await supabase
        .from('contributions')
        .update(updateData)
        .eq('id', contributionId);

      if (error) throw error;

      console.log('✅ Contribution status updated:', contributionId, status);
      return true;
    } catch (err) {
      console.error('❌ Failed to update contribution status:', err);
      return false;
    }
  }, [supabase]);

  // =====================================================
  // ACHIEVEMENT OPERATIONS
  // =====================================================

  /**
   * Get user achievements - only for onboarded users
   */
  const getUserAchievements = useCallback(async (walletAddress?: string): Promise<UserAchievement[]> => {
    const address = walletAddress || primaryWallet?.address;
    if (!address) return [];

    try {
      // First check if user is onboarded
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('wallet_address', address)
        .single();

      if (userError || !userData?.onboarding_completed) {
        console.log('🔍 User not onboarded yet, skipping achievements query');
        return [];
      }

      // Query achievements using wallet address (TEXT field, not UUID)
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', address) // user_id should be TEXT field containing wallet address
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('❌ Failed to get user achievements:', err);
      return [];
    }
  }, [primaryWallet?.address, supabase]);

  /**
   * Award achievement to user
   */
  const awardAchievement = useCallback(async (
    achievementId: string,
    userId: string,
    context?: {
      group_id?: string;
      transaction_hash?: string;
      progress?: Record<string, any>;
    }
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          ...context
        });

      if (error && error.code !== '23505') throw error; // 23505 = unique violation (already has achievement)

      // Get achievement details for notification
      const { data: achievement } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();

      if (achievement) {
        // Create notification
        await createNotification({
          user_wallet_address: userId,
          title: 'Achievement Unlocked!',
          message: `You've earned the "${achievement.name}" achievement!`,
          type: 'achievement',
          category: 'gamification',
          data: { achievement_id: achievementId, achievement_name: achievement.name }
        });

        console.log('✅ Achievement awarded:', achievement.name, 'to', userId);
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to award achievement:', err);
      return false;
    }
  }, [supabase]);

  // =====================================================
  // NOTIFICATION OPERATIONS
  // =====================================================

  /**
   * Create notification
   */
  const createNotification = useCallback(async (notificationData: Partial<Notification>): Promise<Notification | null> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Notification created:', data);
      return data;
    } catch (err) {
      console.error('❌ Failed to create notification:', err);
      return null;
    }
  }, [supabase]);

  /**
   * Get user notifications
   */
  const getNotifications = useCallback(async (
    walletAddress?: string,
    filters?: { is_read?: boolean; type?: string; limit?: number }
  ): Promise<Notification[]> => {
    const address = walletAddress || primaryWallet?.address;
    if (!address) return [];

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_wallet_address', address)
        .order('created_at', { ascending: false });

      if (filters?.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('❌ Failed to get notifications:', err);
      return [];
    }
  }, [primaryWallet?.address, supabase]);

  /**
   * Mark notification as read
   */
  const markNotificationRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('❌ Failed to mark notification as read:', err);
      return false;
    }
  }, [supabase]);

  // =====================================================
  // DISPUTE OPERATIONS
  // =====================================================

  /**
   * Create dispute
   */
  const createDispute = useCallback(async (disputeData: Partial<Dispute>): Promise<Dispute | null> => {
    if (!primaryWallet?.address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('disputes')
        .insert({
          complainant_wallet_address: primaryWallet.address,
          status: 'open',
          votes_for: 0,
          votes_against: 0,
          votes_abstain: 0,
          priority: 3,
          ...disputeData
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await logActivity('dispute_created', 'dispute', data.id, 'Created new dispute', {
        category: data.category,
        severity: data.severity
      });

      console.log('✅ Dispute created:', data);
      toast.success('Dispute Created', 'Your dispute has been submitted for review.');
      return data;
    } catch (err) {
      const errorMessage = `Failed to create dispute: ${err}`;
      console.error('❌', errorMessage);
      setError(errorMessage);
      handleError(err, { context: 'creating dispute' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, supabase, toast, handleError]);

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
    metadata?: Record<string, any>
  ): Promise<void> => {
    try {
      await supabase
        .from('activity_log')
        .insert({
          actor_wallet_address: primaryWallet?.address,
          actor_type: 'user',
          action,
          entity_type: entityType,
          entity_id: entityId,
          description,
          metadata: metadata || {},
          created_at: new Date().toISOString()
        });
    } catch (err) {
      console.error('❌ Failed to log activity:', err);
      // Don't throw error for logging failures
    }
  }, [primaryWallet?.address, supabase]);

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  /**
   * Subscribe to group updates
   */
  const subscribeToGroup = useCallback((groupId: string, callback: (payload: any) => void) => {
    const subscription = supabase
      .channel(`group-${groupId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'groups',
        filter: `id=eq.${groupId}`
      }, callback)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [supabase]);

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
    
    // User operations
    upsertUser,
    getUser,
    updateTrustScore,
    
    // Group operations
    createGroup,
    getGroups,
    joinGroup,
    
    // Contribution operations
    recordContribution,
    updateContributionStatus,
    
    // Achievement operations
    getUserAchievements,
    awardAchievement,
    
    // Notification operations
    createNotification,
    getNotifications,
    markNotificationRead,
    
    // Dispute operations
    createDispute,
    
    // Activity logging
    logActivity,
    
    // Real-time subscriptions
    subscribeToGroup,
    subscribeToNotifications,
    
    // Direct Supabase client access for advanced operations
    supabase
  };
}
