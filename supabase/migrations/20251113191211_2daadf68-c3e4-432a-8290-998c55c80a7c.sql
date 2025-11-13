-- Add write policies for subscription_transactions table
-- Only service role can insert, update, or delete transactions

CREATE POLICY "Service role can insert transactions"
ON public.subscription_transactions
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Service role can update transactions"
ON public.subscription_transactions
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Service role can delete transactions"
ON public.subscription_transactions
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);