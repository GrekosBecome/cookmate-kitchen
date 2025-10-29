import { useState, useEffect } from 'react';
import type { NativeBridge } from '@/types/native-bridge';

export const useNativeBridge = () => {
  const [bridge, setBridge] = useState<NativeBridge | null>(null);
  const [isNative, setIsNative] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleNativeReady = () => {
      const nativeBridge = window.NativeBridge;
      if (nativeBridge) {
        setBridge(nativeBridge);
        setIsNative(true);
        setIsReady(true);
      }
    };

    // Check immediately in case bridge already loaded
    if (window.NativeBridge) {
      handleNativeReady();
    }

    // Listen for native-ready event
    window.addEventListener('native-ready', handleNativeReady);

    // Fallback: assume web after timeout
    const timeout = setTimeout(() => {
      if (!window.NativeBridge) {
        setIsNative(false);
        setIsReady(true);
      }
    }, 500);

    return () => {
      window.removeEventListener('native-ready', handleNativeReady);
      clearTimeout(timeout);
    };
  }, []);

  return { bridge, isNative, isReady };
};
