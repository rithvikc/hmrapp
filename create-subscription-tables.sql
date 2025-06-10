-- Subscription Tables Setup for LAL MedReviews
-- Run this in your Supabase SQL Editor after the main tables

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price_monthly INTEGER NOT NULL, -- in cents
  hmr_limit INTEGER, -- NULL for unlimited
  features TEXT NOT NULL, -- JSON array of features
  stripe_price_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacist_id UUID NOT NULL REFERENCES pharmacists(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing, incomplete
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(pharmacist_id) -- One subscription per pharmacist
);

-- Create usage_tracking table for monitoring HMR usage
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacist_id UUID NOT NULL REFERENCES pharmacists(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  hmr_count INTEGER DEFAULT 0,
  last_hmr_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(pharmacist_id, month_year)
);

-- Create onboarding_status table
CREATE TABLE IF NOT EXISTS onboarding_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacist_id UUID NOT NULL REFERENCES pharmacists(id) ON DELETE CASCADE,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  welcome_tour_completed BOOLEAN DEFAULT false,
  first_hmr_created BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(pharmacist_id)
);

-- Enable RLS on subscription tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription tables
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Pharmacists can view own subscription" ON user_subscriptions
  FOR ALL USING (pharmacist_id IN (
    SELECT id FROM pharmacists WHERE user_id = auth.uid()
  ));

CREATE POLICY "Pharmacists can view own usage" ON usage_tracking
  FOR ALL USING (pharmacist_id IN (
    SELECT id FROM pharmacists WHERE user_id = auth.uid()
  ));

CREATE POLICY "Pharmacists can view own onboarding" ON onboarding_status
  FOR ALL USING (pharmacist_id IN (
    SELECT id FROM pharmacists WHERE user_id = auth.uid()
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pharmacist_id ON user_subscriptions(pharmacist_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_pharmacist_month ON usage_tracking(pharmacist_id, month_year);
CREATE INDEX IF NOT EXISTS idx_onboarding_pharmacist_id ON onboarding_status(pharmacist_id);

-- Insert the three pricing tiers
INSERT INTO subscription_plans (id, name, price_monthly, hmr_limit, features, sort_order) VALUES
('trial', 'Free Trial', 0, 3, '[
  "3 free HMR reports",
  "Basic report templates", 
  "Email support",
  "PDF export",
  "Patient data security"
]', 0),

('professional', 'Professional', 10000, 30, '[
  "30 HMR reports per month",
  "Advanced report templates",
  "Priority email support", 
  "PDF & Word export",
  "Patient data security",
  "Clinical recommendations",
  "Custom branding",
  "Phone support"
]', 1),

('business', 'Business', 25000, 100, '[
  "100 HMR reports per month",
  "All Professional features",
  "Multi-user management",
  "Team collaboration tools",
  "Advanced analytics", 
  "Custom integrations",
  "Dedicated account manager",
  "Training & onboarding",
  "White-label options"
]', 2)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  hmr_limit = EXCLUDED.hmr_limit,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Create function to increment usage tracking
CREATE OR REPLACE FUNCTION increment_hmr_usage(p_pharmacist_id UUID)
RETURNS void AS $$
DECLARE
  current_month VARCHAR(7);
BEGIN
  current_month := to_char(CURRENT_DATE, 'YYYY-MM');
  
  INSERT INTO usage_tracking (pharmacist_id, month_year, hmr_count, last_hmr_date)
  VALUES (p_pharmacist_id, current_month, 1, NOW())
  ON CONFLICT (pharmacist_id, month_year) 
  DO UPDATE SET 
    hmr_count = usage_tracking.hmr_count + 1,
    last_hmr_date = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check HMR limits
CREATE OR REPLACE FUNCTION check_hmr_limit(p_pharmacist_id UUID)
RETURNS json AS $$
DECLARE
  current_month VARCHAR(7);
  usage_count INTEGER;
  plan_limit INTEGER;
  result json;
BEGIN
  current_month := to_char(CURRENT_DATE, 'YYYY-MM');
  
  -- Get current usage
  SELECT COALESCE(hmr_count, 0) INTO usage_count
  FROM usage_tracking 
  WHERE pharmacist_id = p_pharmacist_id AND month_year = current_month;
  
  -- Get plan limit
  SELECT sp.hmr_limit INTO plan_limit
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.pharmacist_id = p_pharmacist_id 
    AND us.status IN ('active', 'trialing');
  
  -- Return result
  SELECT json_build_object(
    'current_usage', COALESCE(usage_count, 0),
    'limit', plan_limit,
    'can_create', (plan_limit IS NULL OR COALESCE(usage_count, 0) < plan_limit),
    'month', current_month
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 