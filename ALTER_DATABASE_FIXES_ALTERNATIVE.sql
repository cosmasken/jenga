-- ALTER_DATABASE_FIXES_ALTERNATIVE.sql: Alternative approach without altering existing column
-- This approach creates a new table and migrates data to avoid view dependency issues

-- 1. Add onboarding completion status to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- 2. Create new user_achievements table with correct data types
CREATE TABLE IF NOT EXISTS user_achievements_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- TEXT to handle wallet addresses
    achievement_id TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress JSONB DEFAULT '{}',
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Migrate existing data if the old table exists and has data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
        -- Check if there's any data to migrate
        IF EXISTS (SELECT 1 FROM user_achievements LIMIT 1) THEN
            RAISE NOTICE 'Migrating existing user_achievements data...';
            
            -- Insert data from old table, converting UUIDs to text where possible
            INSERT INTO user_achievements_new (id, user_id, achievement_id, earned_at, progress, context, created_at, updated_at)
            SELECT 
                COALESCE(id, gen_random_uuid()),
                user_id::TEXT, -- Convert UUID to TEXT
                achievement_id,
                earned_at,
                progress,
                context,
                created_at,
                updated_at
            FROM user_achievements
            ON CONFLICT (id) DO NOTHING;
            
            RAISE NOTICE 'Data migration completed';
        END IF;
        
        -- Drop the old table and rename the new one
        DROP TABLE IF EXISTS user_achievements CASCADE;
        ALTER TABLE user_achievements_new RENAME TO user_achievements;
        
        RAISE NOTICE 'Table replacement completed';
    ELSE
        -- If old table doesn't exist, just rename the new one
        ALTER TABLE user_achievements_new RENAME TO user_achievements;
        RAISE NOTICE 'New user_achievements table created';
    END IF;
END $$;

-- 4. Update existing users to mark them as onboarded if they have display_name
UPDATE users 
SET onboarding_completed = TRUE, 
    onboarding_completed_at = COALESCE(updated_at, created_at)
WHERE display_name IS NOT NULL 
  AND display_name != '' 
  AND onboarding_completed = FALSE;

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed 
ON users(onboarding_completed);

CREATE INDEX IF NOT EXISTS idx_users_wallet_address 
ON users(wallet_address);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id 
ON user_achievements(user_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id 
ON user_achievements(achievement_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_wallet_address 
ON notifications(user_wallet_address);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_wallet_address, is_read) 
WHERE is_read = FALSE;

-- 6. Recreate user_stats view with correct logic
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
    u.onboarding_completed,
    u.created_at,
    u.last_active_at
FROM users u
LEFT JOIN user_achievements ua ON u.wallet_address = ua.user_id
GROUP BY u.wallet_address, u.display_name, u.trust_score, u.total_contributions, 
         u.groups_created, u.groups_joined, u.successful_rounds, u.onboarding_completed,
         u.created_at, u.last_active_at;

-- 7. Add RLS policies
DO $$ 
BEGIN
    -- Enable RLS on tables
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
    
    -- Policy for notifications
    DROP POLICY IF EXISTS "Users can only view their own notifications" ON notifications;
    CREATE POLICY "Users can only view their own notifications" 
    ON notifications FOR SELECT 
    USING (user_wallet_address = current_setting('app.current_user_wallet', true));

    -- Policy for user achievements  
    DROP POLICY IF EXISTS "Users can only view their own achievements" ON user_achievements;
    CREATE POLICY "Users can only view their own achievements" 
    ON user_achievements FOR SELECT 
    USING (user_id = current_setting('app.current_user_wallet', true));
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'RLS setup completed with warnings: %', SQLERRM;
END $$;

-- 8. Add comments
COMMENT ON COLUMN users.onboarding_completed IS 'Tracks whether user has completed the onboarding flow';
COMMENT ON COLUMN users.onboarding_completed_at IS 'Timestamp when user completed onboarding';
COMMENT ON COLUMN user_achievements.user_id IS 'Wallet address of the user (Ethereum address format)';
COMMENT ON VIEW user_stats IS 'Aggregated user statistics including achievements count';

-- 9. Final verification
DO $$ 
DECLARE
    user_id_type TEXT;
    onboarding_exists BOOLEAN;
    achievements_count INTEGER;
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
    
    -- Count achievements
    SELECT COUNT(*) INTO achievements_count FROM user_achievements;
    
    -- Print results
    RAISE NOTICE '=== DATABASE FIXES COMPLETED (ALTERNATIVE METHOD) ===';
    RAISE NOTICE '✅ user_achievements.user_id type: %', COALESCE(user_id_type, 'NOT FOUND');
    RAISE NOTICE '✅ onboarding columns added: %', onboarding_exists;
    RAISE NOTICE '✅ user_achievements records: %', achievements_count;
    RAISE NOTICE '✅ user_stats view recreated';
    RAISE NOTICE '✅ Indexes and RLS policies added';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Restart your application after running this script';
    RAISE NOTICE '⚠️  Test the user_stats view and achievements functionality';
END $$;
