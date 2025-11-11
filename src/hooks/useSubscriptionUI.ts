import { useState, useCallback } from 'react';
import { useSubscription } from './useSubscription';
import { useNavigate } from 'react-router-dom';

/**
 * Hook for managing subscription UI state and dialogs
 */
export const useSubscriptionUI = () => {
  const subscription = useSubscription();
  const navigate = useNavigate();
  
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [limitFeature, setLimitFeature] = useState<'image' | 'recipe' | 'chat'>('image');

  /**
   * Handle feature usage - check limits and show dialog if needed
   */
  const checkFeatureUsage = useCallback(
    (feature: 'image' | 'recipe' | 'chat'): boolean => {
      const canUse = subscription.canUseFeature(feature);
      
      if (!canUse) {
        setLimitFeature(feature);
        setShowLimitDialog(true);
        return false;
      }
      
      return true;
    },
    [subscription]
  );

  /**
   * Handle upgrade action
   */
  const handleUpgrade = useCallback(() => {
    setShowLimitDialog(false);
    setShowUpgradeDialog(false);
    navigate('/settings');
  }, [navigate]);

  /**
   * Show upgrade dialog
   */
  const showUpgrade = useCallback(() => {
    setShowUpgradeDialog(true);
  }, []);

  return {
    // Subscription data
    ...subscription,
    
    // UI state
    showLimitDialog,
    setShowLimitDialog,
    showUpgradeDialog,
    setShowUpgradeDialog,
    limitFeature,
    
    // Actions
    checkFeatureUsage,
    handleUpgrade,
    showUpgrade,
  };
};
