-- =====================================================
-- REMOVE RLS (Row Level Security) POLICIES AND SETTINGS
-- =====================================================
-- This file removes all RLS policies and disables RLS on all tables
-- for development purposes. This should be run before the main SUPABASE.sql
-- to ensure a clean state without RLS complications.
-- 
-- Version: 1.0
-- Created: 2025-01-05
-- Purpose: Development environment setup without RLS
-- =====================================================

-- =====================================================
-- DISABLE RLS ON ALL TABLES
-- =====================================================

-- Disable RLS on all tables
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contributions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS disputes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dispute_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS savings_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS savings_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS group_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS platform_analytics DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP ALL EXISTING RLS POLICIES
-- =====================================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Allow user creation during onboarding" ON users;

-- Groups table policies
DROP POLICY IF EXISTS "Groups are publicly readable" ON groups;
DROP POLICY IF EXISTS "Creators can modify their groups" ON groups;

-- Group members table policies
DROP POLICY IF EXISTS "Group members can view group membership" ON group_members;

-- Contributions table policies
DROP POLICY IF EXISTS "Users can view own contributions" ON contributions;
DROP POLICY IF EXISTS "Users can insert own contributions" ON contributions;

-- Disputes table policies
DROP POLICY IF EXISTS "Users can view disputes they're involved in" ON disputes;
DROP POLICY IF EXISTS "Users can create disputes" ON disputes;

-- Dispute votes table policies
DROP POLICY IF EXISTS "Users can view dispute votes" ON dispute_votes;
DROP POLICY IF EXISTS "Users can vote on disputes" ON dispute_votes;

-- User achievements table policies
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "System can award achievements" ON user_achievements;

-- Notifications table policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Activity log table policies
DROP POLICY IF EXISTS "Users can view own activity" ON activity_log;
DROP POLICY IF EXISTS "System can log activity" ON activity_log;

-- Savings goals table policies
DROP POLICY IF EXISTS "Users can manage own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Public savings goals are viewable" ON savings_goals;

-- Savings transactions table policies
DROP POLICY IF EXISTS "Users can manage own savings transactions" ON savings_transactions;

-- User preferences table policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;

-- Group invitations table policies
DROP POLICY IF EXISTS "Inviters can manage their invitations" ON group_invitations;
DROP POLICY IF EXISTS "Invitees can view their invitations" ON group_invitations;

-- Referrals table policies
DROP POLICY IF EXISTS "Users can view referrals they're involved in" ON referrals;

-- =====================================================
-- REMOVE RLS HELPER FUNCTIONS
-- =====================================================

-- Drop the set_config function if it exists
DROP FUNCTION IF EXISTS set_config(text, text, boolean);

-- Drop any other RLS-related functions
DROP FUNCTION IF EXISTS get_current_user_wallet();
DROP FUNCTION IF EXISTS is_user_authorized(text);

-- =====================================================
-- GRANT FULL ACCESS TO AUTHENTICATED USERS
-- =====================================================

-- Grant full access to authenticated role on all tables
-- This replaces RLS with simple role-based access

-- Core tables
GRANT ALL ON users TO authenticated;
GRANT ALL ON groups TO authenticated;
GRANT ALL ON group_members TO authenticated;
GRANT ALL ON contributions TO authenticated;
GRANT ALL ON disputes TO authenticated;
GRANT ALL ON dispute_votes TO authenticated;
GRANT ALL ON achievements TO authenticated;
GRANT ALL ON user_achievements TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON activity_log TO authenticated;
GRANT ALL ON system_settings TO authenticated;

-- Extended tables
GRANT ALL ON savings_goals TO authenticated;
GRANT ALL ON savings_transactions TO authenticated;
GRANT ALL ON user_preferences TO authenticated;
GRANT ALL ON group_invitations TO authenticated;
GRANT ALL ON referrals TO authenticated;
GRANT ALL ON platform_analytics TO authenticated;

-- Grant sequence access
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant function execution
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =====================================================
-- GRANT ACCESS TO ANON USERS (for public data)
-- =====================================================

-- Allow anonymous users to read public data
GRANT SELECT ON achievements TO anon;
GRANT SELECT ON system_settings TO anon WHERE is_public = true;
GRANT SELECT ON groups TO anon;
GRANT SELECT ON platform_analytics TO anon;

-- =====================================================
-- CONFIRMATION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'RLS policies and settings have been removed successfully.';
    RAISE NOTICE 'All tables now use simple role-based access control.';
    RAISE NOTICE 'Authenticated users have full access to all tables.';
    RAISE NOTICE 'Anonymous users have read access to public data only.';
END $$;

-- =====================================================
-- END OF RLS REMOVAL
-- =====================================================
