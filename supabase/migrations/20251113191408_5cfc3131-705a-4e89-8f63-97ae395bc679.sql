-- Remove any potential public access to user_usage table
-- Ensure RLS is enabled and only authenticated users can access their own data

-- First, revoke all public access
REVOKE ALL ON public.user_usage FROM anon;
REVOKE ALL ON public.user_usage FROM public;

-- Ensure RLS is enabled
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner
ALTER TABLE public.user_usage FORCE ROW LEVEL SECURITY;