# Supabase Simplification - Separating On-chain and Off-chain Data

## Problem Statement

The current implementation mixes on-chain and off-chain data in Supabase, which creates several issues:

1. **Stale Data**: Users can get wrong/outdated group data from Supabase database
2. **Data Inconsistency**: On-chain state and Supabase state can become out of sync
3. **Complexity**: Managing both on-chain and off-chain group data adds unnecessary complexity
4. **Single Source of Truth**: Blockchain should be the authoritative source for group/chama data

## Solution Overview

**Separate on-chain and off-chain data completely:**
- **On-chain data**: All chama/group-related data (creation, membership, contributions, etc.)
- **Off-chain data**: Only user onboarding and notification data in Supabase

## What We're Doing

### 1. Supabase Database Changes

#### Tables to Remove:
- `groups` - All group data now comes from blockchain
- `group_members` - Member data from smart contract
- `contributions` - Contribution data from smart contract

#### Tables to Keep (Simplified):
- `users` - User profiles and onboarding data only
  - Remove: `groups_created`, `groups_joined` columns
  - Keep: Profile info, preferences, onboarding status
- `notifications` - For UI notifications
  - Remove: `group_id` references
- `activities` - For analytics/logging
- `user_achievements` - For gamification
  - Remove: `group_id` references
- `achievements` - Achievement definitions

### 2. Code Changes

#### useSupabase Hook Simplification:
```typescript
// REMOVED functions:
- createGroup()
- getGroups()  
- joinGroup()
- subscribeToGroup()

// KEPT functions:
- upsertUser() - User onboarding
- getUser() - User profile
- updateTrustScore() - User scoring
- getUserAchievements() - Gamification
- createNotification() - UI notifications
- getNotifications() - UI notifications
- logActivity() - Analytics
```

#### Component Updates:

**CreateChamaModal.tsx:**
- Remove Supabase group creation
- Only do blockchain transaction
- Optional logging/notifications (non-critical)

**Dashboard.tsx:**
- Remove Supabase group loading
- Get all group data from on-chain calls only
- Keep user profile loading for onboarding data

**Other Components:**
- All group data fetched via `useRosca` hook (on-chain)
- Supabase only used for user profiles and notifications

### 3. Data Flow Architecture

#### Before (Mixed):
```
User Action → Supabase DB → Blockchain → UI Update
                ↓
            Potential sync issues
```

#### After (Separated):
```
Group Actions → Blockchain Only → UI Update
User Profile → Supabase Only → UI Update
Notifications → Supabase Only → UI Update
```

### 4. Benefits

1. **Data Integrity**: Blockchain is single source of truth for groups
2. **No Sync Issues**: No need to keep Supabase and blockchain in sync
3. **Simplified Code**: Less complex data management logic
4. **Better Performance**: Direct blockchain queries, no database overhead
5. **Cleaner Architecture**: Clear separation of concerns

### 5. Implementation Steps

#### Phase 1: Code Updates ✅
- [x] Simplify `useSupabase` hook
- [x] Update `CreateChamaModal` to be blockchain-only
- [x] Update `Dashboard` to remove group loading from Supabase
- [x] Remove group-related interfaces and types

#### Phase 2: Database Migration
- [ ] Run migration to drop group tables
- [ ] Update RLS policies
- [ ] Clean up unused columns

#### Phase 3: Testing
- [ ] Test group creation (blockchain only)
- [ ] Test user onboarding (Supabase only)
- [ ] Test notifications (Supabase only)
- [ ] Verify no stale data issues

### 6. What Each System Handles

#### Blockchain (Smart Contract):
- Group creation and management
- Member joining/leaving
- Contribution tracking
- Payout distribution
- Group status and rounds

#### Supabase Database:
- User profile data
- Onboarding completion status
- User preferences and settings
- Notifications for UI
- Activity logging for analytics
- Achievement system

#### Frontend Components:
- Use `useRosca` for all group data
- Use `useSupabase` only for user profiles and notifications
- No mixing of data sources

### 7. Migration Considerations

#### Data Loss:
- Existing group data in Supabase will be lost
- This is acceptable since blockchain is source of truth
- Users will see their groups from blockchain data

#### User Impact:
- No impact on user experience
- Groups continue to work via blockchain
- Profile data preserved

#### Rollback Plan:
- Keep migration scripts reversible
- Backup existing data before migration
- Can restore tables if needed

### 8. Future Enhancements

With this simplified architecture:
- Easier to add new blockchain features
- Better scalability (less database load)
- Cleaner codebase maintenance
- Easier testing and debugging

## Summary

This change transforms the app from a hybrid on-chain/off-chain data model to a clean separation where:
- **Blockchain = Group/Chama data** (authoritative)
- **Supabase = User profiles + Notifications** (supporting)

This eliminates stale data issues and creates a more maintainable, reliable system.
