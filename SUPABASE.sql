-- =====================================================
-- JENGA ROSCA SUPABASE DATABASE SCHEMA
-- =====================================================
-- This file contains all database schema definitions for off-chain functionality
-- including achievements, disputes, notifications, and temporary data storage
-- 
-- Version: 1.0
-- Created: 2025-01-05
-- Last Updated: 2025-01-05
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS TABLE
-- =====================================================
-- Stores user profiles and metadata from Dynamic authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    phone TEXT,
    display_name TEXT,
    avatar_url TEXT,
    dynamic_user_id TEXT UNIQUE,
    
    -- Profile information
    bio TEXT,
    location TEXT,
    preferred_language TEXT DEFAULT 'en',
    timezone TEXT,
    
    -- Reputation and stats
    trust_score DECIMAL(3,2) DEFAULT 4.0 CHECK (trust_score >= 0 AND trust_score <= 5),
    total_contributions DECIMAL(20,8) DEFAULT 0,
    groups_created INTEGER DEFAULT 0,
    groups_joined INTEGER DEFAULT 0,
    successful_rounds INTEGER DEFAULT 0,
    
    -- Preferences
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    privacy_settings JSONB DEFAULT '{"profile_public": true, "stats_public": true}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_dynamic_user_id ON users(dynamic_user_id);
CREATE INDEX IF NOT EXISTS idx_users_trust_score ON users(trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- =====================================================
-- GROUPS TABLE
-- =====================================================
-- Stores ROSCA group information (mirrors on-chain data with additional metadata)
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_group_id INTEGER UNIQUE, -- Maps to on-chain group ID
    
    -- Basic group info
    name TEXT NOT NULL,
    description TEXT,
    creator_wallet_address TEXT NOT NULL,
    
    -- Financial details
    contribution_amount DECIMAL(20,8) NOT NULL,
    token_address TEXT NOT NULL DEFAULT '0x0000000000000000000000000000000000000000',
    round_length_days INTEGER NOT NULL,
    max_members INTEGER NOT NULL,
    
    -- Status and progress
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    current_round INTEGER DEFAULT 0,
    current_members INTEGER DEFAULT 1,
    total_contributed DECIMAL(20,8) DEFAULT 0,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    category TEXT DEFAULT 'general',
    is_private BOOLEAN DEFAULT FALSE,
    invite_code TEXT UNIQUE,
    
    -- On-chain sync
    transaction_hash TEXT,
    block_number BIGINT,
    is_synced BOOLEAN DEFAULT FALSE,
    sync_error TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for groups table
CREATE INDEX IF NOT EXISTS idx_groups_chain_group_id ON groups(chain_group_id);
CREATE INDEX IF NOT EXISTS idx_groups_creator ON groups(creator_wallet_address);
CREATE INDEX IF NOT EXISTS idx_groups_status ON groups(status);
CREATE INDEX IF NOT EXISTS idx_groups_category ON groups(category);
CREATE INDEX IF NOT EXISTS idx_groups_tags ON groups USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at DESC);

-- =====================================================
-- GROUP_MEMBERS TABLE
-- =====================================================
-- Tracks group membership and member-specific data
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    
    -- Membership details
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    member_index INTEGER, -- Position in the group (0-based)
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Contribution tracking
    total_contributed DECIMAL(20,8) DEFAULT 0,
    contributions_made INTEGER DEFAULT 0,
    missed_contributions INTEGER DEFAULT 0,
    
    -- Payout tracking
    payout_round INTEGER,
    payout_amount DECIMAL(20,8),
    payout_received_at TIMESTAMP WITH TIME ZONE,
    payout_transaction_hash TEXT,
    
    -- Member status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'left', 'kicked')),
    left_at TIMESTAMP WITH TIME ZONE,
    left_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(group_id, wallet_address)
);

-- Create indexes for group_members table
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_wallet ON group_members(wallet_address);
CREATE INDEX IF NOT EXISTS idx_group_members_status ON group_members(status);
CREATE INDEX IF NOT EXISTS idx_group_members_payout_round ON group_members(payout_round);

-- =====================================================
-- CONTRIBUTIONS TABLE
-- =====================================================
-- Tracks individual contributions to groups
CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    contributor_wallet_address TEXT NOT NULL,
    
    -- Contribution details
    round_number INTEGER NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    
    -- Transaction details
    transaction_hash TEXT,
    block_number BIGINT,
    gas_used BIGINT,
    gas_price DECIMAL(20,8),
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    confirmation_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(group_id, contributor_wallet_address, round_number)
);

-- Create indexes for contributions table
CREATE INDEX IF NOT EXISTS idx_contributions_group_id ON contributions(group_id);
CREATE INDEX IF NOT EXISTS idx_contributions_contributor ON contributions(contributor_wallet_address);
CREATE INDEX IF NOT EXISTS idx_contributions_round ON contributions(round_number);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
CREATE INDEX IF NOT EXISTS idx_contributions_created_at ON contributions(created_at DESC);

-- =====================================================
-- DISPUTES TABLE
-- =====================================================
-- Handles dispute resolution and governance
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    
    -- Dispute details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('missed_payment', 'unfair_payout', 'member_behavior', 'technical_issue', 'other')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Parties involved
    complainant_wallet_address TEXT NOT NULL,
    defendant_wallet_address TEXT,
    affected_members TEXT[] DEFAULT '{}',
    
    -- Evidence and documentation
    evidence JSONB DEFAULT '[]', -- Array of evidence objects {type, url, description, timestamp}
    supporting_documents TEXT[] DEFAULT '{}',
    
    -- Resolution details
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'voting', 'resolved', 'closed')),
    resolution TEXT,
    resolution_type TEXT CHECK (resolution_type IN ('warning', 'penalty', 'removal', 'compensation', 'no_action')),
    
    -- Voting mechanism
    votes_for INTEGER DEFAULT 0,
    votes_against INTEGER DEFAULT 0,
    votes_abstain INTEGER DEFAULT 0,
    voting_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Administrative
    assigned_moderator TEXT,
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for disputes table
CREATE INDEX IF NOT EXISTS idx_disputes_group_id ON disputes(group_id);
CREATE INDEX IF NOT EXISTS idx_disputes_complainant ON disputes(complainant_wallet_address);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_category ON disputes(category);
CREATE INDEX IF NOT EXISTS idx_disputes_severity ON disputes(severity);
CREATE INDEX IF NOT EXISTS idx_disputes_created_at ON disputes(created_at DESC);

-- =====================================================
-- DISPUTE_VOTES TABLE
-- =====================================================
-- Tracks individual votes on disputes
CREATE TABLE IF NOT EXISTS dispute_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    voter_wallet_address TEXT NOT NULL,
    
    -- Vote details
    vote TEXT NOT NULL CHECK (vote IN ('for', 'against', 'abstain')),
    reasoning TEXT,
    weight DECIMAL(3,2) DEFAULT 1.0, -- Vote weight based on reputation
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(dispute_id, voter_wallet_address)
);

-- Create indexes for dispute_votes table
CREATE INDEX IF NOT EXISTS idx_dispute_votes_dispute_id ON dispute_votes(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_votes_voter ON dispute_votes(voter_wallet_address);

-- =====================================================
-- ACHIEVEMENTS TABLE
-- =====================================================
-- Defines available achievements and badges
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Achievement details
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('contribution', 'social', 'milestone', 'special', 'governance')),
    
    -- Requirements and rewards
    requirements JSONB NOT NULL, -- Criteria for earning the achievement
    reward_points INTEGER DEFAULT 0,
    badge_icon_url TEXT,
    badge_color TEXT DEFAULT '#f59e0b',
    
    -- Rarity and visibility
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    is_active BOOLEAN DEFAULT TRUE,
    is_hidden BOOLEAN DEFAULT FALSE, -- Hidden until earned
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for achievements table
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_active ON achievements(is_active);

-- =====================================================
-- USER_ACHIEVEMENTS TABLE
-- =====================================================
-- Tracks which achievements users have earned
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    
    -- Achievement details
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress JSONB DEFAULT '{}', -- Progress towards achievement if applicable
    is_featured BOOLEAN DEFAULT FALSE, -- Whether to feature on profile
    
    -- Context
    group_id UUID REFERENCES groups(id), -- Group where achievement was earned (if applicable)
    transaction_hash TEXT, -- Related transaction (if applicable)
    
    UNIQUE(user_id, achievement_id)
);

-- Create indexes for user_achievements table
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
-- Manages user notifications and alerts
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_wallet_address TEXT NOT NULL,
    
    -- Notification content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'achievement', 'group', 'dispute', 'payment')),
    category TEXT DEFAULT 'general',
    
    -- Notification data
    data JSONB DEFAULT '{}', -- Additional data for the notification
    action_url TEXT, -- URL to navigate to when clicked
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    delivery_method TEXT[] DEFAULT '{"app"}', -- app, email, sms, push
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Related entities
    group_id UUID REFERENCES groups(id),
    dispute_id UUID REFERENCES disputes(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- ACTIVITY_LOG TABLE
-- =====================================================
-- Tracks user and system activities for audit and analytics
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Actor information
    actor_wallet_address TEXT,
    actor_type TEXT DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'admin')),
    
    -- Activity details
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- group, contribution, dispute, etc.
    entity_id UUID,
    
    -- Context and metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    -- Related entities
    group_id UUID REFERENCES groups(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for activity_log table
CREATE INDEX IF NOT EXISTS idx_activity_log_actor ON activity_log(actor_wallet_address);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- =====================================================
-- SYSTEM_SETTINGS TABLE
-- =====================================================
-- Stores system-wide configuration and settings
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for system_settings table
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_members_updated_at BEFORE UPDATE ON group_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dispute_votes_updated_at BEFORE UPDATE ON dispute_votes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user trust score (set_config function removed since RLS is disabled)
CREATE OR REPLACE FUNCTION calculate_trust_score(user_wallet TEXT)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    base_score DECIMAL(3,2) := 4.0;
    contribution_bonus DECIMAL(3,2) := 0.0;
    dispute_penalty DECIMAL(3,2) := 0.0;
    completion_bonus DECIMAL(3,2) := 0.0;
    final_score DECIMAL(3,2);
BEGIN
    -- Calculate contribution bonus (up to +0.5)
    SELECT LEAST(0.5, COUNT(*) * 0.1) INTO contribution_bonus
    FROM contributions c
    WHERE c.contributor_wallet_address = user_wallet
    AND c.status = 'confirmed';
    
    -- Calculate dispute penalty (up to -1.0)
    SELECT LEAST(1.0, COUNT(*) * 0.2) INTO dispute_penalty
    FROM disputes d
    WHERE d.defendant_wallet_address = user_wallet
    AND d.status = 'resolved'
    AND d.resolution_type IN ('penalty', 'removal');
    
    -- Calculate completion bonus (up to +0.5)
    SELECT LEAST(0.5, COUNT(*) * 0.1) INTO completion_bonus
    FROM group_members gm
    JOIN groups g ON gm.group_id = g.id
    WHERE gm.wallet_address = user_wallet
    AND g.status = 'completed'
    AND gm.status = 'active';
    
    final_score := base_score + contribution_bonus + completion_bonus - dispute_penalty;
    
    -- Ensure score is within bounds
    final_score := GREATEST(0.0, LEAST(5.0, final_score));
    
    RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Function to check achievement eligibility
CREATE OR REPLACE FUNCTION check_achievement_eligibility(user_wallet TEXT, achievement_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    achievement_req JSONB;
    user_stats RECORD;
    is_eligible BOOLEAN := FALSE;
BEGIN
    -- Get achievement requirements
    SELECT requirements INTO achievement_req
    FROM achievements
    WHERE name = achievement_name AND is_active = TRUE;
    
    IF achievement_req IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get user statistics
    SELECT 
        COUNT(DISTINCT gm.group_id) as groups_joined,
        COUNT(DISTINCT CASE WHEN g.creator_wallet_address = user_wallet THEN g.id END) as groups_created,
        COUNT(DISTINCT c.id) as total_contributions,
        COALESCE(SUM(c.amount), 0) as total_contributed
    INTO user_stats
    FROM group_members gm
    LEFT JOIN groups g ON gm.group_id = g.id
    LEFT JOIN contributions c ON c.contributor_wallet_address = user_wallet
    WHERE gm.wallet_address = user_wallet;
    
    -- Check specific achievement requirements
    -- This is a simplified example - in practice, you'd have more complex logic
    IF achievement_req->>'type' = 'contribution_count' THEN
        is_eligible := user_stats.total_contributions >= (achievement_req->>'required_count')::INTEGER;
    ELSIF achievement_req->>'type' = 'groups_joined' THEN
        is_eligible := user_stats.groups_joined >= (achievement_req->>'required_count')::INTEGER;
    ELSIF achievement_req->>'type' = 'groups_created' THEN
        is_eligible := user_stats.groups_created >= (achievement_req->>'required_count')::INTEGER;
    END IF;
    
    RETURN is_eligible;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - DISABLED FOR DEVELOPMENT
-- =====================================================
-- RLS is disabled for development to avoid authentication complications
-- For production deployment, run ENABLERLS.sql to enable proper security
-- All tables use simple role-based access control during development

-- RLS is disabled on all tables for development
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dispute_votes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies (disabled for development)
-- CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (wallet_address = current_setting('app.current_user_wallet', true));
-- CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (wallet_address = current_setting('app.current_user_wallet', true));
-- CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_user_wallet', true));

-- Groups policies (disabled for development)
-- CREATE POLICY "Groups are publicly readable" ON groups FOR SELECT USING (true);
-- CREATE POLICY "Creators can modify their groups" ON groups FOR ALL USING (creator_wallet_address = current_setting('app.current_user_wallet', true));

-- Group members policies (disabled for development)
-- CREATE POLICY "Group members can view group membership" ON group_members FOR SELECT USING (
--     wallet_address = current_setting('app.current_user_wallet', true) OR
--     group_id IN (SELECT group_id FROM group_members WHERE wallet_address = current_setting('app.current_user_wallet', true))
-- );

-- Notifications policies (disabled for development)
-- CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_wallet_address = current_setting('app.current_user_wallet', true));
-- CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_wallet_address = current_setting('app.current_user_wallet', true));

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Insert default achievements (using ON CONFLICT to handle duplicates)
INSERT INTO achievements (name, description, category, requirements, reward_points, badge_color, rarity) VALUES
('First Contribution', 'Made your first contribution to a ROSCA group', 'contribution', '{"type": "contribution_count", "required_count": 1}', 10, '#10b981', 'common'),
('Consistent Contributor', 'Made 10 contributions without missing any', 'contribution', '{"type": "contribution_streak", "required_streak": 10}', 50, '#3b82f6', 'uncommon'),
('Group Creator', 'Created your first ROSCA group', 'social', '{"type": "groups_created", "required_count": 1}', 25, '#8b5cf6', 'common'),
('Community Builder', 'Created 5 successful ROSCA groups', 'social', '{"type": "groups_created", "required_count": 5}', 100, '#f59e0b', 'rare'),
('Milestone Master', 'Completed 3 full ROSCA cycles', 'milestone', '{"type": "completed_cycles", "required_count": 3}', 75, '#ef4444', 'uncommon'),
('Dispute Resolver', 'Successfully resolved 5 disputes', 'governance', '{"type": "disputes_resolved", "required_count": 5}', 150, '#06b6d4', 'epic'),
('Bitcoin Pioneer', 'One of the first 100 users on the platform', 'special', '{"type": "early_adopter", "user_rank": 100}', 200, '#f97316', 'legendary')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    requirements = EXCLUDED.requirements,
    reward_points = EXCLUDED.reward_points,
    badge_color = EXCLUDED.badge_color,
    rarity = EXCLUDED.rarity,
    updated_at = NOW();

-- Insert default system settings (using ON CONFLICT to handle duplicates)
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
('platform_fee_percentage', '0.01', 'Platform fee as a percentage of contributions', 'financial', true),
('min_group_size', '3', 'Minimum number of members required for a group', 'groups', true),
('max_group_size', '20', 'Maximum number of members allowed in a group', 'groups', true),
('dispute_voting_period_days', '7', 'Number of days for dispute voting period', 'disputes', true),
('achievement_points_multiplier', '1.0', 'Multiplier for achievement points', 'gamification', false),
('notification_retention_days', '90', 'Number of days to retain notifications', 'system', false)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    is_public = EXCLUDED.is_public,
    updated_at = NOW();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for group statistics
CREATE OR REPLACE VIEW group_stats AS
SELECT 
    g.id,
    g.name,
    g.status,
    g.current_members,
    g.max_members,
    g.contribution_amount,
    g.current_round,
    COUNT(c.id) as total_contributions,
    COALESCE(SUM(c.amount), 0) as total_contributed,
    AVG(u.trust_score) as avg_member_trust_score
FROM groups g
LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = 'active'
LEFT JOIN users u ON gm.wallet_address = u.wallet_address
LEFT JOIN contributions c ON g.id = c.group_id AND c.status = 'confirmed'
GROUP BY g.id, g.name, g.status, g.current_members, g.max_members, g.contribution_amount, g.current_round;

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.wallet_address,
    u.display_name,
    u.trust_score,
    COUNT(DISTINCT gm.group_id) as groups_joined,
    COUNT(DISTINCT CASE WHEN g.creator_wallet_address = u.wallet_address THEN g.id END) as groups_created,
    COUNT(DISTINCT c.id) as total_contributions,
    COALESCE(SUM(c.amount), 0) as total_contributed,
    COUNT(DISTINCT ua.achievement_id) as achievements_earned
FROM users u
LEFT JOIN group_members gm ON u.wallet_address = gm.wallet_address
LEFT JOIN groups g ON gm.group_id = g.id
LEFT JOIN contributions c ON u.wallet_address = c.contributor_wallet_address AND c.status = 'confirmed'
LEFT JOIN user_achievements ua ON u.id = ua.user_id
GROUP BY u.id, u.wallet_address, u.display_name, u.trust_score;

-- =====================================================
-- SAVINGS GOALS TABLE
-- =====================================================
-- Tracks individual user savings goals and progress
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_wallet_address TEXT NOT NULL,
    
    -- Goal details
    title TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(20,8) NOT NULL,
    current_amount DECIMAL(20,8) DEFAULT 0,
    
    -- Timeline
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Goal settings
    is_public BOOLEAN DEFAULT FALSE,
    category TEXT DEFAULT 'general' CHECK (category IN ('emergency', 'investment', 'purchase', 'education', 'travel', 'general')),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    
    -- Progress tracking
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    progress_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN target_amount > 0 THEN LEAST(100, (current_amount / target_amount) * 100)
            ELSE 0 
        END
    ) STORED,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for savings_goals table
CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON savings_goals(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_savings_goals_status ON savings_goals(status);
CREATE INDEX IF NOT EXISTS idx_savings_goals_category ON savings_goals(category);
CREATE INDEX IF NOT EXISTS idx_savings_goals_target_date ON savings_goals(target_date);

-- =====================================================
-- SAVINGS_TRANSACTIONS TABLE
-- =====================================================
-- Tracks individual savings transactions and allocations
CREATE TABLE IF NOT EXISTS savings_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_wallet_address TEXT NOT NULL,
    savings_goal_id UUID REFERENCES savings_goals(id) ON DELETE CASCADE,
    
    -- Transaction details
    amount DECIMAL(20,8) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'allocation', 'interest')),
    source TEXT, -- 'rosca_payout', 'manual_deposit', 'interest_earned', etc.
    
    -- Related entities
    group_id UUID REFERENCES groups(id),
    contribution_id UUID REFERENCES contributions(id),
    
    -- Blockchain data
    transaction_hash TEXT,
    block_number BIGINT,
    
    -- Status and metadata
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for savings_transactions table
CREATE INDEX IF NOT EXISTS idx_savings_transactions_user ON savings_transactions(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_goal ON savings_transactions(savings_goal_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_type ON savings_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_status ON savings_transactions(status);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_created_at ON savings_transactions(created_at DESC);

-- =====================================================
-- USER_PREFERENCES TABLE
-- =====================================================
-- Extended user preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_wallet_address TEXT UNIQUE NOT NULL,
    
    -- UI Preferences
    theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
    language TEXT DEFAULT 'en',
    currency_display TEXT DEFAULT 'cBTC',
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    
    -- Notification Preferences (detailed)
    email_notifications JSONB DEFAULT '{
        "group_updates": true,
        "payment_reminders": true,
        "achievements": true,
        "disputes": true,
        "marketing": false
    }',
    push_notifications JSONB DEFAULT '{
        "group_updates": true,
        "payment_reminders": true,
        "achievements": true,
        "disputes": true
    }',
    sms_notifications JSONB DEFAULT '{
        "payment_reminders": false,
        "urgent_disputes": false
    }',
    
    -- Privacy Settings
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'members_only', 'private')),
    show_statistics BOOLEAN DEFAULT TRUE,
    show_achievements BOOLEAN DEFAULT TRUE,
    show_groups BOOLEAN DEFAULT TRUE,
    
    -- Financial Preferences
    auto_contribute BOOLEAN DEFAULT FALSE,
    contribution_reminders BOOLEAN DEFAULT TRUE,
    savings_goals_public BOOLEAN DEFAULT FALSE,
    
    -- Advanced Settings
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    session_timeout_minutes INTEGER DEFAULT 60,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_preferences table
CREATE INDEX IF NOT EXISTS idx_user_preferences_wallet ON user_preferences(user_wallet_address);

-- =====================================================
-- GROUP_INVITATIONS TABLE
-- =====================================================
-- Manages group invitations and referrals
CREATE TABLE IF NOT EXISTS group_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    
    -- Invitation details
    inviter_wallet_address TEXT NOT NULL,
    invitee_wallet_address TEXT,
    invitee_email TEXT,
    invitee_phone TEXT,
    
    -- Invitation data
    invitation_code TEXT UNIQUE NOT NULL,
    message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
    
    -- Response tracking
    responded_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for group_invitations table
CREATE INDEX IF NOT EXISTS idx_group_invitations_group ON group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_inviter ON group_invitations(inviter_wallet_address);
CREATE INDEX IF NOT EXISTS idx_group_invitations_invitee ON group_invitations(invitee_wallet_address);
CREATE INDEX IF NOT EXISTS idx_group_invitations_code ON group_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON group_invitations(status);

-- =====================================================
-- REFERRAL_SYSTEM TABLE
-- =====================================================
-- Tracks user referrals and rewards
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referral parties
    referrer_wallet_address TEXT NOT NULL,
    referee_wallet_address TEXT NOT NULL,
    
    -- Referral details
    referral_code TEXT NOT NULL,
    referral_source TEXT, -- 'direct_link', 'email', 'social', etc.
    
    -- Reward tracking
    referrer_reward DECIMAL(20,8) DEFAULT 0,
    referee_reward DECIMAL(20,8) DEFAULT 0,
    rewards_paid BOOLEAN DEFAULT FALSE,
    reward_transaction_hash TEXT,
    
    -- Status and milestones
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'rewarded', 'expired')),
    qualification_criteria JSONB DEFAULT '{}', -- What the referee needs to do
    qualification_met_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(referrer_wallet_address, referee_wallet_address)
);

-- Create indexes for referrals table
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_wallet_address);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_wallet_address);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- =====================================================
-- PLATFORM_ANALYTICS TABLE
-- =====================================================
-- Stores aggregated platform analytics data
CREATE TABLE IF NOT EXISTS platform_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Time period
    date DATE NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    
    -- User metrics
    total_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,
    
    -- Group metrics
    total_groups INTEGER DEFAULT 0,
    new_groups INTEGER DEFAULT 0,
    active_groups INTEGER DEFAULT 0,
    completed_groups INTEGER DEFAULT 0,
    
    -- Financial metrics
    total_contributions DECIMAL(20,8) DEFAULT 0,
    total_payouts DECIMAL(20,8) DEFAULT 0,
    platform_fees DECIMAL(20,8) DEFAULT 0,
    
    -- Engagement metrics
    total_transactions INTEGER DEFAULT 0,
    average_session_duration INTEGER DEFAULT 0, -- in minutes
    page_views INTEGER DEFAULT 0,
    
    -- Feature usage
    achievements_earned INTEGER DEFAULT 0,
    disputes_filed INTEGER DEFAULT 0,
    notifications_sent INTEGER DEFAULT 0,
    
    -- Additional metrics
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(date, period_type)
);

-- Create indexes for platform_analytics table
CREATE INDEX IF NOT EXISTS idx_platform_analytics_date ON platform_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_period ON platform_analytics(period_type);

-- =====================================================
-- ADDITIONAL FUNCTIONS
-- =====================================================

-- Function to update savings goal progress
CREATE OR REPLACE FUNCTION update_savings_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the current_amount in savings_goals
    UPDATE savings_goals 
    SET 
        current_amount = (
            SELECT COALESCE(SUM(
                CASE 
                    WHEN transaction_type IN ('deposit', 'allocation', 'interest') THEN amount
                    WHEN transaction_type = 'withdrawal' THEN -amount
                    ELSE 0
                END
            ), 0)
            FROM savings_transactions 
            WHERE savings_goal_id = NEW.savings_goal_id 
            AND status = 'confirmed'
        ),
        updated_at = NOW()
    WHERE id = NEW.savings_goal_id;
    
    -- Check if goal is completed
    UPDATE savings_goals 
    SET 
        status = 'completed',
        completed_at = NOW()
    WHERE id = NEW.savings_goal_id 
    AND status = 'active'
    AND current_amount >= target_amount;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for savings goal progress updates
CREATE TRIGGER update_savings_progress_trigger
    AFTER INSERT OR UPDATE ON savings_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_savings_goal_progress();

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_wallet TEXT)
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- Generate a random 8-character code
        code := upper(substring(md5(random()::text || user_wallet || now()::text) from 1 for 8));
        
        -- Check if code already exists
        SELECT COUNT(*) INTO exists_check FROM referrals WHERE referral_code = code;
        
        -- If code doesn't exist, break the loop
        IF exists_check = 0 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate platform analytics
CREATE OR REPLACE FUNCTION calculate_daily_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO platform_analytics (
        date,
        period_type,
        total_users,
        new_users,
        active_users,
        total_groups,
        new_groups,
        active_groups,
        completed_groups,
        total_contributions,
        total_payouts,
        total_transactions,
        achievements_earned,
        disputes_filed,
        notifications_sent
    )
    VALUES (
        target_date,
        'daily',
        (SELECT COUNT(*) FROM users WHERE created_at::date <= target_date),
        (SELECT COUNT(*) FROM users WHERE created_at::date = target_date),
        (SELECT COUNT(*) FROM users WHERE last_active_at::date = target_date),
        (SELECT COUNT(*) FROM groups WHERE created_at::date <= target_date),
        (SELECT COUNT(*) FROM groups WHERE created_at::date = target_date),
        (SELECT COUNT(*) FROM groups WHERE status = 'active' AND created_at::date <= target_date),
        (SELECT COUNT(*) FROM groups WHERE status = 'completed' AND completed_at::date = target_date),
        (SELECT COALESCE(SUM(amount), 0) FROM contributions WHERE created_at::date <= target_date AND status = 'confirmed'),
        (SELECT COALESCE(SUM(payout_amount), 0) FROM group_members WHERE payout_received_at::date = target_date),
        (SELECT COUNT(*) FROM contributions WHERE created_at::date = target_date),
        (SELECT COUNT(*) FROM user_achievements WHERE earned_at::date = target_date),
        (SELECT COUNT(*) FROM disputes WHERE created_at::date = target_date),
        (SELECT COUNT(*) FROM notifications WHERE created_at::date = target_date)
    )
    ON CONFLICT (date, period_type) 
    DO UPDATE SET
        total_users = EXCLUDED.total_users,
        new_users = EXCLUDED.new_users,
        active_users = EXCLUDED.active_users,
        total_groups = EXCLUDED.total_groups,
        new_groups = EXCLUDED.new_groups,
        active_groups = EXCLUDED.active_groups,
        completed_groups = EXCLUDED.completed_groups,
        total_contributions = EXCLUDED.total_contributions,
        total_payouts = EXCLUDED.total_payouts,
        total_transactions = EXCLUDED.total_transactions,
        achievements_earned = EXCLUDED.achievements_earned,
        disputes_filed = EXCLUDED.disputes_filed,
        notifications_sent = EXCLUDED.notifications_sent;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ADDITIONAL TRIGGERS
-- =====================================================

-- Create triggers for updated_at columns on new tables
CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_invitations_updated_at BEFORE UPDATE ON group_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ADDITIONAL RLS POLICIES - DISABLED FOR DEVELOPMENT
-- =====================================================

-- RLS disabled on extended tables for development
-- ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Savings goals policies (disabled for development)
-- CREATE POLICY "Users can manage own savings goals" ON savings_goals FOR ALL USING (user_wallet_address = current_setting('app.current_user_wallet', true));
-- CREATE POLICY "Public savings goals are viewable" ON savings_goals FOR SELECT USING (is_public = true);

-- Savings transactions policies (disabled for development)
-- CREATE POLICY "Users can manage own savings transactions" ON savings_transactions FOR ALL USING (user_wallet_address = current_setting('app.current_user_wallet', true));

-- User preferences policies (disabled for development)
-- CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (user_wallet_address = current_setting('app.current_user_wallet', true));

-- Group invitations policies (disabled for development)
-- CREATE POLICY "Inviters can manage their invitations" ON group_invitations FOR ALL USING (inviter_wallet_address = current_setting('app.current_user_wallet', true));
-- CREATE POLICY "Invitees can view their invitations" ON group_invitations FOR SELECT USING (invitee_wallet_address = current_setting('app.current_user_wallet', true));

-- Referrals policies (disabled for development)
-- CREATE POLICY "Users can view referrals they're involved in" ON referrals FOR SELECT USING (
--     referrer_wallet_address = current_setting('app.current_user_wallet', true) OR 
--     referee_wallet_address = current_setting('app.current_user_wallet', true)
-- );

-- =====================================================
-- ADDITIONAL VIEWS
-- =====================================================

-- View for user savings summary
CREATE OR REPLACE VIEW user_savings_summary AS
SELECT 
    sg.user_wallet_address,
    COUNT(sg.id) as total_goals,
    COUNT(CASE WHEN sg.status = 'active' THEN 1 END) as active_goals,
    COUNT(CASE WHEN sg.status = 'completed' THEN 1 END) as completed_goals,
    COALESCE(SUM(sg.target_amount), 0) as total_target_amount,
    COALESCE(SUM(sg.current_amount), 0) as total_current_amount,
    COALESCE(AVG(sg.progress_percentage), 0) as average_progress
FROM savings_goals sg
GROUP BY sg.user_wallet_address;

-- View for group invitation summary
CREATE OR REPLACE VIEW group_invitation_summary AS
SELECT 
    gi.group_id,
    g.name as group_name,
    COUNT(gi.id) as total_invitations,
    COUNT(CASE WHEN gi.status = 'pending' THEN 1 END) as pending_invitations,
    COUNT(CASE WHEN gi.status = 'accepted' THEN 1 END) as accepted_invitations,
    COUNT(CASE WHEN gi.status = 'declined' THEN 1 END) as declined_invitations
FROM group_invitations gi
JOIN groups g ON gi.group_id = g.id
GROUP BY gi.group_id, g.name;

-- View for referral leaderboard
CREATE OR REPLACE VIEW referral_leaderboard AS
SELECT 
    r.referrer_wallet_address,
    u.display_name,
    COUNT(r.id) as total_referrals,
    COUNT(CASE WHEN r.status = 'qualified' THEN 1 END) as qualified_referrals,
    COUNT(CASE WHEN r.status = 'rewarded' THEN 1 END) as rewarded_referrals,
    COALESCE(SUM(r.referrer_reward), 0) as total_rewards_earned
FROM referrals r
LEFT JOIN users u ON r.referrer_wallet_address = u.wallet_address
GROUP BY r.referrer_wallet_address, u.display_name
ORDER BY total_referrals DESC, qualified_referrals DESC;

-- =====================================================
-- ADDITIONAL INITIAL DATA
-- =====================================================

-- Insert additional achievements for savings and referrals (using ON CONFLICT to handle duplicates)
INSERT INTO achievements (name, description, category, requirements, reward_points, badge_color, rarity) VALUES
('First Savings Goal', 'Created your first savings goal', 'milestone', '{"type": "savings_goals_created", "required_count": 1}', 15, '#10b981', 'common'),
('Goal Achiever', 'Completed your first savings goal', 'milestone', '{"type": "savings_goals_completed", "required_count": 1}', 50, '#3b82f6', 'uncommon'),
('Super Saver', 'Completed 5 savings goals', 'milestone', '{"type": "savings_goals_completed", "required_count": 5}', 150, '#8b5cf6', 'rare'),
('Referral Master', 'Referred 10 users to the platform', 'social', '{"type": "referrals_made", "required_count": 10}', 100, '#f59e0b', 'uncommon'),
('Community Ambassador', 'Referred 25 users to the platform', 'social', '{"type": "referrals_made", "required_count": 25}', 250, '#ef4444', 'epic'),
('Invitation Expert', 'Sent 50 group invitations', 'social', '{"type": "invitations_sent", "required_count": 50}', 75, '#06b6d4', 'uncommon')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    requirements = EXCLUDED.requirements,
    reward_points = EXCLUDED.reward_points,
    badge_color = EXCLUDED.badge_color,
    rarity = EXCLUDED.rarity,
    updated_at = NOW();

-- Insert additional system settings (using ON CONFLICT to handle duplicates)
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
('referral_reward_amount', '0.001', 'Reward amount for successful referrals (in cBTC)', 'referral', false),
('savings_goal_max_count', '10', 'Maximum number of active savings goals per user', 'savings', true),
('invitation_expiry_days', '7', 'Number of days before group invitations expire', 'invitations', true),
('analytics_retention_days', '365', 'Number of days to retain analytics data', 'analytics', false),
('max_referral_rewards_per_user', '100', 'Maximum number of referral rewards per user', 'referral', false)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    is_public = EXCLUDED.is_public,
    updated_at = NOW();

-- =====================================================
-- PERMISSIONS FOR DEVELOPMENT (WITHOUT RLS)
-- =====================================================

-- Grant full access to authenticated users on all tables
GRANT ALL ON users TO authenticated;
GRANT ALL ON groups TO authenticated;
GRANT ALL ON group_members TO authenticated;
GRANT ALL ON contributions TO authenticated;
GRANT ALL ON disputes TO authenticated;
GRANT ALL ON dispute_votes TO authenticated;
GRANT ALL ON achievements TO authenticated;
GRANT ALL ON user_achievements TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON activity_log TO authenticated;
GRANT ALL ON system_settings TO authenticated;
GRANT ALL ON savings_goals TO authenticated;
GRANT ALL ON savings_transactions TO authenticated;
GRANT ALL ON user_preferences TO authenticated;
GRANT ALL ON group_invitations TO authenticated;
GRANT ALL ON referrals TO authenticated;
GRANT ALL ON platform_analytics TO authenticated;

-- Grant sequence access
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant function execution
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Allow anonymous users to read public data
GRANT SELECT ON achievements TO anon;
GRANT SELECT ON groups TO anon;
GRANT SELECT ON platform_analytics TO anon;

-- =====================================================
-- END OF ENHANCED SCHEMA
-- =====================================================
