-- Database Functions for Jenga Application
-- Run these in your Supabase SQL Editor after creating the main tables

-- Function to increment chama member count
CREATE OR REPLACE FUNCTION increment_chama_members(chama_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.chamas 
  SET current_members = current_members + 1,
      updated_at = NOW()
  WHERE id = chama_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement chama member count
CREATE OR REPLACE FUNCTION decrement_chama_members(chama_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.chamas 
  SET current_members = GREATEST(current_members - 1, 0),
      updated_at = NOW()
  WHERE id = chama_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate user reputation score
CREATE OR REPLACE FUNCTION calculate_user_reputation(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  base_score INTEGER := 0;
  contribution_score INTEGER := 0;
  consistency_score INTEGER := 0;
  membership_score INTEGER := 0;
BEGIN
  -- Base score from contributions (1 point per 1000 sats contributed)
  SELECT COALESCE(SUM(amount) / 1000, 0)::INTEGER
  INTO contribution_score
  FROM public.contributions
  WHERE user_id = calculate_user_reputation.user_id
    AND status = 'confirmed';

  -- Consistency score (10 points per successful contribution, -5 for missed)
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE status = 'confirmed') * 10) -
    (COUNT(*) FILTER (WHERE is_late = true) * 5),
    0
  )
  INTO consistency_score
  FROM public.contributions
  WHERE user_id = calculate_user_reputation.user_id;

  -- Membership score (5 points per active chama membership)
  SELECT COALESCE(COUNT(*) * 5, 0)
  INTO membership_score
  FROM public.chama_members
  WHERE user_id = calculate_user_reputation.user_id
    AND status = 'active';

  -- Calculate total reputation
  base_score := contribution_score + consistency_score + membership_score;

  -- Update user's reputation score
  UPDATE public.users
  SET reputation_score = base_score,
      updated_at = NOW()
  WHERE id = calculate_user_reputation.user_id;

  RETURN base_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get chama statistics
CREATE OR REPLACE FUNCTION get_chama_stats(chama_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_contributions', COALESCE(SUM(c.amount), 0),
    'total_members', COUNT(DISTINCT cm.user_id),
    'active_members', COUNT(DISTINCT cm.user_id) FILTER (WHERE cm.status = 'active'),
    'completion_rate', 
      CASE 
        WHEN COUNT(c.id) > 0 THEN 
          (COUNT(c.id) FILTER (WHERE c.status = 'confirmed')::FLOAT / COUNT(c.id) * 100)
        ELSE 0 
      END,
    'average_contribution', 
      CASE 
        WHEN COUNT(c.id) FILTER (WHERE c.status = 'confirmed') > 0 THEN
          AVG(c.amount) FILTER (WHERE c.status = 'confirmed')
        ELSE 0
      END
  )
  INTO result
  FROM public.chamas ch
  LEFT JOIN public.chama_members cm ON ch.id = cm.chama_id
  LEFT JOIN public.contributions c ON ch.id = c.chama_id
  WHERE ch.id = get_chama_stats.chama_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user dashboard stats
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_stacked', COALESCE(
      (SELECT SUM(amount) FROM public.stacking_records WHERE user_id = get_user_dashboard_stats.user_id), 
      0
    ),
    'total_contributed', COALESCE(
      (SELECT SUM(amount) FROM public.contributions WHERE user_id = get_user_dashboard_stats.user_id AND status = 'confirmed'), 
      0
    ),
    'total_received', COALESCE(
      (SELECT SUM(amount) FROM public.payouts WHERE recipient_id = get_user_dashboard_stats.user_id AND status = 'confirmed'), 
      0
    ),
    'active_chamas', COALESCE(
      (SELECT COUNT(*) FROM public.chama_members WHERE user_id = get_user_dashboard_stats.user_id AND status = 'active'), 
      0
    ),
    'stacking_streak', COALESCE(
      (SELECT stacking_streak FROM public.users WHERE id = get_user_dashboard_stats.user_id), 
      0
    ),
    'reputation_score', COALESCE(
      (SELECT reputation_score FROM public.users WHERE id = get_user_dashboard_stats.user_id), 
      0
    ),
    'recent_activity', (
      SELECT json_agg(
        json_build_object(
          'type', activity_type,
          'amount', amount,
          'date', created_at,
          'description', description
        )
      )
      FROM (
        SELECT 
          'stacking' as activity_type,
          amount,
          created_at,
          'Stacked ' || amount || ' sats' as description
        FROM public.stacking_records 
        WHERE user_id = get_user_dashboard_stats.user_id
        
        UNION ALL
        
        SELECT 
          'contribution' as activity_type,
          amount,
          created_at,
          'Contributed ' || amount || ' sats to chama' as description
        FROM public.contributions 
        WHERE user_id = get_user_dashboard_stats.user_id AND status = 'confirmed'
        
        UNION ALL
        
        SELECT 
          'payout' as activity_type,
          amount,
          created_at,
          'Received ' || amount || ' sats payout' as description
        FROM public.payouts 
        WHERE recipient_id = get_user_dashboard_stats.user_id AND status = 'confirmed'
        
        ORDER BY created_at DESC
        LIMIT 10
      ) activities
    )
  )
  INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id UUID,
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT NULL,
  action_url TEXT DEFAULT NULL,
  metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    action_url,
    metadata
  )
  VALUES (
    target_user_id,
    notification_title,
    notification_message,
    notification_type,
    action_url,
    metadata
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle chama payout
CREATE OR REPLACE FUNCTION process_chama_payout(
  chama_id UUID,
  recipient_id UUID,
  payout_amount DECIMAL,
  round_number INTEGER
)
RETURNS UUID AS $$
DECLARE
  payout_id UUID;
BEGIN
  -- Create payout record
  INSERT INTO public.payouts (
    chama_id,
    recipient_id,
    amount,
    round_number,
    status
  )
  VALUES (
    chama_id,
    recipient_id,
    payout_amount,
    round_number,
    'pending'
  )
  RETURNING id INTO payout_id;

  -- Update chama member's total received
  UPDATE public.chama_members
  SET total_received = total_received + payout_amount
  WHERE chama_id = process_chama_payout.chama_id 
    AND user_id = recipient_id;

  -- Create notification
  PERFORM create_notification(
    recipient_id,
    'Payout Ready',
    'Your chama payout of ' || payout_amount || ' sats is ready!',
    'payout_ready',
    '/chamas/' || chama_id
  );

  RETURN payout_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to update user stats after contribution
CREATE OR REPLACE FUNCTION update_user_stats_after_contribution()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's total contributions
  UPDATE public.users
  SET total_contributions = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.contributions
    WHERE user_id = NEW.user_id AND status = 'confirmed'
  ),
  updated_at = NOW()
  WHERE id = NEW.user_id;

  -- Update chama member's contribution total
  UPDATE public.chama_members
  SET total_contributed = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.contributions
    WHERE user_id = NEW.user_id 
      AND chama_id = NEW.chama_id 
      AND status = 'confirmed'
  ),
  last_contribution_date = NEW.contribution_date
  WHERE user_id = NEW.user_id AND chama_id = NEW.chama_id;

  -- Recalculate reputation score
  PERFORM calculate_user_reputation(NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for contribution updates
DROP TRIGGER IF EXISTS trigger_update_user_stats_after_contribution ON public.contributions;
CREATE TRIGGER trigger_update_user_stats_after_contribution
  AFTER INSERT OR UPDATE ON public.contributions
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION update_user_stats_after_contribution();

-- Function to get trending chamas
CREATE OR REPLACE FUNCTION get_trending_chamas(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  contribution_amount DECIMAL,
  current_members INTEGER,
  max_members INTEGER,
  category TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  member_growth_rate DECIMAL,
  activity_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.contribution_amount,
    c.current_members,
    c.max_members,
    c.category,
    c.location,
    c.created_at,
    -- Calculate member growth rate (members joined in last 7 days / total members)
    CASE 
      WHEN c.current_members > 0 THEN
        (SELECT COUNT(*)::DECIMAL FROM public.chama_members cm 
         WHERE cm.chama_id = c.id 
           AND cm.joined_at >= NOW() - INTERVAL '7 days') / c.current_members
      ELSE 0
    END as member_growth_rate,
    -- Calculate activity score based on recent contributions
    COALESCE(
      (SELECT COUNT(*)::DECIMAL FROM public.contributions cont 
       WHERE cont.chama_id = c.id 
         AND cont.created_at >= NOW() - INTERVAL '7 days'), 
      0
    ) as activity_score
  FROM public.chamas c
  WHERE c.is_active = true 
    AND c.is_public = true
  ORDER BY 
    member_growth_rate DESC,
    activity_score DESC,
    c.current_members DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION increment_chama_members TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_chama_members TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_reputation TO authenticated;
GRANT EXECUTE ON FUNCTION get_chama_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION process_chama_payout TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_chamas TO authenticated;
