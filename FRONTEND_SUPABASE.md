# Frontend Supabase Integration Plan

## 🎯 Overview

This document outlines the comprehensive integration plan for Supabase in the Jenga ROSCA frontend application. The integration focuses on off-chain functionality including user onboarding, achievements, disputes, notifications, and temporary data storage while blockchain transactions are being confirmed.

## 📋 Table of Contents

1. [Environment Setup](#environment-setup)
2. [User Onboarding Flow](#user-onboarding-flow)
3. [Group Management](#group-management)
4. [Achievement System](#achievement-system)
5. [Notification System](#notification-system)
6. [Dispute Resolution](#dispute-resolution)
7. [Analytics & Reporting](#analytics--reporting)
8. [Real-time Features](#real-time-features)
9. [Data Synchronization](#data-synchronization)
10. [Implementation Phases](#implementation-phases)

## 🔧 Environment Setup

### Required Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: For advanced features
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (server-side only)
```

### Installation Dependencies

```bash
npm install @supabase/supabase-js
npm install @supabase/realtime-js  # For real-time features
```

### Hook Integration

The `useSupabase` hook provides all necessary database operations:

```typescript
import { useSupabase } from '@/hooks/useSupabase';

const {
  // State
  isLoading,
  error,
  
  // Operations
  upsertUser,
  createGroup,
  recordContribution,
  createNotification,
  // ... more operations
} = useSupabase();
```

## 👤 User Onboarding Flow

### Phase 1: Initial User Creation

**Trigger**: When user connects wallet via Dynamic

**Implementation**:
```typescript
// In onboarding component or Dynamic connection handler
const { upsertUser } = useSupabase();

const handleWalletConnection = async () => {
  const userData = {
    display_name: user?.email || generateDisplayName(),
    preferred_language: 'en',
    notification_preferences: {
      email: true,
      push: true,
      sms: false
    }
  };
  
  await upsertUser(userData);
};
```

**Database Operations**:
- Create user profile in `users` table
- Set default preferences and settings
- Initialize trust score (4.0)
- Log onboarding activity

### Phase 2: Profile Completion

**Components to Update**:
- `OnboardingModal.tsx` - Add profile completion steps
- `Profile.tsx` - Profile editing interface

**Data Collection**:
- Display name and bio
- Location and timezone
- Notification preferences
- Privacy settings

**Implementation**:
```typescript
const completeProfile = async (profileData) => {
  await upsertUser({
    bio: profileData.bio,
    location: profileData.location,
    timezone: profileData.timezone,
    privacy_settings: profileData.privacy
  });
  
  // Award "Profile Complete" achievement
  await awardAchievement('profile-complete', user.id);
};
```

### Phase 3: First Group Interaction

**Trigger**: User creates or joins first group

**Implementation**:
- Track group creation/joining in database
- Award relevant achievements
- Send welcome notifications
- Initialize group-specific data

## 🏘️ Group Management

### Group Creation Enhancement

**Component**: `CreateChamaModal.tsx`

**Enhanced Flow**:
1. **Immediate Database Storage**: Store group data immediately when form is submitted
2. **Blockchain Sync**: Update with transaction hash when blockchain transaction is sent
3. **Confirmation Tracking**: Update sync status when transaction is confirmed

```typescript
const enhancedCreateGroup = async (groupData) => {
  // 1. Store in database immediately
  const dbGroup = await createGroup({
    name: groupData.name,
    description: groupData.description,
    contribution_amount: groupData.contribution,
    round_length_days: groupData.roundLength,
    max_members: groupData.maxMembers,
    status: 'pending'
  });
  
  // 2. Send blockchain transaction
  const txHash = await createGroupOnChain(groupData);
  
  // 3. Update with transaction hash
  await supabase
    .from('groups')
    .update({ 
      transaction_hash: txHash,
      status: 'pending' 
    })
    .eq('id', dbGroup.id);
  
  // 4. Monitor for confirmation (separate process)
  monitorTransaction(txHash, dbGroup.id);
};
```

### Group Discovery Enhancement

**Component**: `BrowseChamas.tsx`

**Enhanced Features**:
- **Rich Metadata**: Display additional info from database
- **Real-time Updates**: Live member counts and status updates
- **Advanced Filtering**: Filter by tags, categories, trust scores
- **Recommendation Engine**: Suggest groups based on user history

```typescript
const enhancedBrowseGroups = async () => {
  const groups = await getGroups({
    status: 'active',
    tags: selectedTags,
    category: selectedCategory,
    limit: 20
  });
  
  // Enhance with real-time data
  groups.forEach(group => {
    subscribeToGroup(group.id, (update) => {
      // Update group data in real-time
      updateGroupInList(group.id, update.new);
    });
  });
};
```

### Group Detail Enhancement

**Component**: `ChamaDetail.tsx`

**Enhanced Features**:
- **Member Profiles**: Show member trust scores and history
- **Contribution Timeline**: Visual timeline of all contributions
- **Group Analytics**: Success rates, completion predictions
- **Social Features**: Comments, ratings, recommendations

## 🏆 Achievement System

### Achievement Categories

1. **Contribution Achievements**
   - First Contribution
   - Consistent Contributor (10 contributions)
   - High Roller (large contributions)
   - Perfect Attendance (no missed payments)

2. **Social Achievements**
   - Group Creator
   - Community Builder (5+ groups created)
   - Trusted Member (high trust score)
   - Mentor (helped resolve disputes)

3. **Milestone Achievements**
   - Cycle Completer
   - Multi-Group Member
   - Long-term Saver
   - Platform Pioneer

4. **Special Achievements**
   - Beta Tester
   - Bug Reporter
   - Community Contributor
   - Ambassador

### Implementation Strategy

**Achievement Checking**:
```typescript
// Trigger achievement checks after key actions
const checkAchievements = async (action, context) => {
  const eligibleAchievements = await supabase
    .rpc('check_user_achievements', {
      user_wallet: primaryWallet.address,
      action_type: action,
      context_data: context
    });
  
  for (const achievement of eligibleAchievements) {
    await awardAchievement(achievement.id, user.id, context);
  }
};

// Example usage
await recordContribution(contributionData);
await checkAchievements('contribution_made', {
  group_id: groupId,
  amount: contributionData.amount
});
```

**Achievement Display**:
- **Profile Page**: Showcase earned achievements
- **Notification System**: Real-time achievement notifications
- **Leaderboards**: Community achievement rankings
- **Progress Tracking**: Show progress towards unearned achievements

## 🔔 Notification System

### Notification Types

1. **Group Notifications**
   - New member joined
   - Contribution received
   - Round completed
   - Payout distributed

2. **Achievement Notifications**
   - Achievement unlocked
   - Progress milestone reached
   - Leaderboard position change

3. **Dispute Notifications**
   - New dispute filed
   - Voting period started
   - Dispute resolved

4. **System Notifications**
   - Transaction confirmed
   - Sync completed
   - System maintenance

### Implementation

**Notification Creation**:
```typescript
const createGroupNotification = async (groupId, type, data) => {
  // Get all group members
  const members = await supabase
    .from('group_members')
    .select('wallet_address')
    .eq('group_id', groupId)
    .eq('status', 'active');
  
  // Create notifications for all members
  const notifications = members.map(member => ({
    user_wallet_address: member.wallet_address,
    title: getNotificationTitle(type),
    message: getNotificationMessage(type, data),
    type: 'group',
    group_id: groupId,
    data: data
  }));
  
  await supabase
    .from('notifications')
    .insert(notifications);
};
```

**Real-time Notifications**:
```typescript
// In main app component
const { subscribeToNotifications } = useSupabase();

useEffect(() => {
  if (primaryWallet?.address) {
    const unsubscribe = subscribeToNotifications(
      primaryWallet.address,
      (payload) => {
        // Show toast notification
        toast.info(payload.new.title, payload.new.message);
        
        // Update notification count
        setUnreadCount(prev => prev + 1);
      }
    );
    
    return unsubscribe;
  }
}, [primaryWallet?.address]);
```

## ⚖️ Dispute Resolution

### Dispute Flow

1. **Filing**: User files dispute with evidence
2. **Review**: System categorizes and assigns priority
3. **Investigation**: Gather additional information
4. **Voting**: Community votes on resolution
5. **Resolution**: Implement decided resolution
6. **Appeal**: Optional appeal process

### Implementation

**Dispute Creation**:
```typescript
const fileDispute = async (disputeData) => {
  const dispute = await createDispute({
    group_id: disputeData.groupId,
    title: disputeData.title,
    description: disputeData.description,
    category: disputeData.category,
    defendant_wallet_address: disputeData.defendant,
    evidence: disputeData.evidence,
    severity: calculateSeverity(disputeData)
  });
  
  // Notify relevant parties
  await createNotification({
    user_wallet_address: disputeData.defendant,
    title: 'Dispute Filed Against You',
    message: `A dispute has been filed regarding: ${disputeData.title}`,
    type: 'dispute',
    dispute_id: dispute.id
  });
  
  // Notify group members for voting
  await notifyGroupForVoting(disputeData.groupId, dispute.id);
};
```

**Voting System**:
```typescript
const voteOnDispute = async (disputeId, vote, reasoning) => {
  await supabase
    .from('dispute_votes')
    .insert({
      dispute_id: disputeId,
      voter_wallet_address: primaryWallet.address,
      vote: vote, // 'for', 'against', 'abstain'
      reasoning: reasoning,
      weight: await getUserVotingWeight(primaryWallet.address)
    });
  
  // Update dispute vote counts
  await updateDisputeVoteCounts(disputeId);
};
```

## 📊 Analytics & Reporting

### User Analytics

**Dashboard Metrics**:
- Total contributions made
- Groups participated in
- Success rate
- Trust score history
- Achievement progress

**Implementation**:
```typescript
const getUserAnalytics = async (walletAddress) => {
  const analytics = await supabase
    .rpc('get_user_analytics', { user_wallet: walletAddress });
  
  return {
    totalContributions: analytics.total_contributions,
    totalContributed: analytics.total_contributed,
    groupsJoined: analytics.groups_joined,
    successRate: analytics.success_rate,
    trustScoreHistory: analytics.trust_score_history,
    achievementProgress: analytics.achievement_progress
  };
};
```

### Group Analytics

**Group Performance Metrics**:
- Completion rate
- Average contribution time
- Member retention
- Dispute frequency

### Platform Analytics

**System-wide Metrics**:
- Total users and groups
- Transaction volume
- Platform growth
- Feature usage statistics

## 🔄 Real-time Features

### Live Updates

1. **Group Status**: Real-time member counts, contribution status
2. **Notifications**: Instant notification delivery
3. **Dispute Voting**: Live vote counts and status updates
4. **Achievement Unlocks**: Real-time achievement notifications

### Implementation

```typescript
// Real-time group updates
const useGroupRealtime = (groupId) => {
  const [groupData, setGroupData] = useState(null);
  const { subscribeToGroup } = useSupabase();
  
  useEffect(() => {
    const unsubscribe = subscribeToGroup(groupId, (payload) => {
      setGroupData(payload.new);
    });
    
    return unsubscribe;
  }, [groupId]);
  
  return groupData;
};
```

## 🔄 Data Synchronization

### Blockchain to Database Sync

**Transaction Monitoring**:
```typescript
const monitorTransaction = async (txHash, entityId, entityType) => {
  const checkConfirmation = async () => {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    
    if (receipt) {
      // Update database with confirmation
      await supabase
        .from(getTableName(entityType))
        .update({
          block_number: receipt.blockNumber,
          is_synced: true,
          status: receipt.status === 'success' ? 'confirmed' : 'failed'
        })
        .eq('id', entityId);
      
      // Trigger post-confirmation actions
      await handleConfirmation(entityType, entityId, receipt);
    } else {
      // Check again in 10 seconds
      setTimeout(checkConfirmation, 10000);
    }
  };
  
  checkConfirmation();
};
```

**Periodic Sync Jobs**:
- Sync group data from blockchain
- Update contribution statuses
- Reconcile member lists
- Update trust scores

## 📅 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Supabase project and database schema
- [ ] Implement `useSupabase` hook
- [ ] Basic user onboarding integration
- [ ] Environment configuration

### Phase 2: Core Features (Week 3-4)
- [ ] Group creation and management
- [ ] Contribution tracking
- [ ] Basic notification system
- [ ] User profile management

### Phase 3: Advanced Features (Week 5-6)
- [ ] Achievement system implementation
- [ ] Dispute resolution system
- [ ] Real-time updates
- [ ] Analytics dashboard

### Phase 4: Enhancement (Week 7-8)
- [ ] Advanced filtering and search
- [ ] Recommendation engine
- [ ] Social features
- [ ] Performance optimization

### Phase 5: Polish (Week 9-10)
- [ ] UI/UX improvements
- [ ] Error handling enhancement
- [ ] Testing and bug fixes
- [ ] Documentation completion

## 🔧 Component Integration Plan

### Existing Components to Enhance

1. **OnboardingModal.tsx**
   - Add profile completion steps
   - Store onboarding progress
   - Award onboarding achievements

2. **Dashboard.tsx**
   - Display user analytics
   - Show recent achievements
   - Real-time notification updates

3. **CreateChamaModal.tsx**
   - Immediate database storage
   - Enhanced validation with user data
   - Progress tracking

4. **BrowseChamas.tsx**
   - Rich metadata display
   - Advanced filtering
   - Real-time updates

5. **ChamaDetail.tsx**
   - Member profiles and history
   - Contribution timeline
   - Social features

### New Components to Create

1. **AchievementCenter.tsx**
   - Display all achievements
   - Progress tracking
   - Leaderboards

2. **NotificationCenter.tsx**
   - Notification list and management
   - Real-time updates
   - Action handling

3. **DisputeCenter.tsx**
   - Dispute filing interface
   - Voting system
   - Resolution tracking

4. **AnalyticsDashboard.tsx**
   - User and group analytics
   - Performance metrics
   - Trend analysis

5. **ProfileSettings.tsx**
   - Enhanced profile management
   - Privacy settings
   - Notification preferences

## 🚀 Benefits of Integration

### For Users
- **Immediate Feedback**: Instant responses while blockchain confirms
- **Rich Experience**: Achievements, notifications, social features
- **Better Discovery**: Advanced search and recommendations
- **Transparency**: Detailed analytics and history

### For Platform
- **Reduced Load**: Off-chain operations reduce blockchain calls
- **Better UX**: Smooth, responsive interface
- **Community Building**: Social features and gamification
- **Data Insights**: Analytics for platform improvement

### For Developers
- **Easier Development**: Rich data layer for complex features
- **Better Debugging**: Comprehensive logging and monitoring
- **Scalability**: Database handles complex queries efficiently
- **Flexibility**: Easy to add new features and data types

## 📝 Next Steps

1. **Set up Supabase project** and run the SQL schema
2. **Install dependencies** and configure environment variables
3. **Implement the useSupabase hook** and test basic operations
4. **Start with user onboarding** integration
5. **Gradually enhance existing components** with database features
6. **Add real-time features** and notifications
7. **Implement achievement system** and gamification
8. **Add dispute resolution** and governance features

This comprehensive integration plan ensures a smooth transition to a database-backed system while maintaining the existing functionality and adding powerful new features for users.
