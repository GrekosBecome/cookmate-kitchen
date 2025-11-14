import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export interface SubscriptionData {
  id: string;
  user_id: string;
  subscription_status: 'trial' | 'premium' | 'free' | 'cancelled' | 'expired';
  tier: 'free' | 'premium';
  image_analysis_limit: number;
  ai_recipe_limit: number;
  chat_message_limit: number;
  trial_start_date: string | null;
  trial_end_date: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  next_billing_date: string | null;
  auto_renew: boolean;
  currency: string;
  price_amount: number;
  created_at: string;
  updated_at: string;
}

export interface UsageData {
  id: string;
  user_id: string;
  image_analysis_used: number;
  ai_recipe_used: number;
  chat_messages_used: number;
  current_month: string;
  reset_date: string;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch subscription
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError) throw subError;
      setSubscription(subData as SubscriptionData);

      // Fetch usage
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('current_month', currentMonth)
        .single();

      if (usageError) throw usageError;
      setUsage(usageData as UsageData);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canUseFeature = (feature: 'image' | 'recipe' | 'chat'): boolean => {
    if (!subscription || !usage) return false;

    switch (feature) {
      case 'image':
        return usage.image_analysis_used < subscription.image_analysis_limit;
      case 'recipe':
        return usage.ai_recipe_used < subscription.ai_recipe_limit;
      case 'chat':
        return usage.chat_messages_used < subscription.chat_message_limit;
      default:
        return false;
    }
  };

  const getRemainingUsage = (feature: 'image' | 'recipe' | 'chat'): number => {
    if (!subscription || !usage) return 0;

    switch (feature) {
      case 'image':
        return Math.max(0, subscription.image_analysis_limit - usage.image_analysis_used);
      case 'recipe':
        return Math.max(0, subscription.ai_recipe_limit - usage.ai_recipe_used);
      case 'chat':
        return Math.max(0, subscription.chat_message_limit - usage.chat_messages_used);
      default:
        return 0;
    }
  };

  const getUsagePercentage = (feature: 'image' | 'recipe' | 'chat'): number => {
    if (!subscription || !usage) return 0;

    let used = 0;
    let limit = 0;

    switch (feature) {
      case 'image':
        used = usage.image_analysis_used;
        limit = subscription.image_analysis_limit;
        break;
      case 'recipe':
        used = usage.ai_recipe_used;
        limit = subscription.ai_recipe_limit;
        break;
      case 'chat':
        used = usage.chat_messages_used;
        limit = subscription.chat_message_limit;
        break;
    }

    return limit > 0 ? (used / limit) * 100 : 0;
  };

  const handleManageSubscription = () => {
    // Apple requirement: Link to iOS Settings
    const subscriptionUrl = 'itms-apps://apps.apple.com/account/subscriptions';
    
    if (Capacitor.isNativePlatform()) {
      window.open(subscriptionUrl, '_system');
    } else {
      toast.info('Manage Subscription', {
        description: 'Open Settings → [Your Name] → Subscriptions on your iOS device'
      });
    }
  };

  const handleRestorePurchases = async () => {
    try {
      toast.info('Restore Purchases', {
        description: 'This will be implemented when App Store integration is complete'
      });
      // TODO: Call restore-purchases edge function when implemented
    } catch (error) {
      toast.error('Failed to restore purchases', {
        description: String(error)
      });
    }
  };

  const getDaysUntilTrialEnd = (): number | null => {
    if (subscription?.subscription_status !== 'trial' || !subscription.trial_end_date) {
      return null;
    }
    
    const now = new Date();
    const trialEnd = new Date(subscription.trial_end_date);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return {
    subscription,
    usage,
    loading,
    canUseFeature,
    getRemainingUsage,
    getUsagePercentage,
    handleManageSubscription,
    handleRestorePurchases,
    getDaysUntilTrialEnd,
    formatDate,
    refresh: fetchSubscriptionData,
  };
};
