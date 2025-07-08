# 🔗 Supabase Integration Guide

## 📋 Overview

This guide shows how to integrate the Supabase database with your existing Jenga components, replacing mock data with real database operations.

## 🚀 Installation

First, install the Supabase client:

```bash
npm install @supabase/supabase-js
```

## ⚙️ Environment Setup

Add these variables to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Existing variables
VITE_DYNAMIC_ENVIRONMENT_ID=your-dynamic-id
```

## 🔧 Integration Examples

### 1. Update PersonalStacking Component

Replace the existing PersonalStacking component to use real database data:

```typescript
// src/components/PersonalStacking.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { useSupabaseStacking } from '@/hooks/useSupabaseStacking';
import { useSupabaseProfile } from '@/hooks/useSupabaseProfile';
import { useToast } from "@/hooks/use-toast";

export const PersonalStacking = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [stackAmount, setStackAmount] = useState("100");
  
  // Use Supabase hooks
  const { 
    stackingRecords, 
    loading: stackingLoading, 
    addStackingRecord,
    getStackingStats,
    getDailyProgress 
  } = useSupabaseStacking();
  
  const { profile, updateStackingStreak } = useSupabaseProfile();
  
  const [dailyStats, setDailyStats] = useState(null);
  const [overallStats, setOverallStats] = useState(null);

  // Load statistics on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [daily, overall] = await Promise.all([
      getDailyProgress(),
      getStackingStats()
    ]);
    
    setDailyStats(daily);
    setOverallStats(overall);
  };

  const handleStackSats = async (amount: number) => {
    try {
      // Add stacking record to database
      const { data, error } = await addStackingRecord({
        amount,
        stacking_date: new Date().toISOString().split('T')[0],
        goal_type: 'daily',
        vault_type: 'general',
        is_goal_achieved: amount >= 1000, // Example daily goal
        streak_day: (overallStats?.currentStreak || 0) + 1
      });

      if (error) {
        throw new Error(error);
      }

      // Update streak in profile
      if (data?.is_goal_achieved) {
        await updateStackingStreak((overallStats?.currentStreak || 0) + 1);
      }

      // Refresh stats
      await loadStats();

      toast({
        title: t('stacking.stackingSuccess'),
        description: t('stacking.addedSats', { amount }),
      });

    } catch (error) {
      toast({
        title: t('stacking.stackingFailed'),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (stackingLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Daily Goal Card */}
      <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {t('stacking.dailyGoal')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">
                {dailyStats?.totalToday || 0} / 1000 sats
              </span>
              <Badge variant={dailyStats?.goalAchieved ? "default" : "secondary"}>
                {dailyStats?.goalAchieved ? t('common.completed') : t('common.inProgress')}
              </Badge>
            </div>
            
            <Progress 
              value={(dailyStats?.totalToday || 0) / 10} 
              className="h-2" 
            />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="opacity-90">{t('stacking.currentStreak')}</p>
                <p className="text-xl font-bold">{overallStats?.currentStreak || 0} days</p>
              </div>
              <div>
                <p className="opacity-90">{t('stacking.totalStacked')}</p>
                <p className="text-xl font-bold">{overallStats?.totalStacked || 0} sats</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stack Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>{t('stacking.quickStack')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[100, 500, 1000].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                onClick={() => handleStackSats(amount)}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <span className="text-lg font-bold">{amount}</span>
                <span className="text-xs text-muted-foreground">sats</span>
              </Button>
            ))}
          </div>
          
          {/* Custom Amount */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Custom amount"
              value={stackAmount}
              onChange={(e) => setStackAmount(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => handleStackSats(parseInt(stackAmount) || 0)}
              disabled={!stackAmount || parseInt(stackAmount) <= 0}
            >
              {t('stacking.stackSats')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Stacking</CardTitle>
        </CardHeader>
        <CardContent>
          {stackingRecords.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {t('stacking.noStackingData')}
            </p>
          ) : (
            <div className="space-y-2">
              {stackingRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="flex justify-between items-center p-2 rounded border">
                  <div>
                    <p className="font-medium">{record.amount} sats</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.stacking_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={record.is_goal_achieved ? "default" : "secondary"}>
                    {record.is_goal_achieved ? "Goal ✓" : "Partial"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

### 2. Update ChamaCircles Component

```typescript
// src/components/ChamaCircles.tsx (partial update)
import { useSupabaseChamas } from '@/hooks/useSupabaseChamas';
import { useSupabaseProfile } from '@/hooks/useSupabaseProfile';

export const ChamaCircles = () => {
  const { t } = useTranslation();
  const { 
    chamas, 
    loading, 
    error, 
    createChama, 
    joinChama, 
    searchChamas 
  } = useSupabaseChamas();
  
  const { profile } = useSupabaseProfile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateChama = async (chamaData) => {
    if (!profile) return;

    const { data, error } = await createChama({
      ...chamaData,
      creator_id: profile.id
    });

    if (error) {
      toast({
        title: t('chamas.createFailed'),
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: t('chamas.createSuccess'),
        description: t('chamas.chamaCreated')
      });
      setShowCreateForm(false);
    }
  };

  const handleJoinChama = async (chamaId: string) => {
    if (!profile) return;

    const { success, error } = await joinChama(chamaId, profile.id);

    if (error) {
      toast({
        title: t('chamas.joinFailed'),
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: t('chamas.joinSuccess'),
        description: t('chamas.welcomeToChama')
      });
    }
  };

  // Rest of component logic...
};
```

### 3. Create Database Migration Helper

```typescript
// src/utils/databaseMigration.ts
import { supabase } from '@/lib/supabase';

// Helper to migrate existing user data to Supabase
export const migrateUserData = async (walletAddress: string, userData: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Update user profile with existing data
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        wallet_address: walletAddress,
        ...userData,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error };
  }
};

// Helper to sync blockchain data with database
export const syncBlockchainData = async (transactionHash: string, recordId: string) => {
  try {
    // This would typically fetch transaction details from blockchain
    // For now, we'll just update the record with the hash
    
    const { error } = await supabase
      .from('stacking_records')
      .update({
        transaction_hash: transactionHash,
        // block_number: blockNumber, // Add when available
      })
      .eq('id', recordId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, error };
  }
};
```

## 🔄 Data Migration Strategy

### Phase 1: Parallel Operation
1. **Keep existing mock data** for fallback
2. **Add Supabase calls** alongside existing logic
3. **Test thoroughly** with real data

### Phase 2: Gradual Replacement
1. **Replace component by component**
2. **Migrate user data** from localStorage to Supabase
3. **Update state management** to use database

### Phase 3: Full Migration
1. **Remove mock data** and localStorage dependencies
2. **Optimize database queries** and add caching
3. **Add real-time features** with Supabase subscriptions

## 🎯 Integration Checklist

### ✅ Database Setup
- [ ] Create Supabase project
- [ ] Run SQL schema creation
- [ ] Set up Row Level Security policies
- [ ] Configure environment variables

### ✅ Authentication
- [ ] Integrate wallet-based auth with Supabase
- [ ] Handle user profile creation
- [ ] Sync with Dynamic wallet connection

### ✅ Component Updates
- [ ] PersonalStacking → useSupabaseStacking
- [ ] ChamaCircles → useSupabaseChamas  
- [ ] FinanceInsights → database queries
- [ ] NotificationSystem → useSupabaseNotifications

### ✅ Real-time Features
- [ ] Chama updates subscription
- [ ] Notification real-time delivery
- [ ] Live member activity feeds

### ✅ Performance
- [ ] Add database indexes
- [ ] Implement query caching
- [ ] Optimize component re-renders

## 🚨 Important Notes

### Security
- **Never expose service role key** in frontend
- **Use Row Level Security** for all tables
- **Validate all inputs** before database operations

### Performance
- **Use select() carefully** - only fetch needed columns
- **Implement pagination** for large datasets
- **Cache frequently accessed data**

### Error Handling
- **Always handle database errors** gracefully
- **Provide user-friendly error messages**
- **Log errors for debugging**

## 🔧 Testing

### Database Testing
```typescript
// src/utils/testSupabase.ts
import { supabase } from '@/lib/supabase';

export const testDatabaseOperations = async () => {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
      
    if (error) throw error;
    
    console.log('✅ Database connection successful');
    
    // Test authentication
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.id || 'Not authenticated');
    
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
};

// Run in development
if (import.meta.env.DEV) {
  testDatabaseOperations();
}
```

## 📊 Monitoring

### Database Monitoring
1. **Monitor query performance** in Supabase dashboard
2. **Set up alerts** for high usage
3. **Track user growth** and engagement
4. **Monitor error rates** and failed operations

### Application Monitoring
1. **Track component render times**
2. **Monitor API call frequency**
3. **Watch for memory leaks** in subscriptions
4. **Log user interactions** for analytics

---

Your Jenga application is now ready for production-grade database integration! 🚀

The Supabase setup provides:
- **Scalable PostgreSQL database**
- **Real-time subscriptions**
- **Built-in authentication**
- **Row-level security**
- **Automatic backups**
- **Global CDN**

This foundation will support your Bitcoin-native community lending circles as they grow globally! 🌍
