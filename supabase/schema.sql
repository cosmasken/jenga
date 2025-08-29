-- Supabase Schema for Off-Chain Chama Management
-- This script sets up the complete database schema for the hybrid chama system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE chama_status AS ENUM (
    'draft',        -- Being created, not yet open for joining
    'recruiting',   -- Open for members to join
    'waiting',      -- Full, waiting for deposits and start
    'active',       -- ROSCA is running
    'completed',    -- All rounds completed
    'cancelled'     -- Cancelled before completion
);

CREATE TYPE member_status AS ENUM (
    'invited',      -- Invited but not yet responded
    'pending',      -- Expressed interest, waiting for confirmation
    'confirmed',    -- Confirmed member, deposit pending
    'active',       -- Active member with deposit paid
    'defaulted',    -- Missed too many contributions
    'completed',    -- Successfully completed all rounds
    'withdrawn'     -- Left the chama
);

CREATE TYPE deposit_status AS ENUM (
    'pending',      -- Deposit required but not yet paid
    'paid',         -- Deposit paid to off-chain system
    'confirmed',    -- Deposit confirmed on blockchain
    'forfeited'     -- Deposit forfeited due to default
);

CREATE TYPE contribution_status AS ENUM (
    'pending',      -- Contribution due but not made
    'paid',         -- Contribution made off-chain
    'confirmed',    -- Contribution confirmed on-chain
    'failed',       -- Contribution attempt failed
    'refunded'      -- Contribution refunded
);

CREATE TYPE round_status AS ENUM (
    'pending',      -- Round not yet started
    'active',       -- Round is currently active
    'completed',    -- Round completed successfully
    'expired',      -- Round expired without completion
    'cancelled'     -- Round cancelled
);

CREATE TYPE batch_operation_status AS ENUM (
    'pending',      -- Operation queued
    'executing',    -- Currently being executed
    'completed',    -- Successfully completed
    'failed',       -- Failed execution
    'cancelled'     -- Cancelled before execution
);

-- Main chama management table
CREATE TABLE chamas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_address TEXT UNIQUE, -- NULL until deployed to chain
    name TEXT NOT NULL CHECK (length(name) >= 3 AND length(name) <= 100),
    description TEXT CHECK (length(description) <= 1000),
    creator_address TEXT NOT NULL CHECK (creator_address ~ '^0x[a-fA-F0-9]{40}$'),
    
    -- Chama configuration
    contribution_amount DECIMAL(20, 8) NOT NULL CHECK (contribution_amount > 0),
    security_deposit DECIMAL(20, 8) NOT NULL CHECK (security_deposit >= 0),
    member_target INTEGER NOT NULL CHECK (member_target >= 2 AND member_target <= 100),
    round_duration_hours INTEGER NOT NULL CHECK (round_duration_hours >= 24), -- Minimum 1 day
    
    -- Status tracking
    status chama_status NOT NULL DEFAULT 'draft',
    chain_status INTEGER, -- Maps to smart contract status enum
    current_round INTEGER DEFAULT 0,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recruitment_deadline TIMESTAMP WITH TIME ZONE,
    chain_deployed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    is_private BOOLEAN DEFAULT FALSE,
    invitation_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'base64url'),
    chain_tx_hash TEXT CHECK (chain_tx_hash IS NULL OR chain_tx_hash ~ '^0x[a-fA-F0-9]{64}$'),
    
    -- Settings
    auto_start BOOLEAN DEFAULT TRUE,
    allow_late_join BOOLEAN DEFAULT FALSE,
    late_fee_percentage INTEGER DEFAULT 5 CHECK (late_fee_percentage >= 0 AND late_fee_percentage <= 50),
    
    -- Constraints
    CONSTRAINT valid_recruitment_deadline CHECK (recruitment_deadline IS NULL OR recruitment_deadline > created_at),
    CONSTRAINT valid_security_deposit CHECK (security_deposit <= contribution_amount * 5) -- Max 5x contribution
);

-- Member management table
CREATE TABLE chama_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID NOT NULL REFERENCES chamas(id) ON DELETE CASCADE,
    user_address TEXT NOT NULL CHECK (user_address ~ '^0x[a-fA-F0-9]{40}$'),
    
    -- Member status
    status member_status NOT NULL DEFAULT 'invited',
    join_method TEXT NOT NULL DEFAULT 'invited' CHECK (join_method IN ('invited', 'direct_join', 'creator')),
    
    -- Financial tracking
    deposit_status deposit_status NOT NULL DEFAULT 'pending',
    deposit_amount DECIMAL(20, 8) DEFAULT 0,
    deposit_tx_hash TEXT CHECK (deposit_tx_hash IS NULL OR deposit_tx_hash ~ '^0x[a-fA-F0-9]{64}$'),
    
    -- Participation tracking
    agreed_to_terms BOOLEAN DEFAULT FALSE,
    agreed_at TIMESTAMP WITH TIME ZONE,
    total_contributions DECIMAL(20, 8) DEFAULT 0,
    rounds_contributed INTEGER DEFAULT 0,
    rounds_missed INTEGER DEFAULT 0,
    
    -- Payout tracking
    has_received_payout BOOLEAN DEFAULT FALSE,
    payout_round INTEGER,
    payout_amount DECIMAL(20, 8),
    payout_tx_hash TEXT,
    
    -- Chain synchronization
    chain_confirmed BOOLEAN DEFAULT FALSE,
    chain_sync_at TIMESTAMP WITH TIME ZONE,
    
    -- Timing
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    notes TEXT,
    
    -- Constraints
    UNIQUE(chama_id, user_address),
    CONSTRAINT valid_payout_round CHECK (payout_round IS NULL OR payout_round > 0),
    CONSTRAINT valid_payout_amount CHECK (payout_amount IS NULL OR payout_amount > 0)
);

-- Round management table
CREATE TABLE chama_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID NOT NULL REFERENCES chamas(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL CHECK (round_number > 0),
    
    -- Round configuration
    winner_address TEXT CHECK (winner_address IS NULL OR winner_address ~ '^0x[a-fA-F0-9]{40}$'),
    winner_selection_method TEXT DEFAULT 'lottery' CHECK (winner_selection_method IN ('lottery', 'rotation', 'bidding')),
    payout_amount DECIMAL(20, 8),
    
    -- Timing
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status round_status NOT NULL DEFAULT 'pending',
    chain_confirmed BOOLEAN DEFAULT FALSE,
    chain_tx_hash TEXT CHECK (chain_tx_hash IS NULL OR chain_tx_hash ~ '^0x[a-fA-F0-9]{64}$'),
    
    -- Participation tracking
    expected_contributions INTEGER NOT NULL CHECK (expected_contributions > 0),
    received_contributions INTEGER DEFAULT 0 CHECK (received_contributions >= 0),
    total_pot DECIMAL(20, 8) DEFAULT 0 CHECK (total_pot >= 0),
    
    -- Metadata
    notes TEXT,
    
    -- Constraints
    UNIQUE(chama_id, round_number),
    CONSTRAINT valid_timing CHECK (end_time > start_time),
    CONSTRAINT valid_actual_end CHECK (actual_end_time IS NULL OR actual_end_time <= end_time + INTERVAL '7 days'),
    CONSTRAINT valid_contributions CHECK (received_contributions <= expected_contributions)
);

-- Contribution tracking table
CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID NOT NULL REFERENCES chamas(id) ON DELETE CASCADE,
    round_id UUID NOT NULL REFERENCES chama_rounds(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES chama_members(id) ON DELETE CASCADE,
    
    -- Contribution details
    amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
    contributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    
    -- Status tracking
    status contribution_status NOT NULL DEFAULT 'pending',
    is_late BOOLEAN DEFAULT FALSE,
    late_penalty DECIMAL(20, 8) DEFAULT 0 CHECK (late_penalty >= 0),
    
    -- Chain synchronization
    chain_tx_hash TEXT CHECK (chain_tx_hash IS NULL OR chain_tx_hash ~ '^0x[a-fA-F0-9]{64}$'),
    chain_confirmed BOOLEAN DEFAULT FALSE,
    chain_sync_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    contribution_method TEXT DEFAULT 'wallet' CHECK (contribution_method IN ('wallet', 'auto_deduct')),
    notes TEXT,
    
    -- Constraints
    UNIQUE(round_id, member_id)
);

-- Invitation and notification system
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID NOT NULL REFERENCES chamas(id) ON DELETE CASCADE,
    inviter_address TEXT NOT NULL CHECK (inviter_address ~ '^0x[a-fA-F0-9]{40}$'),
    invitee_address TEXT CHECK (invitee_address IS NULL OR invitee_address ~ '^0x[a-fA-F0-9]{40}$'),
    invitee_email TEXT CHECK (invitee_email IS NULL OR invitee_email ~ '^[^@]+@[^@]+\.[^@]+$'),
    
    -- Invitation details
    invitation_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64url'),
    message TEXT CHECK (length(message) <= 500),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'accepted', 'rejected', 'expired')),
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT invitation_target CHECK (invitee_address IS NOT NULL OR invitee_email IS NOT NULL),
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Event log for audit trail
CREATE TABLE chama_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID NOT NULL REFERENCES chamas(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    actor_address TEXT NOT NULL CHECK (actor_address ~ '^0x[a-fA-F0-9]{40}$'),
    
    -- Event data
    event_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Chain reference
    chain_tx_hash TEXT CHECK (chain_tx_hash IS NULL OR chain_tx_hash ~ '^0x[a-fA-F0-9]{64}$'),
    block_number BIGINT CHECK (block_number IS NULL OR block_number > 0),
    
    -- Additional context
    ip_address INET,
    user_agent TEXT
);

-- Batch operations for chain synchronization
CREATE TABLE batch_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type TEXT NOT NULL CHECK (operation_type IN ('deploy_chama', 'batch_join', 'batch_contribute', 'start_rosca', 'complete_round')),
    chama_id UUID NOT NULL REFERENCES chamas(id) ON DELETE CASCADE,
    
    -- Operation data
    operation_data JSONB NOT NULL,
    estimated_gas BIGINT CHECK (estimated_gas IS NULL OR estimated_gas > 0),
    gas_price DECIMAL(20, 8),
    
    -- Status tracking
    status batch_operation_status NOT NULL DEFAULT 'pending',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0),
    max_retries INTEGER DEFAULT 3 CHECK (max_retries >= 0),
    
    -- Chain details
    tx_hash TEXT CHECK (tx_hash IS NULL OR tx_hash ~ '^0x[a-fA-F0-9]{64}$'),
    block_number BIGINT CHECK (block_number IS NULL OR block_number > 0),
    gas_used BIGINT CHECK (gas_used IS NULL OR gas_used > 0),
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_retry_logic CHECK (retry_count <= max_retries),
    CONSTRAINT valid_execution_timing CHECK (executed_at IS NULL OR executed_at >= scheduled_for)
);

-- User profiles (optional, for enhanced UX)
CREATE TABLE user_profiles (
    user_address TEXT PRIMARY KEY CHECK (user_address ~ '^0x[a-fA-F0-9]{40}$'),
    display_name TEXT CHECK (length(display_name) <= 50),
    email TEXT UNIQUE CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
    avatar_url TEXT,
    
    -- Preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    timezone TEXT DEFAULT 'UTC',
    
    -- Stats
    chamas_created INTEGER DEFAULT 0 CHECK (chamas_created >= 0),
    chamas_joined INTEGER DEFAULT 0 CHECK (chamas_joined >= 0),
    total_contributions DECIMAL(20, 8) DEFAULT 0 CHECK (total_contributions >= 0),
    reliability_score DECIMAL(5, 2) DEFAULT 100.00 CHECK (reliability_score >= 0 AND reliability_score <= 100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_chamas_creator ON chamas(creator_address);
CREATE INDEX idx_chamas_status ON chamas(status);
CREATE INDEX idx_chamas_chain_address ON chamas(chain_address) WHERE chain_address IS NOT NULL;
CREATE INDEX idx_chamas_created_at ON chamas(created_at DESC);

CREATE INDEX idx_members_chama ON chama_members(chama_id);
CREATE INDEX idx_members_user ON chama_members(user_address);
CREATE INDEX idx_members_status ON chama_members(status);
CREATE INDEX idx_members_chain_confirmed ON chama_members(chain_confirmed);

CREATE INDEX idx_rounds_chama ON chama_rounds(chama_id);
CREATE INDEX idx_rounds_status ON chama_rounds(status);
CREATE INDEX idx_rounds_timing ON chama_rounds(start_time, end_time);
CREATE INDEX idx_rounds_winner ON chama_rounds(winner_address) WHERE winner_address IS NOT NULL;

CREATE INDEX idx_contributions_chama ON contributions(chama_id);
CREATE INDEX idx_contributions_round ON contributions(round_id);
CREATE INDEX idx_contributions_member ON contributions(member_id);
CREATE INDEX idx_contributions_status ON contributions(status);
CREATE INDEX idx_contributions_due_date ON contributions(due_date) WHERE due_date IS NOT NULL;

CREATE INDEX idx_invitations_chama ON invitations(chama_id);
CREATE INDEX idx_invitations_code ON invitations(invitation_code);
CREATE INDEX idx_invitations_invitee ON invitations(invitee_address) WHERE invitee_address IS NOT NULL;
CREATE INDEX idx_invitations_expires ON invitations(expires_at);

CREATE INDEX idx_events_chama ON chama_events(chama_id);
CREATE INDEX idx_events_type ON chama_events(event_type);
CREATE INDEX idx_events_actor ON chama_events(actor_address);
CREATE INDEX idx_events_created ON chama_events(created_at DESC);

CREATE INDEX idx_batch_ops_chama ON batch_operations(chama_id);
CREATE INDEX idx_batch_ops_status ON batch_operations(status);
CREATE INDEX idx_batch_ops_type ON batch_operations(operation_type);
CREATE INDEX idx_batch_ops_scheduled ON batch_operations(scheduled_for);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to user_profiles
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper functions
CREATE OR REPLACE FUNCTION get_chama_member_count(chama_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM chama_members
        WHERE chama_members.chama_id = get_chama_member_count.chama_id
        AND status IN ('confirmed', 'active')
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_round_participation_rate(round_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    expected_contributions INTEGER;
    received_contributions INTEGER;
BEGIN
    SELECT 
        cr.expected_contributions,
        cr.received_contributions
    INTO expected_contributions, received_contributions
    FROM chama_rounds cr
    WHERE cr.id = round_id;
    
    IF expected_contributions = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN (received_contributions::DECIMAL / expected_contributions::DECIMAL) * 100;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE chamas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chama_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chama_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chama_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for chamas table
CREATE POLICY "Users can view chamas they are members of or created" ON chamas
    FOR SELECT USING (
        creator_address = current_setting('app.current_user_address', true)::text
        OR id IN (
            SELECT chama_id FROM chama_members 
            WHERE user_address = current_setting('app.current_user_address', true)::text
            AND status IN ('confirmed', 'active')
        )
        OR NOT is_private
    );

CREATE POLICY "Users can create chamas" ON chamas
    FOR INSERT WITH CHECK (creator_address = current_setting('app.current_user_address', true)::text);

CREATE POLICY "Creators can update their chamas" ON chamas
    FOR UPDATE USING (creator_address = current_setting('app.current_user_address', true)::text);

-- Policies for chama_members table
CREATE POLICY "Users can view members of chamas they're involved in" ON chama_members
    FOR SELECT USING (
        chama_id IN (
            SELECT id FROM chamas 
            WHERE creator_address = current_setting('app.current_user_address', true)::text
            OR id IN (
                SELECT chama_id FROM chama_members 
                WHERE user_address = current_setting('app.current_user_address', true)::text
            )
        )
    );

CREATE POLICY "Users can insert themselves as members" ON chama_members
    FOR INSERT WITH CHECK (user_address = current_setting('app.current_user_address', true)::text);

CREATE POLICY "Users can update their own membership" ON chama_members
    FOR UPDATE USING (user_address = current_setting('app.current_user_address', true)::text);

-- Policies for user_profiles table
CREATE POLICY "Users can view and edit their own profile" ON user_profiles
    FOR ALL USING (user_address = current_setting('app.current_user_address', true)::text);

-- Similar policies for other tables...
-- (Additional policies would be added for each table based on business requirements)

-- Initial data
INSERT INTO user_profiles (user_address, display_name) VALUES
('0x0000000000000000000000000000000000000001', 'System Account')
ON CONFLICT (user_address) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE chamas IS 'Main table for chama/ROSCA management with off-chain state';
COMMENT ON TABLE chama_members IS 'Members of each chama with status and financial tracking';
COMMENT ON TABLE chama_rounds IS 'Individual rounds within a chama';
COMMENT ON TABLE contributions IS 'Member contributions to specific rounds';
COMMENT ON TABLE batch_operations IS 'Queue for batch operations to be committed to blockchain';
COMMENT ON TABLE chama_events IS 'Audit log of all chama-related events';
COMMENT ON TABLE invitations IS 'Invitation system for chama recruitment';
COMMENT ON TABLE user_profiles IS 'User profiles and preferences';

COMMENT ON COLUMN chamas.chain_address IS 'Smart contract address once deployed to blockchain';
COMMENT ON COLUMN chamas.invitation_code IS 'Unique code for private chama invitations';
COMMENT ON COLUMN batch_operations.operation_data IS 'JSONB data containing all parameters for the batch operation';
