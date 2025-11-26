/**
 * RevenueCat Configuration
 * 
 * These are PUBLIC API keys that are safe to include in the app.
 * They should NOT be confused with secret API keys.
 */

export const REVENUECAT_CONFIG = {
  // iOS App-Specific Shared Secret (starts with "appl_")
  // Get this from: RevenueCat Dashboard → Project Settings → API Keys
  IOS_API_KEY: '', // User will provide this
  
  // Android API Key (for future use)
  ANDROID_API_KEY: '',
  
  // Entitlement identifier - must match RevenueCat Dashboard
  ENTITLEMENT_ID: 'pro',
} as const;
