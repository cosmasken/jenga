-- SQL Script to Disable RLS on All Tables
-- Run this in your Supabase SQL Editor to remove RLS policies and disable RLS

-- First, drop all existing policies (this will remove the circular dependencies)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || 
                ' ON ' || quote_ident(policy_record.schemaname) || '.' || quote_ident(policy_record.tablename);
    END LOOP;
END $$;

-- Disable RLS on all main tables
ALTER TABLE public.chamas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_rounds DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_events DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on any other tables that might exist
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users (since RLS is now disabled)
-- This ensures authenticated users can perform all CRUD operations

GRANT ALL ON public.chamas TO authenticated;
GRANT ALL ON public.chama_members TO authenticated;
GRANT ALL ON public.chama_rounds TO authenticated;
GRANT ALL ON public.contributions TO authenticated;
GRANT ALL ON public.invitations TO authenticated;
GRANT ALL ON public.batch_operations TO authenticated;
GRANT ALL ON public.chama_events TO authenticated;

-- Grant usage on sequences if they exist
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Optional: Grant to anon role if you need public access (be careful with this)
-- GRANT SELECT ON public.chamas TO anon;
-- GRANT SELECT ON public.chama_members TO anon;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Show that no policies exist anymore
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
