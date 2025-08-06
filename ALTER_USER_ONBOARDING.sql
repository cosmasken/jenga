-- ALTER.sql: Add onboarding status and improve user table structure
-- Run this script to update the users table with onboarding tracking

-- Add onboarding completion status to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add onboarding completion timestamp
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries on onboarding status
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed 
ON users(onboarding_completed);

-- Add index for wallet address queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_users_wallet_address 
ON users(wallet_address);

-- Update existing users to mark them as onboarded if they have display_name
UPDATE users 
SET onboarding_completed = TRUE, 
    onboarding_completed_at = COALESCE(updated_at, created_at)
WHERE display_name IS NOT NULL 
  AND display_name != '' 
  AND onboarding_completed = FALSE;

-- Add comment to document the change
COMMENT ON COLUMN users.onboarding_completed IS 'Tracks whether user has completed the onboarding flow';
COMMENT ON COLUMN users.onboarding_completed_at IS 'Timestamp when user completed onboarding';

-- Ensure notifications are properly filtered by user
-- Add index for faster notification queries by user
CREATE INDEX IF NOT EXISTS idx_notifications_user_wallet_address 
ON notifications(user_wallet_address);

-- Add index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_wallet_address, is_read) 
WHERE is_read = FALSE;

-- Add RLS policy to ensure users only see their own notifications (if not exists)
DO $$ 
BEGIN
    -- Check if policy exists before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can only view their own notifications'
    ) THEN
        CREATE POLICY "Users can only view their own notifications" 
        ON notifications FOR SELECT 
        USING (user_wallet_address = auth.jwt() ->> 'wallet_address');
    END IF;
END $$;

-- Add RLS policy for user achievements (if not exists)
DO $$ 
BEGIN
    -- Check if policy exists before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_achievements' 
        AND policyname = 'Users can only view their own achievements'
    ) THEN
        CREATE POLICY "Users can only view their own achievements" 
        ON user_achievements FOR SELECT 
        USING (user_id = auth.jwt() ->> 'wallet_address');
    END IF;
END $$;

-- Ensure proper data types for user_id in user_achievements table
-- Note: If user_id is currently UUID type but storing wallet addresses, 
-- we need to change it to TEXT to properly handle Ethereum addresses
DO $$ 
BEGIN
    -- Check current data type of user_id column
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
        
        -- Add comment to document the change
        COMMENT ON COLUMN user_achievements.user_id IS 'Wallet address of the user (Ethereum address format)';
    END IF;
END $$;

-- Print completion message
DO $$ 
BEGIN
    RAISE NOTICE 'Database alterations completed successfully:';
    RAISE NOTICE '- Added onboarding_completed column to users table';
    RAISE NOTICE '- Added onboarding_completed_at timestamp';
    RAISE NOTICE '- Created indexes for better performance';
    RAISE NOTICE '- Updated existing users onboarding status';
    RAISE NOTICE '- Added RLS policies for data security';
    RAISE NOTICE '- Fixed user_achievements.user_id data type if needed';
END $$;
