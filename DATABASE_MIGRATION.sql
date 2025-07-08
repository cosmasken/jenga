-- Migration script to add missing columns to users table
-- Run this in your Supabase SQL Editor

-- Add missing columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tutorial_steps_completed TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS chama_preferences JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT NULL;

-- Update existing records to have default values
UPDATE public.users 
SET 
  onboarding_completed = FALSE,
  tutorial_steps_completed = '{}',
  chama_preferences = NULL
WHERE onboarding_completed IS NULL;

-- Create onboarding_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT NULL
);

-- Enable RLS on onboarding_progress
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Create policy for onboarding_progress
CREATE POLICY "Users can view their onboarding progress" ON public.onboarding_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their onboarding progress" ON public.onboarding_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON public.onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_step ON public.onboarding_progress(step_name);

-- Update the users table trigger to handle new columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure trigger exists
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
