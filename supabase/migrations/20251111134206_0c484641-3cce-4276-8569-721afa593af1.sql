-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription Status
  subscription_status TEXT NOT NULL DEFAULT 'trial'
    CHECK (subscription_status IN ('trial', 'premium', 'free', 'cancelled', 'expired')),
  
  -- Tier & Limits (denormalized for performance)
  tier TEXT NOT NULL DEFAULT 'free' 
    CHECK (tier IN ('free', 'premium')),
  image_analysis_limit INTEGER NOT NULL DEFAULT 10,
  ai_recipe_limit INTEGER NOT NULL DEFAULT 0,
  chat_message_limit INTEGER NOT NULL DEFAULT 50,
  
  -- Trial Management
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  
  -- Billing & Renewal (App Store required)
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  
  -- App Store Receipt (για verification)
  app_store_receipt TEXT,
  app_store_transaction_id TEXT UNIQUE,
  app_store_original_transaction_id TEXT,
  
  -- Pricing Info (App Store required to display)
  currency TEXT DEFAULT 'EUR',
  price_amount DECIMAL(10,2) DEFAULT 6.99,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Index για performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(subscription_status);
CREATE INDEX idx_user_subscriptions_app_store_txn ON user_subscriptions(app_store_transaction_id);

-- RLS Policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON user_subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create user_usage table
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Current Usage
  image_analysis_used INTEGER NOT NULL DEFAULT 0,
  ai_recipe_used INTEGER NOT NULL DEFAULT 0,
  chat_messages_used INTEGER NOT NULL DEFAULT 0,
  
  -- Reset Period (για monthly reset logic)
  current_month TEXT NOT NULL,
  reset_date TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now() + interval '1 month'),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, current_month)
);

-- Index
CREATE INDEX idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX idx_user_usage_month ON user_usage(current_month);

-- RLS
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON user_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage"
  ON user_usage FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create subscription_transactions table
CREATE TABLE subscription_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction Details
  transaction_type TEXT NOT NULL 
    CHECK (transaction_type IN ('purchase', 'restore', 'renewal', 'cancellation', 'expiration')),
  app_store_transaction_id TEXT,
  app_store_receipt TEXT,
  
  -- Status Change
  old_status TEXT,
  new_status TEXT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Store raw App Store response for debugging
  raw_response JSONB
);

-- Index
CREATE INDEX idx_subscription_transactions_user_id ON subscription_transactions(user_id);
CREATE INDEX idx_subscription_transactions_date ON subscription_transactions(created_at DESC);

-- RLS
ALTER TABLE subscription_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON subscription_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Function: Auto-Create Subscription on Signup
CREATE OR REPLACE FUNCTION handle_new_user_subscription()
RETURNS TRIGGER AS $$
DECLARE
  trial_end TIMESTAMPTZ;
BEGIN
  -- Calculate 7-day trial end
  trial_end := now() + interval '7 days';
  
  -- Create subscription record with trial
  INSERT INTO user_subscriptions (
    user_id,
    subscription_status,
    tier,
    image_analysis_limit,
    ai_recipe_limit,
    chat_message_limit,
    trial_start_date,
    trial_end_date,
    current_period_start,
    current_period_end,
    next_billing_date
  ) VALUES (
    NEW.id,
    'trial',
    'premium',
    100,
    50,
    1000,
    now(),
    trial_end,
    now(),
    trial_end,
    trial_end
  );
  
  -- Create usage record
  INSERT INTO user_usage (
    user_id,
    current_month,
    reset_date
  ) VALUES (
    NEW.id,
    to_char(now(), 'YYYY-MM'),
    date_trunc('month', now() + interval '1 month')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_subscription();