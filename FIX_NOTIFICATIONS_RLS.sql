-- FIX_NOTIFICATIONS_RLS.sql
-- Fix missing INSERT policy for notifications table

-- Add missing INSERT policy for notifications
-- Allow system to create notifications for users
CREATE POLICY "System can create notifications" ON notifications 
FOR INSERT WITH CHECK (true);

-- Alternative: Allow users to create notifications for themselves
-- CREATE POLICY "Users can create own notifications" ON notifications 
-- FOR INSERT WITH CHECK (user_wallet_address = get_current_user_wallet());

-- Grant INSERT permission to authenticated users
GRANT INSERT ON notifications TO authenticated;

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY policyname;
