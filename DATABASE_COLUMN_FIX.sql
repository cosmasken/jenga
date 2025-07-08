-- Add missing columns to users table
-- Run this in your Supabase SQL Editor

-- Add missing columns that the code expects
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tutorial_steps_completed TEXT[] DEFAULT '{}';

-- Update existing records to have default values
UPDATE public.users 
SET 
  onboarding_completed = COALESCE(onboarding_completed, FALSE),
  tutorial_steps_completed = COALESCE(tutorial_steps_completed, '{}')
WHERE onboarding_completed IS NULL OR tutorial_steps_completed IS NULL;

-- Verify the columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;
