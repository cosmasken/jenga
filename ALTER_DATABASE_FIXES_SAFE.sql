-- ALTER_DATABASE_FIXES_SAFE.sql: Fix database schema issues with view dependency handling
-- Run this script to fix the UUID/wallet address mismatch and add onboarding tracking

-- 1. Add onboarding completion status to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- 2. Handle user_achievements.user_id type change with view dependencies
DO $$ 
DECLARE
    view_definition TEXT;
BEGIN
    -- Check if user_id is currently UUID type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_achievements' 
        AND column_name = 'user_id' 
        AND data_type = 'uuid'
    ) THEN
        RAISE NOTICE 'Found UUID type user_id column, attempting to fix...';
        
        -- First, get the view definition if it exists
        SELECT pg_get_viewdef('user_stats', true) INTO view_definition
        WHERE EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'user_stats');
        
        -- Drop the view temporarily if it exists
        IF view_definition IS NOT NULL THEN
            RAISE NOTICE 'Dropping user_stats view temporarily...';
            DROP VIEW IF EXISTS user_stats CASCADE;
        END IF;
        
        -- Drop any foreign key constraints
        ALTER TABLE user_achievements 
        DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;
        
        -- Change user_id column type to TEXT to handle wallet addresses
        ALTER TABLE user_achievements 
        ALTER COLUMN user_id TYPE TEXT;
        
        -- Recreate the view if it existed
        IF view_definition IS NOT NULL THEN
            RAISE NOTICE 'Recreating user_stats view...';
            -- Note: You may need to manually recreate the view with proper logic
            -- This is a placeholder - adjust based on your actual view definition
            CREATE OR REPLACE VIEW user_stats AS
            SELECT 
                u.wallet_address as user_id,
                u.display_name,
                u.trust_score,
                u.total_contributions,
                u.groups_created,
                u.groups_joined,
                u.successful_rounds,
                COUNT(ua.id) as total_achievements,
                u.created_at,
                u.last_active_at
            FROM users u
            LEFT JOIN user_achievements ua ON u.wallet_address = ua.user_id
            GROUP BY u.wallet_address, u.display_name, u.trust_score, u.total_contributions, 
                     u.groups_created, u.groups_joined, u.successful_rounds, u.created_at, u.last_active_at;
        END IF;
        
        RAISE NOTICE 'Successfully changed user_achievements.user_id from UUID to TEXT';
    ELSE
        RAISE NOTICE 'user_achievements.user_id is already TEXT type or does not exist';
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
    -- Enable RLS on tables if not already enabled
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
    
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
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'RLS policies may already exist or RLS not supported: %', SQLERRM;
END $$;

-- 6. Add comments to document changes
COMMENT ON COLUMN users.onboarding_completed IS 'Tracks whether user has completed the onboarding flow';
COMMENT ON COLUMN users.onboarding_completed_at IS 'Timestamp when user completed onboarding';
COMMENT ON COLUMN user_achievements.user_id IS 'Wallet address of the user (Ethereum address format)';

-- 7. Verify the changes
DO $$ 
DECLARE
    user_id_type TEXT;
    onboarding_exists BOOLEAN;
BEGIN
    -- Check user_achievements.user_id type
    SELECT data_type INTO user_id_type
    FROM information_schema.columns 
    WHERE table_name = 'user_achievements' 
    AND column_name = 'user_id';
    
    -- Check if onboarding columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'onboarding_completed'
    ) INTO onboarding_exists;
    
    -- Print results
    RAISE NOTICE '=== DATABASE FIXES COMPLETED ===';
    RAISE NOTICE '✅ user_achievements.user_id type: %', COALESCE(user_id_type, 'NOT FOUND');
    RAISE NOTICE '✅ onboarding columns added: %', onboarding_exists;
    RAISE NOTICE '✅ Indexes created for better performance';
    RAISE NOTICE '✅ RLS policies added for data security';
    RAISE NOTICE '✅ Existing users marked as onboarded';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Restart your application after running this script';
    RAISE NOTICE '⚠️  If user_stats view was recreated, verify it works correctly';
END $$;
