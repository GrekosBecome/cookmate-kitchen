import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cookmate.kitchen',
  appName: 'KitchenMate',
  webDir: 'dist',
  ios: {
    scheme: 'com.cookmate.kitchen'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
    SignInWithApple: {
      clientId: 'com.cookmate.kitchen',
      redirectURI: 'https://gsozaqboqcjbthbighqg.supabase.co/auth/v1/callback',
      scopes: 'email name',
    },
  },
};

export default config;
