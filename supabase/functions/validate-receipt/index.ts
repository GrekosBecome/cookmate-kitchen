import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReceiptValidationRequest {
  receipt: string;
  productId: string;
  platform: 'ios' | 'android';
}

// Apple receipt validation
async function validateAppleReceipt(receipt: string): Promise<any> {
  const password = Deno.env.get('APPLE_SHARED_SECRET');
  if (!password) {
    throw new Error('Apple shared secret not configured');
  }

  // Use sandbox for development, production for release
  const isDevelopment = Deno.env.get('ENVIRONMENT') !== 'production';
  const url = isDevelopment
    ? 'https://sandbox.itunes.apple.com/verifyReceipt'
    : 'https://buy.itunes.apple.com/verifyReceipt';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'receipt-data': receipt,
      password: password,
      'exclude-old-transactions': true,
    }),
  });

  const data = await response.json();

  // If production validation fails with sandbox receipt, try sandbox
  if (data.status === 21007 && !isDevelopment) {
    return validateAppleReceipt(receipt);
  }

  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { receipt, productId, platform }: ReceiptValidationRequest = await req.json();

    console.log('Validating receipt for user:', user.id, 'product:', productId, 'platform:', platform);

    let validationResult;
    let subscriptionData = {
      valid: false,
      expiresDate: null as string | null,
      productId: '',
    };

    if (platform === 'ios') {
      validationResult = await validateAppleReceipt(receipt);
      
      console.log('Apple validation status:', validationResult.status);

      if (validationResult.status === 0) {
        // Valid receipt
        const latestReceipt = validationResult.latest_receipt_info?.[0];
        
        if (latestReceipt) {
          const expiresMs = parseInt(latestReceipt.expires_date_ms);
          const now = Date.now();
          
          subscriptionData = {
            valid: expiresMs > now,
            expiresDate: new Date(expiresMs).toISOString(),
            productId: latestReceipt.product_id,
          };
        }
      }
    } else {
      throw new Error('Android validation not yet implemented');
    }

    // Update user subscription in database if valid
    if (subscriptionData.valid) {
      const tier = productId.includes('yearly') ? 'premium' : 'premium';
      const periodEnd = subscriptionData.expiresDate;

      const { error: updateError } = await supabaseClient
        .from('user_subscriptions')
        .update({
          subscription_status: 'active',
          tier: tier,
          current_period_end: periodEnd,
          next_billing_date: periodEnd,
          stripe_customer_id: null, // Clear stripe data for native
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        throw updateError;
      }

      console.log('Subscription updated successfully for user:', user.id);
    }

    return new Response(
      JSON.stringify({
        valid: subscriptionData.valid,
        expiresDate: subscriptionData.expiresDate,
        productId: subscriptionData.productId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Receipt validation error:', error);
    return new Response(
      JSON.stringify({
        error: error?.message || 'Unknown error',
        valid: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
