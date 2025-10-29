(function () {
  // App-wide configuration (single source of truth)
  window.AppConfig = {
    lovableUrl: "https://cookmate-kitchen.lovable.app",
    stripe: {
      priceMonthly: "price_MONTHLY_xxxx",
      priceYearly:  "price_YEARLY_yyyy"
    },
    ios: {
      productMonthly: "com.cookmate.kitchen.premium.monthly",
      productYearly:  "com.cookmate.kitchen.premium.yearly"
    }
  };

  // Minimal bridge placeholder so the web can detect native later.
  // On pure web, we expose platform="web" and NO purchase().
  if (!window.NativeBridge) {
    window.NativeBridge = { platform: "web", version: "0.1-web" };
  }

  // Emit a readiness event for any listeners
  try { window.dispatchEvent(new Event("native-ready")); } catch(e) {}
})();
