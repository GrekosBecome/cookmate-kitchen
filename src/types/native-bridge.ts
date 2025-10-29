import { AppConfig } from '@/config/app.config';

export interface NativeBridge {
  platform?: "ios" | "android" | "web";
  version?: string;
  purchase?: (productId: string) => void;
  openURL?: (url: string) => void;
}

declare global {
  interface Window {
    NativeBridge?: NativeBridge;
    AppConfig: typeof AppConfig;
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export {};
