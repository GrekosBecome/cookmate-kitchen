import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5b916d5046614c65933e1881660781d8',
  appName: 'cookmate-kitchen',
  webDir: 'dist',
  server: {
    url: 'https://5b916d50-4661-4c65-933e-1881660781d8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
  },
};

export default config;
