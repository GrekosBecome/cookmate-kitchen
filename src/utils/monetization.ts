import { AppConfig } from '@/config/app.config';

export const initiatePurchase = (period: 'monthly' | 'yearly') => {
  const bridge = window.NativeBridge;
  
  if (bridge?.platform === 'ios') {
    // iOS: Use StoreKit via bridge
    const productId = AppConfig.ios[period === 'monthly' ? 'productMonthly' : 'productYearly'];
    bridge.purchase?.(productId);
  } else if (bridge?.platform === 'android') {
    // Android: Use Google Play via bridge
    const productId = AppConfig.android[period === 'monthly' ? 'productMonthly' : 'productYearly'];
    bridge.purchase?.(productId);
  } else {
    // Web: Use Stripe (when implemented)
    const priceId = AppConfig.stripe[period === 'monthly' ? 'priceMonthly' : 'priceYearly'];
    console.log('Would initiate Stripe checkout with:', priceId);
    // Future: startStripeCheckout(priceId);
  }
};

export const openExternalURL = (url: string) => {
  const bridge = window.NativeBridge;
  
  if (bridge?.openURL) {
    bridge.openURL(url);
  } else {
    window.open(url, '_blank');
  }
};
