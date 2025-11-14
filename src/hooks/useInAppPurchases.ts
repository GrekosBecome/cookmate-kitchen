import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases, PurchasesPackage, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { RevenueCatUI } from '@revenuecat/purchases-capacitor-ui';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

// Entitlement identifier - MUST match RevenueCat Dashboard
const ENTITLEMENT_ID = 'pro';

// Product IDs - must match App Store Connect
const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'com.cookmate.premium.monthly',
  PREMIUM_YEARLY: 'com.cookmate.premium.yearly',
};

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
}

export const useInAppPurchases = () => {
  const [isNative, setIsNative] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Initialize StoreKit
  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);

    if (native) {
      initializeStore();
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  const initializeStore = async () => {
    try {
      // Enable debug logging in development
      if (import.meta.env.DEV) {
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.warn('No authenticated user for RevenueCat');
        return;
      }

      const apiKey = Capacitor.getPlatform() === 'ios' 
        ? import.meta.env.VITE_REVENUECAT_IOS_KEY || ''
        : import.meta.env.VITE_REVENUECAT_ANDROID_KEY || '';
      
      if (!apiKey) {
        console.error('RevenueCat API key not configured');
        return;
      }
      
      await Purchases.configure({ 
        apiKey,
        appUserID: session.user.id
      });

      console.log('✅ RevenueCat configured successfully');
      await loadProducts();
    } catch (error) {
      console.error('❌ RevenueCat initialization error:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current !== null) {
        const packages = offerings.current.availablePackages;
        
        const formattedProducts = packages.map((pkg: PurchasesPackage) => ({
          id: pkg.identifier,
          title: pkg.product.title || 'Premium Subscription',
          description: pkg.product.description || '',
          price: pkg.product.priceString || '',
          currency: pkg.product.currencyCode || 'EUR',
        }));

        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const syncPurchaseWithBackend = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { customerInfo } = await Purchases.getCustomerInfo();
      
      // Check specific "pro" entitlement
      const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
      const hasActiveSubscription = proEntitlement !== undefined;
      
      console.log('🔍 Checking entitlement:', ENTITLEMENT_ID);
      console.log('✅ Has active subscription:', hasActiveSubscription);
      
      if (hasActiveSubscription) {
        const expirationDate = proEntitlement.expirationDate || 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            subscription_status: 'active',
            tier: 'premium',
            current_period_end: expirationDate,
            next_billing_date: expirationDate,
            stripe_customer_id: null,
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast.success('✅ Subscription activated!');
        window.location.reload();
      } else {
        toast.info('No active subscription found');
      }
    } catch (error) {
      console.error('Error syncing purchase:', error);
      toast.error('Failed to sync subscription');
    } finally {
      setLoading(false);
    }
  };

  const purchaseProduct = useCallback(async (productId: string) => {
    if (!isNative) {
      toast.error('In-app purchases are only available in the mobile app');
      return;
    }

    try {
      setLoading(true);
      
      // Get offerings and find the package
      const offerings = await Purchases.getOfferings();
      if (!offerings.current) {
        throw new Error('No offerings available');
      }
      
      const pkg = offerings.current.availablePackages.find(p => p.identifier === productId);
      if (!pkg) {
        throw new Error('Product not found');
      }
      
      // Purchase the package
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      
      // Sync with backend
      await syncPurchaseWithBackend();
    } catch (error: any) {
      console.error('Purchase error:', error);
      if (error?.userCancelled) {
        // User cancelled, don't show error
        return;
      }
      toast.error('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isNative]);

  const restorePurchases = useCallback(async () => {
    if (!isNative) {
      toast.error('Restore is only available in the mobile app');
      return;
    }

    try {
      setRestoring(true);
      toast.info('Restoring purchases...');
      
      await Purchases.restorePurchases();
      await syncPurchaseWithBackend();
      
      toast.success('Purchases restored successfully!');
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  }, [isNative]);

  const checkEntitlement = useCallback(async (): Promise<boolean> => {
    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    } catch (error) {
      console.error('Error checking entitlement:', error);
      return false;
    }
  }, []);

  const getManagementURL = useCallback(async (): Promise<string | null> => {
    if (!isNative) return null;
    
    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      return customerInfo.managementURL || null;
    } catch (error) {
      console.error('Error getting management URL:', error);
      return null;
    }
  }, [isNative]);

  const presentCustomerCenter = useCallback(async () => {
    if (!isNative) {
      toast.error('Customer Center is only available in the mobile app');
      return;
    }

    try {
      console.log('🏪 Presenting Customer Center...');
      await RevenueCatUI.presentCustomerCenter();
    } catch (error) {
      console.error('Error presenting customer center:', error);
      // Fallback to management URL
      const url = await getManagementURL();
      if (url) {
        window.open(url, '_system');
      } else {
        toast.error('Unable to open subscription management');
      }
    }
  }, [isNative, getManagementURL]);

  return {
    isNative,
    products,
    loading,
    restoring,
    purchaseProduct,
    restorePurchases,
    checkEntitlement,
    getManagementURL,
    presentCustomerCenter,
  };
};
