-- Migration: Remove group-related tables and simplify database
-- Date: 2025-08-06
-- Purpose: Separate on-chain and off-chain data - keep only user onboarding and notifications

-- Step 1: Drop group-related tables (order matters due to foreign keys)
DROP TABLE IF EXISTS contributions CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

-- Step 2: Update users table to remove group-related columns
ALTER TABLE users 
DROP COLUMN IF EXISTS groups_created,
DROP COLUMN IF EXISTS groups_joined;

-- Step 3: Update user_achievements table to remove group_id reference
ALTER TABLE user_achievements 
DROP COLUMN IF EXISTS group_id;

-- Step 4: Update notifications table to remove group_id reference  
ALTER TABLE notifications
DROP COLUMN IF EXISTS group_id;

-- Step 5: Create optimized indexes for remaining tables
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_notifications_user_wallet ON notifications(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_wallet ON activities(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Step 6: Update RLS policies to be simpler and more secure

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (wallet_address = current_setting('app.current_user_wallet', true));

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (wallet_address = current_setting('app.current_user_wallet', true));

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_user_wallet', true));

-- Notifications table policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_wallet_address = current_setting('app.current_user_wallet', true));

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_wallet_address = current_setting('app.current_user_wallet', true));

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- Allow system to create notifications for any user

-- Activities table policies (read-only for users, insert for system)
DROP POLICY IF EXISTS "Users can view own activities" ON activities;
DROP POLICY IF EXISTS "System can log activities" ON activities;

CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (user_wallet_address = current_setting('app.current_user_wallet', true));

CREATE POLICY "System can log activities" ON activities
  FOR INSERT WITH CHECK (true); -- Allow system to log activities

-- User achievements table policies
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "System can award achievements" ON user_achievements;

CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (user_id = current_setting('app.current_user_wallet', true));

CREATE POLICY "System can award achievements" ON user_achievements
  FOR INSERT WITH CHECK (true); -- Allow system to award achievements

-- Achievements table (read-only for all)
DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- Step 7: Add helpful comments
COMMENT ON TABLE users IS 'User profiles and onboarding data - no group data stored here';
COMMENT ON TABLE notifications IS 'User notifications for UI/UX - no group references';
COMMENT ON TABLE activities IS 'User activity logging for analytics - generic entity tracking';
COMMENT ON TABLE user_achievements IS 'User achievements and gamification - no group references';
COMMENT ON TABLE achievements IS 'Achievement definitions for gamification system';

-- Step 8: Verify table structure
DO $$
BEGIN
    -- Check that group tables are gone
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name IN ('groups', 'group_members', 'contributions')) THEN
        RAISE EXCEPTION 'Group tables still exist after migration';
    END IF;
    
    -- Check that group columns are removed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('groups_created', 'groups_joined')) THEN
        RAISE EXCEPTION 'Group columns still exist in users table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'group_id') THEN
        RAISE EXCEPTION 'group_id column still exists in notifications table';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully - database simplified to user onboarding and notifications only';
END $$;
