# Database Fixes for Jenga ROSCA dApp

## Issues Fixed

This update resolves several critical database and performance issues:

1. **UUID Type Error**: Fixed `user_achievements.user_id` column type mismatch
2. **Event Monitor Loop**: Stopped infinite start/stop cycling
3. **Premature Achievement Queries**: Added onboarding completion check
4. **Missing Onboarding Tracking**: Added database fields to track onboarding status
5. **Notification Filtering**: Ensured users only see their own notifications

## Required Database Changes

**⚠️ IMPORTANT**: You must run the database alteration script before using the updated application.

### Step 1: Run Database Alterations

Connect to your Supabase database and run the SQL script:

```sql
-- Copy and paste the contents of ALTER_DATABASE_FIXES.sql
-- into your Supabase SQL editor and execute
```

Or if using psql:

```bash
psql -h your-supabase-host -U postgres -d postgres -f ALTER_DATABASE_FIXES.sql
```

### Step 2: Verify Changes

After running the script, verify the changes:

```sql
-- Check if onboarding columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('onboarding_completed', 'onboarding_completed_at');

-- Check if user_achievements.user_id is now TEXT
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_achievements' 
AND column_name = 'user_id';

-- Check existing users onboarding status
SELECT wallet_address, display_name, onboarding_completed 
FROM users 
LIMIT 5;
```

### Step 3: Restart Application

After running the database script:

1. Stop your development server
2. Clear any cached data: `rm -rf node_modules/.cache`
3. Restart: `npm run dev`

## Changes Made to Code

### 1. Fixed Event Monitoring Loop

**File**: `src/hooks/use-event-listener.ts`
- Removed function dependencies from useEffect to prevent infinite re-renders
- Event monitoring will now start/stop properly without cycling

### 2. Added Onboarding Checks

**File**: `src/hooks/useSupabase.ts`
- `getUserAchievements()` now checks if user completed onboarding first
- `upsertUser()` automatically sets onboarding completion when display_name is provided
- Added `onboarding_completed` and `onboarding_completed_at` fields to User interface

**File**: `src/pages/dashboard.tsx`
- Added extra safety check before querying achievements
- Only loads achievements for users who completed onboarding

### 3. Database Schema Fixes

**File**: `ALTER_DATABASE_FIXES.sql`
- Changes `user_achievements.user_id` from UUID to TEXT to handle Ethereum addresses
- Adds onboarding tracking columns to users table
- Updates existing users' onboarding status
- Adds performance indexes
- Adds RLS policies for data security

## Error Resolution

### Before Fix:
```
❌ Failed to get user achievements: {
  code: '22P02', 
  message: 'invalid input syntax for type uuid: "0x2A858aE2A93Ae00d072D09377227A13b2136Af53"'
}
🔍 Event monitoring started
⏹️ Stopping event monitoring...
🔍 Starting event monitoring...
⏹️ Stopping event monitoring...
[infinite loop continues...]
```

### After Fix:
```
✅ User not onboarded yet, skipping achievements query
🔍 Event monitoring started
✅ Recent notifications loaded: 1
✅ Dashboard stats calculated
[stable, no loops]
```

## Testing

After applying the fixes:

1. **New Users**: Should complete onboarding without errors
2. **Existing Users**: Should see their achievements load properly
3. **Event Monitoring**: Should start once and remain stable
4. **Notifications**: Should only show user's own notifications
5. **No More Refresh Issues**: Page should load smoothly without forced refreshes

## Rollback (if needed)

If you need to rollback the user_achievements column type:

```sql
-- Only run this if you need to rollback
ALTER TABLE user_achievements 
ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
```

**Note**: This will only work if all existing user_id values are valid UUIDs.
