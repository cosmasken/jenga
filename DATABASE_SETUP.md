# 🗄️ Jenga Supabase Database Setup Guide

## 📋 Overview

This guide will help you set up a complete Supabase database for your Jenga Bitcoin-native community lending circles application. The database will support user management, chama circles, stacking records, P2P transactions, and more.

## 🚀 Getting Started

### Step 1: Create Supabase Project

1. **Go to [Supabase](https://supabase.com)**
2. **Sign up/Login** to your account
3. **Click "New Project"**
4. **Fill in project details:**
   - Project Name: `jenga-bitcoin-circles`
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to your users
   - Pricing Plan: Start with Free tier

5. **Wait for project creation** (2-3 minutes)

### Step 2: Get Project Credentials

Once your project is ready:

1. **Go to Settings → API**
2. **Copy these values:**
   ```
   Project URL: https://your-project-id.supabase.co
   Project API Key (anon public): eyJ...
   Project API Key (service_role): eyJ... (keep secret!)
   ```

3. **Save these in your `.env` file:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

## 🏗️ Database Schema

### Step 3: Create Tables

Go to **SQL Editor** in your Supabase dashboard and run these SQL commands:

#### 1. Users Table (extends Supabase auth.users)
```sql
-- Create users profile table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  wallet_address TEXT UNIQUE,
  email TEXT,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  reputation_score INTEGER DEFAULT 0,
  total_contributions DECIMAL DEFAULT 0,
  total_payouts DECIMAL DEFAULT 0,
  chamas_joined INTEGER DEFAULT 0,
  stacking_streak INTEGER DEFAULT 0,
  preferred_language TEXT DEFAULT 'en',
  location TEXT,
  phone_number TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read/update their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 2. Chamas (Savings Circles) Table
```sql
-- Create chamas table
CREATE TABLE public.chamas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES public.users(id) NOT NULL,
  contribution_amount DECIMAL NOT NULL,
  payout_frequency TEXT NOT NULL CHECK (payout_frequency IN ('weekly', 'monthly', 'quarterly')),
  max_members INTEGER NOT NULL DEFAULT 10,
  current_members INTEGER DEFAULT 1,
  category TEXT CHECK (category IN ('business', 'personal', 'education', 'emergency')),
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  next_payout_date DATE,
  current_round INTEGER DEFAULT 1,
  total_rounds INTEGER,
  contract_address TEXT,
  total_pool_amount DECIMAL DEFAULT 0,
  rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chamas ENABLE ROW LEVEL SECURITY;

-- Policies for chamas
CREATE POLICY "Anyone can view public chamas" ON public.chamas
  FOR SELECT USING (is_public = TRUE OR creator_id = auth.uid());

CREATE POLICY "Creators can update their chamas" ON public.chamas
  FOR UPDATE USING (creator_id = auth.uid());

CREATE POLICY "Authenticated users can create chamas" ON public.chamas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_chamas_updated_at BEFORE UPDATE ON public.chamas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 3. Chama Members Table
```sql
-- Create chama_members table
CREATE TABLE public.chama_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'banned')),
  position_in_queue INTEGER,
  total_contributed DECIMAL DEFAULT 0,
  total_received DECIMAL DEFAULT 0,
  missed_contributions INTEGER DEFAULT 0,
  last_contribution_date DATE,
  next_payout_date DATE,
  is_admin BOOLEAN DEFAULT FALSE,
  UNIQUE(chama_id, user_id)
);

-- Enable RLS
ALTER TABLE public.chama_members ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Members can view their memberships" ON public.chama_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Chama admins can manage members" ON public.chama_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.chama_members cm 
      WHERE cm.chama_id = chama_members.chama_id 
      AND cm.user_id = auth.uid() 
      AND cm.is_admin = TRUE
    )
  );
```

#### 4. Contributions Table
```sql
-- Create contributions table
CREATE TABLE public.contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  transaction_hash TEXT,
  block_number BIGINT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  contribution_date DATE DEFAULT CURRENT_DATE,
  round_number INTEGER,
  is_late BOOLEAN DEFAULT FALSE,
  late_fee DECIMAL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their contributions" ON public.contributions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create contributions" ON public.contributions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Index for performance
CREATE INDEX idx_contributions_chama_user ON public.contributions(chama_id, user_id);
CREATE INDEX idx_contributions_date ON public.contributions(contribution_date);
```

#### 5. Payouts Table
```sql
-- Create payouts table
CREATE TABLE public.payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  transaction_hash TEXT,
  block_number BIGINT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  payout_date DATE DEFAULT CURRENT_DATE,
  round_number INTEGER,
  payout_type TEXT DEFAULT 'regular' CHECK (payout_type IN ('regular', 'emergency', 'final')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their payouts" ON public.payouts
  FOR SELECT USING (recipient_id = auth.uid());

-- Index for performance
CREATE INDEX idx_payouts_chama_recipient ON public.payouts(chama_id, recipient_id);
```

#### 6. Personal Stacking Table
```sql
-- Create stacking_records table
CREATE TABLE public.stacking_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  transaction_hash TEXT,
  block_number BIGINT,
  stacking_date DATE DEFAULT CURRENT_DATE,
  goal_type TEXT CHECK (goal_type IN ('daily', 'weekly', 'monthly', 'custom')),
  vault_type TEXT CHECK (vault_type IN ('general', 'emergency', 'vacation', 'investment')),
  is_goal_achieved BOOLEAN DEFAULT FALSE,
  streak_day INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.stacking_records ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their stacking records" ON public.stacking_records
  FOR ALL USING (user_id = auth.uid());

-- Index for performance
CREATE INDEX idx_stacking_user_date ON public.stacking_records(user_id, stacking_date);
```

#### 7. P2P Transactions Table
```sql
-- Create p2p_transactions table
CREATE TABLE public.p2p_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  transaction_hash TEXT,
  block_number BIGINT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  message TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  gas_fee DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.p2p_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their transactions" ON public.p2p_transactions
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can create transactions" ON public.p2p_transactions
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Index for performance
CREATE INDEX idx_p2p_sender_recipient ON public.p2p_transactions(sender_id, recipient_id);
```

#### 8. Notifications Table
```sql
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('chama_update', 'payment_received', 'goal_achieved', 'new_member', 'payout_ready', 'contribution_due', 'reputation_update')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- Index for performance
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
```

#### 9. Learning Progress Table
```sql
-- Create learning_progress table
CREATE TABLE public.learning_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  quiz_score INTEGER,
  time_spent INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their learning progress" ON public.learning_progress
  FOR ALL USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_learning_progress_updated_at BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🔧 Step 4: Install Supabase Client

Add Supabase to your project:

```bash
npm install @supabase/supabase-js
```

## ⚙️ Step 5: Configure Supabase Client

Create the Supabase client configuration:

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (auto-generated)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string | null
          email: string | null
          username: string | null
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
          reputation_score: number
          total_contributions: number
          total_payouts: number
          chamas_joined: number
          stacking_streak: number
          preferred_language: string
          location: string | null
          phone_number: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          wallet_address?: string | null
          email?: string | null
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          reputation_score?: number
          total_contributions?: number
          total_payouts?: number
          chamas_joined?: number
          stacking_streak?: number
          preferred_language?: string
          location?: string | null
          phone_number?: string | null
          is_verified?: boolean
        }
        Update: {
          wallet_address?: string | null
          email?: string | null
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          reputation_score?: number
          total_contributions?: number
          total_payouts?: number
          chamas_joined?: number
          stacking_streak?: number
          preferred_language?: string
          location?: string | null
          phone_number?: string | null
          is_verified?: boolean
        }
      }
      // Add other table types as needed
    }
  }
}
```

## 🔐 Step 6: Set Up Authentication

Configure authentication to work with your wallet connection:

```typescript
// src/lib/auth.ts
import { supabase } from './supabase'

export const signInWithWallet = async (walletAddress: string, signature: string) => {
  try {
    // Custom authentication logic
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${walletAddress}@wallet.local`,
      password: signature,
    })

    if (error) {
      // If user doesn't exist, create them
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: `${walletAddress}@wallet.local`,
        password: signature,
      })

      if (signUpError) throw signUpError

      // Create user profile
      await createUserProfile(signUpData.user!.id, walletAddress)
      
      return signUpData
    }

    return data
  } catch (error) {
    console.error('Auth error:', error)
    throw error
  }
}

export const createUserProfile = async (userId: string, walletAddress: string) => {
  const { error } = await supabase
    .from('users')
    .insert({
      id: userId,
      wallet_address: walletAddress,
      preferred_language: 'en',
    })

  if (error) throw error
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
```

## 📊 Step 7: Create Database Hooks

Create React hooks for database operations:

```typescript
// src/hooks/useSupabase.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Tables = Database['public']['Tables']

export const useChamas = () => {
  const [chamas, setChamas] = useState<Tables['chamas']['Row'][]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChamas()
  }, [])

  const fetchChamas = async () => {
    try {
      const { data, error } = await supabase
        .from('chamas')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setChamas(data || [])
    } catch (error) {
      console.error('Error fetching chamas:', error)
    } finally {
      setLoading(false)
    }
  }

  const createChama = async (chamaData: Tables['chamas']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('chamas')
        .insert(chamaData)
        .select()
        .single()

      if (error) throw error
      
      setChamas(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error('Error creating chama:', error)
      throw error
    }
  }

  return {
    chamas,
    loading,
    createChama,
    refetch: fetchChamas
  }
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<Tables['users']['Row'] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Tables['users']['Update']) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  }
}
```

## 🔄 Step 8: Set Up Real-time Subscriptions

Enable real-time updates for live data:

```typescript
// src/hooks/useRealtimeChamas.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export const useRealtimeChamas = () => {
  const [chamas, setChamas] = useState([])

  useEffect(() => {
    // Initial fetch
    fetchChamas()

    // Set up real-time subscription
    const subscription = supabase
      .channel('chamas_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chamas'
        },
        (payload) => {
          console.log('Chama change received:', payload)
          fetchChamas() // Refetch data
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchChamas = async () => {
    const { data } = await supabase
      .from('chamas')
      .select('*')
      .eq('is_active', true)
    
    setChamas(data || [])
  }

  return chamas
}
```

## 🚀 Step 9: Environment Variables

Update your `.env` file:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Existing variables
VITE_DYNAMIC_ENVIRONMENT_ID=your-dynamic-id
```

## 📝 Step 10: Database Policies & Security

### Row Level Security (RLS) Best Practices

1. **Enable RLS on all tables** ✅ (Already done above)
2. **Create specific policies** for each user role
3. **Test policies** thoroughly before production

### Additional Security Policies

```sql
-- Policy for chama admins to manage their chamas
CREATE POLICY "Chama creators can delete their chamas" ON public.chamas
  FOR DELETE USING (creator_id = auth.uid());

-- Policy for viewing chama members (only members can see other members)
CREATE POLICY "Chama members can view other members" ON public.chama_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chama_members cm 
      WHERE cm.chama_id = chama_members.chama_id 
      AND cm.user_id = auth.uid()
    )
  );
```

## 🧪 Step 11: Testing Your Database

Test your database setup:

```typescript
// src/utils/testDatabase.ts
import { supabase } from '@/lib/supabase'

export const testDatabaseConnection = async () => {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Database connection failed:', error)
      return false
    }

    console.log('Database connection successful!')
    return true
  } catch (error) {
    console.error('Database test failed:', error)
    return false
  }
}

// Run this in your app initialization
testDatabaseConnection()
```

## 📚 Step 12: Backup & Maintenance

### Automated Backups
Supabase automatically backs up your database, but you can also:

1. **Go to Settings → Database**
2. **Enable Point-in-Time Recovery** (paid plans)
3. **Set up custom backup schedules**

### Database Monitoring
1. **Monitor usage** in Supabase dashboard
2. **Set up alerts** for high usage
3. **Review slow queries** in the SQL Editor

## 🎯 Next Steps

1. **Integrate with your existing components**
2. **Replace mock data** with real database calls
3. **Test all CRUD operations**
4. **Set up proper error handling**
5. **Implement caching strategies**
6. **Add database migrations** for future schema changes

## 🔗 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

---

Your Jenga application now has a robust, scalable database backend that supports all your Bitcoin-native community lending features! 🚀
