-- Fix foreign key constraint issue on users table
-- Run this in your Supabase SQL Editor

-- First, let's see what foreign key constraints exist on the users table
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
    AND tc.table_name = 'users';

-- Drop the foreign key constraint that's causing issues
-- (This is likely referencing auth.users from Supabase Auth)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_pkey;

-- Make sure id column can be a regular UUID with default generation
ALTER TABLE public.users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Recreate primary key constraint
ALTER TABLE public.users 
ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Ensure wallet_address is unique (this should be our main identifier)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_wallet_address_unique 
ON public.users(wallet_address);

-- Verify the changes
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
