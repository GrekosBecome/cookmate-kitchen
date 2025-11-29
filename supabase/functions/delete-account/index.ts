import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Create client with user's JWT to get their ID
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Failed to get user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log('🗑️ Starting account deletion for user:', userId);

    // Delete user data from all tables
    console.log('📊 Deleting user_subscriptions...');
    const { error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (subError) {
      console.error('⚠️ Error deleting subscriptions:', subError);
    }

    console.log('📊 Deleting user_usage...');
    const { error: usageError } = await supabaseAdmin
      .from('user_usage')
      .delete()
      .eq('user_id', userId);
    
    if (usageError) {
      console.error('⚠️ Error deleting usage:', usageError);
    }

    console.log('📊 Deleting subscription_transactions...');
    const { error: transError } = await supabaseAdmin
      .from('subscription_transactions')
      .delete()
      .eq('user_id', userId);
    
    if (transError) {
      console.error('⚠️ Error deleting transactions:', transError);
    }

    // Delete the auth user using admin API
    console.log('👤 Deleting auth user...');
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('❌ Error deleting auth user:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete account', details: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Account deleted successfully for user:', userId);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
