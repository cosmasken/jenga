-- =====================================================
-- ENABLE RLS (Row Level Security) POLICIES FOR PRODUCTION
-- =====================================================
-- This file enables RLS policies for production deployment
-- Run this AFTER the main SUPABASE.sql for production security
-- 
-- Version: 1.0
-- Created: 2025-01-05
-- Purpose: Production security with proper RLS policies
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

-- Enable RLS on all tables for production
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS HELPER FUNCTIONS
-- =====================================================

-- Function to set user context for RLS policies
-- Note: We use a custom name to avoid conflict with built-in set_config function
CREATE OR REPLACE FUNCTION set_user_context(setting_name text, setting_value text, is_local boolean DEFAULT false)
RETURNS text AS $$
BEGIN
    PERFORM set_config(setting_name, setting_value, is_local);
    RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user wallet from context
CREATE OR REPLACE FUNCTION get_current_user_wallet()
RETURNS text AS $$
BEGIN
    RETURN current_setting('app.current_user_wallet', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users 
FOR SELECT USING (wallet_address = get_current_user_wallet());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users 
FOR UPDATE USING (wallet_address = get_current_user_wallet());

-- Users can insert their own profile (for onboarding)
CREATE POLICY "Users can insert own profile" ON users 
FOR INSERT WITH CHECK (wallet_address = get_current_user_wallet());

-- =====================================================
-- GROUPS TABLE POLICIES
-- =====================================================

-- Groups are publicly readable
CREATE POLICY "Groups are publicly readable" ON groups 
FOR SELECT USING (true);

-- Only creators can modify their groups
CREATE POLICY "Creators can modify their groups" ON groups 
FOR ALL USING (creator_wallet_address = get_current_user_wallet());

-- Users can create new groups
CREATE POLICY "Users can create groups" ON groups 
FOR INSERT WITH CHECK (creator_wallet_address = get_current_user_wallet());

-- =====================================================
-- GROUP MEMBERS TABLE POLICIES
-- =====================================================

-- Group members can view membership of groups they belong to
CREATE POLICY "Group members can view group membership" ON group_members 
FOR SELECT USING (
    wallet_address = get_current_user_wallet() OR
    group_id IN (
        SELECT group_id FROM group_members 
        WHERE wallet_address = get_current_user_wallet()
    )
);

-- Users can join groups (insert their own membership)
CREATE POLICY "Users can join groups" ON group_members 
FOR INSERT WITH CHECK (wallet_address = get_current_user_wallet());

-- Users can update their own membership
CREATE POLICY "Users can update own membership" ON group_members 
FOR UPDATE USING (wallet_address = get_current_user_wallet());

-- =====================================================
-- CONTRIBUTIONS TABLE POLICIES
-- =====================================================

-- Users can view contributions in groups they belong to
CREATE POLICY "Users can view group contributions" ON contributions 
FOR SELECT USING (
    contributor_wallet_address = get_current_user_wallet() OR
    group_id IN (
        SELECT group_id FROM group_members 
        WHERE wallet_address = get_current_user_wallet()
    )
);

-- Users can create their own contributions
CREATE POLICY "Users can create own contributions" ON contributions 
FOR INSERT WITH CHECK (contributor_wallet_address = get_current_user_wallet());

-- Users can update their own contributions
CREATE POLICY "Users can update own contributions" ON contributions 
FOR UPDATE USING (contributor_wallet_address = get_current_user_wallet());

-- =====================================================
-- DISPUTES TABLE POLICIES
-- =====================================================

-- Users can view disputes in groups they belong to
CREATE POLICY "Users can view group disputes" ON disputes 
FOR SELECT USING (
    complainant_wallet_address = get_current_user_wallet() OR
    defendant_wallet_address = get_current_user_wallet() OR
    group_id IN (
        SELECT group_id FROM group_members 
        WHERE wallet_address = get_current_user_wallet()
    )
);

-- Users can create disputes in groups they belong to
CREATE POLICY "Users can create disputes" ON disputes 
FOR INSERT WITH CHECK (
    complainant_wallet_address = get_current_user_wallet() AND
    group_id IN (
        SELECT group_id FROM group_members 
        WHERE wallet_address = get_current_user_wallet()
    )
);

-- =====================================================
-- DISPUTE VOTES TABLE POLICIES
-- =====================================================

-- Users can view votes on disputes they can see
CREATE POLICY "Users can view dispute votes" ON dispute_votes 
FOR SELECT USING (
    voter_wallet_address = get_current_user_wallet() OR
    dispute_id IN (
        SELECT id FROM disputes 
        WHERE group_id IN (
            SELECT group_id FROM group_members 
            WHERE wallet_address = get_current_user_wallet()
        )
    )
);

-- Users can vote on disputes in their groups
CREATE POLICY "Users can vote on disputes" ON dispute_votes 
FOR INSERT WITH CHECK (
    voter_wallet_address = get_current_user_wallet() AND
    dispute_id IN (
        SELECT id FROM disputes 
        WHERE group_id IN (
            SELECT group_id FROM group_members 
            WHERE wallet_address = get_current_user_wallet()
        )
    )
);

-- =====================================================
-- ACHIEVEMENTS TABLE POLICIES
-- =====================================================

-- Achievements are publicly readable
CREATE POLICY "Achievements are publicly readable" ON achievements 
FOR SELECT USING (true);

-- =====================================================
-- USER ACHIEVEMENTS TABLE POLICIES
-- =====================================================

-- Users can view their own achievements
CREATE POLICY "Users can view own achievements" ON user_achievements 
FOR SELECT USING (user_id = get_current_user_wallet());

-- System can award achievements (handled by service role)
-- Users cannot directly insert achievements

-- =====================================================
-- NOTIFICATIONS TABLE POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications 
FOR SELECT USING (user_wallet_address = get_current_user_wallet());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications 
FOR UPDATE USING (user_wallet_address = get_current_user_wallet());

-- =====================================================
-- ACTIVITY LOG TABLE POLICIES
-- =====================================================

-- Users can view their own activity
CREATE POLICY "Users can view own activity" ON activity_log 
FOR SELECT USING (actor_wallet_address = get_current_user_wallet());

-- =====================================================
-- SAVINGS GOALS TABLE POLICIES
-- =====================================================

-- Users can manage their own savings goals
CREATE POLICY "Users can manage own savings goals" ON savings_goals 
FOR ALL USING (user_wallet_address = get_current_user_wallet());

-- Public savings goals are viewable by all
CREATE POLICY "Public savings goals are viewable" ON savings_goals 
FOR SELECT USING (is_public = true);

-- =====================================================
-- SAVINGS TRANSACTIONS TABLE POLICIES
-- =====================================================

-- Users can manage their own savings transactions
CREATE POLICY "Users can manage own savings transactions" ON savings_transactions 
FOR ALL USING (user_wallet_address = get_current_user_wallet());

-- =====================================================
-- USER PREFERENCES TABLE POLICIES
-- =====================================================

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences 
FOR ALL USING (user_wallet_address = get_current_user_wallet());

-- =====================================================
-- GROUP INVITATIONS TABLE POLICIES
-- =====================================================

-- Inviters can manage their invitations
CREATE POLICY "Inviters can manage their invitations" ON group_invitations 
FOR ALL USING (inviter_wallet_address = get_current_user_wallet());

-- Invitees can view their invitations
CREATE POLICY "Invitees can view their invitations" ON group_invitations 
FOR SELECT USING (invitee_wallet_address = get_current_user_wallet());

-- =====================================================
-- REFERRALS TABLE POLICIES
-- =====================================================

-- Users can view referrals they're involved in
CREATE POLICY "Users can view referrals they're involved in" ON referrals 
FOR SELECT USING (
    referrer_wallet_address = get_current_user_wallet() OR 
    referee_wallet_address = get_current_user_wallet()
);

-- Users can create referrals as referrer
CREATE POLICY "Users can create referrals" ON referrals 
FOR INSERT WITH CHECK (referrer_wallet_address = get_current_user_wallet());

-- =====================================================
-- SYSTEM SETTINGS TABLE POLICIES
-- =====================================================

-- Public system settings are readable by all
CREATE POLICY "Public system settings are readable" ON system_settings 
FOR SELECT USING (is_public = true);

-- =====================================================
-- PLATFORM ANALYTICS TABLE POLICIES
-- =====================================================

-- Platform analytics are publicly readable
CREATE POLICY "Platform analytics are publicly readable" ON platform_analytics 
FOR SELECT USING (true);

-- =====================================================
-- REVOKE BROAD PERMISSIONS
-- =====================================================

-- Revoke the broad permissions granted for development
REVOKE ALL ON users FROM authenticated;
REVOKE ALL ON groups FROM authenticated;
REVOKE ALL ON group_members FROM authenticated;
REVOKE ALL ON contributions FROM authenticated;
REVOKE ALL ON disputes FROM authenticated;
REVOKE ALL ON dispute_votes FROM authenticated;
REVOKE ALL ON achievements FROM authenticated;
REVOKE ALL ON user_achievements FROM authenticated;
REVOKE ALL ON notifications FROM authenticated;
REVOKE ALL ON activity_log FROM authenticated;
REVOKE ALL ON system_settings FROM authenticated;
REVOKE ALL ON savings_goals FROM authenticated;
REVOKE ALL ON savings_transactions FROM authenticated;
REVOKE ALL ON user_preferences FROM authenticated;
REVOKE ALL ON group_invitations FROM authenticated;
REVOKE ALL ON referrals FROM authenticated;
REVOKE ALL ON platform_analytics FROM authenticated;

-- Grant specific permissions needed for RLS policies to work
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON group_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON contributions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON disputes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dispute_votes TO authenticated;
GRANT SELECT ON achievements TO authenticated;
GRANT SELECT ON user_achievements TO authenticated;
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT SELECT ON activity_log TO authenticated;
GRANT SELECT ON system_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON savings_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON savings_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON group_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON referrals TO authenticated;
GRANT SELECT ON platform_analytics TO authenticated;

-- =====================================================
-- CONFIRMATION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'RLS policies have been enabled successfully for production.';
    RAISE NOTICE 'All tables now use Row Level Security for data protection.';
    RAISE NOTICE 'Users can only access data they are authorized to see.';
    RAISE NOTICE 'Make sure to set app.current_user_wallet context in your application.';
END $$;

-- =====================================================
-- END OF RLS ENABLEMENT
-- =====================================================
