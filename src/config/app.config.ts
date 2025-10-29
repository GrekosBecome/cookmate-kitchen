export const AppConfig = {
  lovableUrl: "https://5b916d50-4661-4c65-933e-1881660781d8.lovableproject.com/",
  stripe: {
    priceMonthly: "price_XXXXX", // Placeholder for future Stripe integration
    priceYearly: "price_XXXXX"
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
