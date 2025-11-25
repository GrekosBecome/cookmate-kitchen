import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export type FeatureType = 'image' | 'recipe' | 'chat';

export interface UsageCheckResult {
  allowed: boolean;
  error?: string;
  remaining?: number;
  limit?: number;
}

/**
 * Check if user can use a feature and increment usage if allowed
 */
export async function checkAndIncrementUsage(
  authHeader: string | null,
  feature: FeatureType
): Promise<UsageCheckResult> {
  try {
    // Get user from auth header
    if (!authHeader?.startsWith('Bearer ')) {
      return { allowed: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return { allowed: false, error: 'Invalid authentication token' };
    }

    // Get current month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Fetch subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError) {
      console.error('Error fetching subscription:', subError);
      return { allowed: false, error: 'Subscription not found' };
    }

    // Fetch or create usage record for current month
    let { data: usage, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('current_month', currentMonth)
      .single();

    // If no usage record exists for this month, create one
    if (usageError && usageError.code === 'PGRST116') {
      const { data: newUsage, error: createError } = await supabase
        .from('user_usage')
        .insert({
          user_id: user.id,
          current_month: currentMonth,
          reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
          image_analysis_used: 0,
          ai_recipe_used: 0,
          chat_messages_used: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating usage record:', createError);
        return { allowed: false, error: 'Failed to initialize usage tracking' };
      }
      usage = newUsage;
    } else if (usageError) {
      console.error('Error fetching usage:', usageError);
      return { allowed: false, error: 'Failed to fetch usage data' };
    }

    // Check if trial has expired - if so, use free tier limits
    let effectiveSubscription = subscription;
    if (subscription.subscription_status === 'trial' && subscription.trial_end_date) {
      const trialEnd = new Date(subscription.trial_end_date);
      const now = new Date();
      
      if (now > trialEnd) {
        console.log('Trial expired, applying free tier limits');
        effectiveSubscription = {
          ...subscription,
          image_analysis_limit: 10,
          ai_recipe_limit: 0,
          chat_message_limit: 50,
        };
      }
    }

    // Check limits based on feature
    let used = 0;
    let limit = 0;
    let usageField = '';

    switch (feature) {
      case 'image':
        used = usage.image_analysis_used;
        limit = effectiveSubscription.image_analysis_limit;
        usageField = 'image_analysis_used';
        break;
      case 'recipe':
        used = usage.ai_recipe_used;
        limit = effectiveSubscription.ai_recipe_limit;
        usageField = 'ai_recipe_used';
        break;
      case 'chat':
        used = usage.chat_messages_used;
        limit = effectiveSubscription.chat_message_limit;
        usageField = 'chat_messages_used';
        break;
    }

    // Check if limit reached
    if (used >= limit) {
      return {
        allowed: false,
        error: `${feature} limit reached (${used}/${limit}). Upgrade to Premium for more.`,
        remaining: 0,
        limit
      };
    }

    // Increment usage
    const { error: updateError } = await supabase
      .from('user_usage')
      .update({ [usageField]: used + 1 })
      .eq('id', usage.id);

    if (updateError) {
      console.error('Error incrementing usage:', updateError);
      return { allowed: false, error: 'Failed to update usage' };
    }

    console.log(`✅ Usage tracked: ${feature} - ${used + 1}/${limit} for user ${user.id}`);

    return {
      allowed: true,
      remaining: limit - (used + 1),
      limit
    };

  } catch (error) {
    console.error('Unexpected error in checkAndIncrementUsage:', error);
    return { 
      allowed: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
