import { useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { RevenueCatUI, PAYWALL_RESULT } from '@revenuecat/purchases-capacitor-ui';
import { toast } from 'sonner';

/**
 * Hook for presenting native RevenueCat paywall
 */
export const useRevenueCatPaywall = () => {
  const [loading, setLoading] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const presentPaywall = useCallback(async (): Promise<boolean> => {
    if (!isNative) {
      console.warn('Native paywall only available on mobile');
      toast.error('Native paywall is only available in mobile app');
      return false;
    }

    try {
      setLoading(true);
      
      console.log('🚀 Presenting native paywall...');
      const { result } = await RevenueCatUI.presentPaywall();
      console.log('📊 Paywall result:', result);

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
          console.log('✅ Purchase completed');
          toast.success('🎉 Purchase completed!');
          window.location.reload();
          return true;
          
        case PAYWALL_RESULT.RESTORED:
          console.log('✅ Purchases restored');
          toast.success('✅ Purchases restored!');
          window.location.reload();
          return true;
          
        case PAYWALL_RESULT.CANCELLED:
          console.log('❌ User cancelled');
          return false;
          
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
          console.error('❌ Paywall error');
          toast.error('Failed to show payment options');
          return false;
          
        default:
          return false;
      }
    } catch (error) {
      console.error('❌ Paywall error:', error);
      toast.error('Something went wrong. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isNative]);

  return {
    presentPaywall,
    loading,
    isNative,
  };
};
