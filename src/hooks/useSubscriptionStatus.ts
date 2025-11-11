import { useEffect, useState } from 'react';
import { useInAppPurchases } from './useInAppPurchases';

/**
 * Hook for checking subscription status via RevenueCat
 * Returns isPro status for native apps
 */
export const useSubscriptionStatus = () => {
  const { checkEntitlement, isNative } = useInAppPurchases();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (!isNative) {
        // Web apps use database subscription status
        setLoading(false);
        return;
      }

      try {
        const hasPro = await checkEntitlement();
        console.log('📊 Subscription status:', hasPro ? 'PRO' : 'FREE');
        setIsPro(hasPro);
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [checkEntitlement, isNative]);

  return { 
    isPro, 
    loading,
    isNative 
  };
};
