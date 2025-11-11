-- Fix function search path for security (no DROP needed)
CREATE OR REPLACE FUNCTION handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trial_end TIMESTAMPTZ;
BEGIN
  -- Calculate 7-day trial end
  trial_end := now() + interval '7 days';
  
  -- Create subscription record with trial
  INSERT INTO public.user_subscriptions (
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
  INSERT INTO public.user_usage (
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
$$;