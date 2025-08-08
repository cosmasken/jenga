# 🚀 Quick Database Setup for Development

## Problem
Users were unable to onboard because the Supabase database wasn't configured properly. This caused the onboarding modal to appear every time.

## Solution
I've created a simplified development schema without RLS complications.

## Steps to Fix:

### 1. Run the Development Server
```bash
npm run dev
```

### 2. Open the App
Visit `http://localhost:5173` - you'll see a red "Development Database Setup" section on the landing page.

### 3. Set Up the Database
1. Click **"Test Database"** to see current status
2. If tables are missing, click **"Copy Setup Instructions"** 
3. Go to your Supabase dashboard → SQL Editor
4. Copy content from `dev_schema_no_rls.sql`
5. Paste and run the SQL
6. Come back and click **"Test Database"** again

### 4. Verify Everything Works
- Database should show ✅ all green
- Connect a wallet and try onboarding
- User should be saved to the database

## What Changed:

### 🔧 Fixed Files:
- `dev_schema_no_rls.sql` - New schema without RLS
- `src/hooks/useSimpleSupabase.ts` - Simplified database operations
- `src/components/DevDatabaseSetup.tsx` - Database testing component
- `src/pages/landing.tsx` - Added database setup section (dev only)

### 🎯 Key Improvements:
- **No RLS** - Removed Row Level Security for development
- **Direct Operations** - No authentication complications
- **Better Error Handling** - Clear error messages
- **Easy Testing** - Visual database status checker

## Environment Variables Required:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Tables Created:
- ✅ `users` - User profiles and onboarding status
- ✅ `achievements` - Predefined achievements 
- ✅ `user_achievements` - Earned achievements
- ✅ `notifications` - User notifications
- ✅ `activities` - Activity logging

## Next Steps for Production:
1. Enable RLS policies (use `new_db_schema.sql` instead)
2. Add proper authentication context
3. Remove development components
4. Add proper error boundaries

---

**Note:** The red database setup section only shows in development mode and will be automatically hidden in production builds.
