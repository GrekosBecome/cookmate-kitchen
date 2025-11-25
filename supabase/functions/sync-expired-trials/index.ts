import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting sync of expired trials...');

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all expired trials
    const { data: expiredTrials, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('subscription_status', 'trial')
      .lt('trial_end_date', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired trials:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredTrials?.length || 0} expired trials to update`);

    if (!expiredTrials || expiredTrials.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired trials to sync',
          updated: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Update each expired trial to free tier
    const updates = expiredTrials.map(trial => 
      supabase
        .from('user_subscriptions')
        .update({
          subscription_status: 'expired',
          tier: 'free',
          image_analysis_limit: 10,
          ai_recipe_limit: 0,
          chat_message_limit: 50,
          updated_at: new Date().toISOString(),
        })
        .eq('id', trial.id)
    );

    const results = await Promise.all(updates);
    
    // Check for errors
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Some updates failed:', errors);
    }

    const successCount = results.filter(r => !r.error).length;
    console.log(`✅ Successfully updated ${successCount} expired trials to free tier`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${successCount} expired trials`,
        updated: successCount,
        failed: errors.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in sync-expired-trials:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
