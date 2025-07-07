-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  tutorial_steps_completed JSONB DEFAULT '[]'::jsonb,
  chama_preferences JSONB DEFAULT '{}'::jsonb,
  reputation_score INTEGER DEFAULT 0,
  total_contributions BIGINT DEFAULT 0,
  successful_cycles INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding progress tracking
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Chama participation tracking (for reputation)
CREATE TABLE chama_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  chama_address TEXT NOT NULL,
  chama_name TEXT,
  contribution_amount BIGINT NOT NULL,
  frequency TEXT NOT NULL, -- 'weekly', 'monthly'
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'defaulted'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_contributed BIGINT DEFAULT 0,
  cycles_completed INTEGER DEFAULT 0
);

-- User achievements/badges
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- 'first_contribution', 'cycle_complete', 'trusted_member', etc.
  achievement_data JSONB DEFAULT '{}'::jsonb,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  contribution_reminders BOOLEAN DEFAULT TRUE,
  chama_updates BOOLEAN DEFAULT TRUE,
  achievement_alerts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_user_profiles_wallet_address ON user_profiles(wallet_address);
CREATE INDEX idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX idx_chama_participations_user_id ON chama_participations(user_id);
CREATE INDEX idx_chama_participations_chama_address ON chama_participations(chama_address);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chama_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Similar policies for other tables
CREATE POLICY "Users can view own onboarding progress" ON onboarding_progress
  FOR SELECT USING (user_id IN (
    SELECT id FROM user_profiles 
    WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
  ));

CREATE POLICY "Users can insert own onboarding progress" ON onboarding_progress
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM user_profiles 
    WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
  ));

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at 
  BEFORE UPDATE ON notification_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user reputation score
CREATE OR REPLACE FUNCTION calculate_reputation_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  base_score INTEGER := 0;
  participation_bonus INTEGER := 0;
  completion_bonus INTEGER := 0;
  achievement_bonus INTEGER := 0;
BEGIN
  -- Base score for completing onboarding
  SELECT CASE WHEN onboarding_completed THEN 100 ELSE 0 END
  INTO base_score
  FROM user_profiles
  WHERE id = user_uuid;
  
  -- Bonus for active participations (10 points per active chama)
  SELECT COUNT(*) * 10
  INTO participation_bonus
  FROM chama_participations
  WHERE user_id = user_uuid AND status = 'active';
  
  -- Bonus for completed cycles (25 points per completed cycle)
  SELECT COALESCE(SUM(cycles_completed), 0) * 25
  INTO completion_bonus
  FROM chama_participations
  WHERE user_id = user_uuid;
  
  -- Bonus for achievements (50 points per achievement)
  SELECT COUNT(*) * 50
  INTO achievement_bonus
  FROM user_achievements
  WHERE user_id = user_uuid;
  
  RETURN base_score + participation_bonus + completion_bonus + achievement_bonus;
END;
$$ LANGUAGE plpgsql;

-- Insert default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_notification_preferences_for_new_user
  AFTER INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_notification_preferences();
