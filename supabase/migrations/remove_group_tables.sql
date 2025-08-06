-- Migration to remove group-related tables and simplify database
-- This keeps only user onboarding and notification data

-- Drop group-related tables
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS contributions CASCADE;

-- Update users table to remove group-related columns
ALTER TABLE users 
DROP COLUMN IF EXISTS groups_created,
DROP COLUMN IF EXISTS groups_joined;

-- Update user_achievements table to remove group_id reference
ALTER TABLE user_achievements 
DROP COLUMN IF EXISTS group_id;

-- Update notifications table to remove group_id reference  
ALTER TABLE notifications
DROP COLUMN IF EXISTS group_id;

-- Update activities table to be more generic (keep for analytics)
-- No changes needed - activities table is generic enough

-- Create indexes for better performance on remaining tables
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_notifications_user_wallet ON notifications(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_activities_user_wallet ON activities(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Update RLS policies to be simpler
-- Users can only access their own data
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (wallet_address = current_setting('app.current_user_wallet', true));

DROP POLICY IF EXISTS "Users can update own profile" ON users;  
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (wallet_address = current_setting('app.current_user_wallet', true));

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_user_wallet', true));

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_wallet_address = current_setting('app.current_user_wallet', true));

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_wallet_address = current_setting('app.current_user_wallet', true));

-- Activities policies (read-only for users)
DROP POLICY IF EXISTS "Users can view own activities" ON activities;
CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (user_wallet_address = current_setting('app.current_user_wallet', true));

-- User achievements policies
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (user_id = current_setting('app.current_user_wallet', true));

COMMENT ON TABLE users IS 'User profiles and onboarding data only';
COMMENT ON TABLE notifications IS 'User notifications for UI/UX';
COMMENT ON TABLE activities IS 'User activity logging for analytics';
COMMENT ON TABLE user_achievements IS 'User achievements and gamification';
COMMENT ON TABLE achievements IS 'Achievement definitions';
