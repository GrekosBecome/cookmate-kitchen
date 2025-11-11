import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      // Get authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.warn('No authenticated user for RevenueCat');
        return;
      }

      // Configure RevenueCat with your API key
      // Note: API key should be added via Lovable secrets
      const apiKey = Capacitor.getPlatform() === 'ios' 
        ? import.meta.env.VITE_REVENUECAT_IOS_KEY || 'your_ios_key'
        : import.meta.env.VITE_REVENUECAT_ANDROID_KEY || 'your_android_key';
      
      await Purchases.configure({ 
        apiKey,
        appUserID: session.user.id // Link purchases to authenticated user
      });

      // Load product offerings
      await loadProducts();

    } catch (error) {
      console.error('Error initializing store:', error);
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

      // Get customer info from RevenueCat
      const { customerInfo } = await Purchases.getCustomerInfo();
      
      // Check if user has active subscription
      const hasActiveSubscription = customerInfo && Object.keys(customerInfo.entitlements.active).length > 0;
      
      if (hasActiveSubscription) {
        const activeEntitlementId = Object.keys(customerInfo.entitlements.active)[0];
        const activeEntitlement = customerInfo.entitlements.active[activeEntitlementId];
        const expirationDate = activeEntitlement?.expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        // Update subscription in database
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
        
        toast.success('Subscription activated successfully!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error syncing purchase:', error);
      toast.error('Failed to sync subscription. Please try again.');
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

  return {
    isNative,
    products,
    loading,
    restoring,
    purchaseProduct,
    restorePurchases,
  };
};
