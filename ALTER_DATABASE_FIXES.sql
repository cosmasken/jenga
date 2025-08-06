-- ALTER.sql: Fix database schema issues causing errors
-- Run this script to fix the UUID/wallet address mismatch and add onboarding tracking

-- 1. Add onboarding completion status to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- 2. Fix user_achievements.user_id data type (UUID -> TEXT for wallet addresses)
DO $$ 
BEGIN
    -- Check if user_id is currently UUID type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_achievements' 
        AND column_name = 'user_id' 
        AND data_type = 'uuid'
    ) THEN
        -- Drop foreign key constraint if exists
        ALTER TABLE user_achievements 
        DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;
        
        -- Change user_id column type to TEXT to handle wallet addresses
        ALTER TABLE user_achievements 
        ALTER COLUMN user_id TYPE TEXT;
        
        RAISE NOTICE 'Changed user_achievements.user_id from UUID to TEXT';
    END IF;
END $$;

-- 3. Update existing users to mark them as onboarded if they have display_name
UPDATE users 
SET onboarding_completed = TRUE, 
    onboarding_completed_at = COALESCE(updated_at, created_at)
WHERE display_name IS NOT NULL 
  AND display_name != '' 
  AND onboarding_completed = FALSE;

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed 
ON users(onboarding_completed);

CREATE INDEX IF NOT EXISTS idx_users_wallet_address 
ON users(wallet_address);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id 
ON user_achievements(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_wallet_address 
ON notifications(user_wallet_address);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_wallet_address, is_read) 
WHERE is_read = FALSE;

-- 5. Add RLS policies to ensure proper data filtering
DO $$ 
BEGIN
    -- Policy for notifications
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can only view their own notifications'
    ) THEN
        CREATE POLICY "Users can only view their own notifications" 
        ON notifications FOR SELECT 
        USING (user_wallet_address = current_setting('app.current_user_wallet', true));
    END IF;

    -- Policy for user achievements
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_achievements' 
        AND policyname = 'Users can only view their own achievements'
    ) THEN
        CREATE POLICY "Users can only view their own achievements" 
        ON user_achievements FOR SELECT 
        USING (user_id = current_setting('app.current_user_wallet', true));
    END IF;
END $$;

-- 6. Add comments to document changes
COMMENT ON COLUMN users.onboarding_completed IS 'Tracks whether user has completed the onboarding flow';
COMMENT ON COLUMN users.onboarding_completed_at IS 'Timestamp when user completed onboarding';
COMMENT ON COLUMN user_achievements.user_id IS 'Wallet address of the user (Ethereum address format)';

-- Print completion message
DO $$ 
BEGIN
    RAISE NOTICE 'Database fixes completed:';
    RAISE NOTICE '✅ Added onboarding tracking to users table';
    RAISE NOTICE '✅ Fixed user_achievements.user_id data type (UUID -> TEXT)';
    RAISE NOTICE '✅ Updated existing users onboarding status';
    RAISE NOTICE '✅ Added performance indexes';
    RAISE NOTICE '✅ Added RLS policies for data security';
    RAISE NOTICE '⚠️  Please restart your application after running this script';
END $$;
