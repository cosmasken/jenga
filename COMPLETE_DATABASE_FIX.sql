-- Complete fix for foreign key constraint issues
-- Run this in your Supabase SQL Editor

-- Step 1: First, let's see what we're dealing with
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND (tc.table_name = 'users' OR ccu.table_name = 'users');

-- Step 2: Drop the problematic foreign key constraint on users.id
-- This is likely referencing auth.users from Supabase Auth
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 3: Make the id column a regular UUID column with default generation
-- First, let's make sure it can generate UUIDs
ALTER TABLE public.users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Step 4: Ensure wallet_address is unique and can be used as an identifier
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_wallet_address_unique 
ON public.users(wallet_address);

-- Step 5: Add a NOT NULL constraint to wallet_address since it's our main identifier
ALTER TABLE public.users 
ALTER COLUMN wallet_address SET NOT NULL;

-- Step 6: Verify the structure is correct
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
    AND column_name IN ('id', 'wallet_address')
ORDER BY ordinal_position;

-- Step 7: Test that we can insert a user without foreign key issues
-- (This is just a test - remove this user after testing)
INSERT INTO public.users (
    wallet_address,
    email,
    username,
    reputation_score,
    total_contributions,
    total_payouts,
    chamas_joined,
    stacking_streak,
    preferred_language,
    is_verified,
    onboarding_completed,
    tutorial_steps_completed
) VALUES (
    '0xtest123456789',
    'test@example.com',
    'testuser',
    0,
    0,
    0,
    0,
    0,
    'en',
    false,
    false,
    '{}'
) ON CONFLICT (wallet_address) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

-- Step 8: Clean up the test user
DELETE FROM public.users WHERE wallet_address = '0xtest123456789';

-- Step 9: Show final table structure
\d public.users;
