-- Remove public access from subscription-related tables
-- These contain sensitive payment data

-- Revoke all public access from user_subscriptions
REVOKE ALL ON public.user_subscriptions FROM anon;
REVOKE ALL ON public.user_subscriptions FROM public;

-- Revoke all public access from subscription_transactions
REVOKE ALL ON public.subscription_transactions FROM anon;
REVOKE ALL ON public.subscription_transactions FROM public;

-- Ensure RLS is enabled on both tables
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_transactions ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner
ALTER TABLE public.user_subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_transactions FORCE ROW LEVEL SECURITY;