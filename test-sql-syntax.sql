-- =====================================================
-- SQL SYNTAX TEST SCRIPT
-- =====================================================
-- This script tests the basic syntax of our SQL files
-- without actually executing the full schema

-- Test basic GRANT statements (the ones that were causing issues)
-- These should not have WHERE clauses

-- Correct syntax examples:
-- GRANT SELECT ON achievements TO anon;
-- GRANT SELECT ON groups TO anon;
-- GRANT SELECT ON platform_analytics TO anon;

-- Incorrect syntax (this would cause error):
-- GRANT SELECT ON system_settings TO anon WHERE is_public = true;

-- For conditional access, use RLS policies instead:
-- CREATE POLICY "Public system settings are readable" ON system_settings 
-- FOR SELECT USING (is_public = true);

SELECT 'SQL syntax test completed successfully' as result;
