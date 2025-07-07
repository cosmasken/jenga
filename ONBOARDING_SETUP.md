# 🧱 Jenga Onboarding System Setup Guide

## Overview
This guide will help you set up the complete onboarding system for first-time Jenga users, including database setup, authentication, and user flow management.

## 🗄️ Database Setup (Supabase - Recommended)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users
3. Set a strong database password

### 2. Run Database Schema
1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the script to create all tables and functions

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🔧 Alternative Database Options

### Option 2: PlanetScale (MySQL)
```bash
# Install PlanetScale CLI
npm install -g @planetscale/cli

# Create database
pscale database create jenga-db

# Create branch
pscale branch create jenga-db main

# Connect and run schema
pscale shell jenga-db main
```

### Option 3: Upstash Redis (Session Storage)
```bash
# For temporary onboarding state
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

## 🚀 Integration Steps

### 1. Update Your Main App
The onboarding system is already integrated into your `Index.tsx`. It will:
- Automatically detect first-time users
- Show onboarding wizard before dashboard
- Track completion progress
- Fall back to tutorial for existing users

### 2. Customize Onboarding Steps
Edit `/src/lib/onboarding.ts` to modify:
- Step content and order
- Required vs optional steps
- User preference collection
- Progress tracking logic

### 3. Styling and Branding
The onboarding wizard uses your existing UI components and follows your orange/Bitcoin theme. Customize in:
- `/src/components/OnboardingWizard.tsx`
- Update step content, icons, and styling

## 📊 Features Included

### User Management
- ✅ Wallet-based authentication
- ✅ Profile creation and management
- ✅ Onboarding progress tracking
- ✅ User preferences storage

### Onboarding Flow
- ✅ Welcome and education steps
- ✅ Wallet setup verification
- ✅ Profile customization
- ✅ Chama education
- ✅ Preference setting

### Data Analytics
- ✅ Step completion tracking
- ✅ User journey analytics
- ✅ Reputation scoring system
- ✅ Achievement tracking

### Smart Contract Integration
- ✅ Tracks chama participation
- ✅ Builds on-chain reputation
- ✅ Links to your existing contracts

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Wallet address-based authentication
- Secure API endpoints

### Data Privacy
- Minimal data collection
- Optional email storage
- GDPR-compliant design

## 📱 Mobile Optimization

The onboarding system is fully responsive and works on:
- Desktop browsers
- Mobile web browsers
- Progressive Web App (PWA) mode

## 🧪 Testing the System

### 1. Test New User Flow
1. Clear localStorage: `localStorage.clear()`
2. Disconnect wallet and reconnect
3. Should trigger onboarding wizard

### 2. Test Returning User
1. Complete onboarding once
2. Reconnect wallet
3. Should skip to dashboard or tutorial

### 3. Test Partial Completion
1. Start onboarding but don't finish
2. Reconnect later
3. Should resume from last step

## 📈 Analytics and Monitoring

### Track Key Metrics
- Onboarding completion rate
- Step drop-off points
- Time to complete onboarding
- User engagement post-onboarding

### Supabase Analytics
```sql
-- Completion rate
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN onboarding_completed THEN 1 END) as completed,
  ROUND(COUNT(CASE WHEN onboarding_completed THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate
FROM user_profiles;

-- Step completion analysis
SELECT 
  step_name,
  COUNT(*) as completions,
  AVG(EXTRACT(EPOCH FROM completed_at - created_at)) as avg_time_seconds
FROM onboarding_progress op
JOIN user_profiles up ON op.user_id = up.id
GROUP BY step_name
ORDER BY COUNT(*) DESC;
```

## 🔄 Deployment

### Vercel Deployment
1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production
```bash
# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=your-prod-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key

# Citrea Mainnet (when available)
NEXT_PUBLIC_CITREA_RPC_URL=https://rpc.mainnet.citrea.xyz
NEXT_PUBLIC_CITREA_CHAIN_ID=mainnet-chain-id
```

## 🛠️ Customization Examples

### Add Custom Onboarding Step
```typescript
// In /src/lib/onboarding.ts
{
  id: 'kyc_verification',
  title: 'Identity Verification',
  description: 'Verify your identity for higher limits',
  component: 'KYCStep',
  required: false,
  order: 6
}
```

### Custom User Preferences
```typescript
// Add to UserProfile interface
community_role?: 'saver' | 'organizer' | 'both';
notification_frequency?: 'immediate' | 'daily' | 'weekly';
preferred_language?: 'en' | 'sw' | 'fr';
```

## 🆘 Troubleshooting

### Common Issues
1. **RLS Policies**: Ensure JWT claims include wallet_address
2. **CORS Issues**: Configure Supabase allowed origins
3. **Type Errors**: Update TypeScript definitions
4. **Mobile Issues**: Test responsive design thoroughly

### Debug Mode
Add to your `.env.local`:
```bash
NEXT_PUBLIC_DEBUG_ONBOARDING=true
```

This will enable console logging for onboarding events.

## 🎯 Next Steps

1. **Set up Supabase project** (15 minutes)
2. **Run database schema** (5 minutes)
3. **Configure environment variables** (5 minutes)
4. **Test the onboarding flow** (10 minutes)
5. **Customize for your needs** (30+ minutes)

The system is designed to work out of the box with your existing Jenga setup while providing a solid foundation for user management and analytics.

## 📞 Support

If you need help with setup or customization, the system includes comprehensive error handling and logging to help debug issues. Check the browser console for detailed error messages during development.
