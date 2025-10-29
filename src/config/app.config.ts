export const AppConfig = {
  lovableUrl: "https://cookmate-kitchen.lovable.app",
  stripe: {
    priceMonthly: "price_MONTHLY_xxxx", // Update with real Stripe price ID when ready
    priceYearly: "price_YEARLY_yyyy"    // Update with real Stripe price ID when ready
  },
  ios: {
    productMonthly: "com.cookmate.kitchen.premium.monthly",
    productYearly: "com.cookmate.kitchen.premium.yearly"
  },
  android: {
    productMonthly: "com.cookmate.kitchen.premium.monthly",
    productYearly: "com.cookmate.kitchen.premium.yearly"
  }
};

// Expose to window for easy access
if (typeof window !== 'undefined') {
  (window as any).AppConfig = AppConfig;
}
