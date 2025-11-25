import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

/**
 * Takes a photo using Capacitor Camera on native platforms
 * Falls back to web API in browser for development
 */
export async function takePhoto(): Promise<string | null> {
  try {
    if (Capacitor.isNativePlatform()) {
      // Native platform: Use Capacitor Camera API
      const photo = await Camera.getPhoto({
        quality: 90,
        source: CameraSource.Camera,
        resultType: CameraResultType.DataUrl,
        allowEditing: false,
        saveToGallery: false,
      });
      
      return photo.dataUrl || null;
    } else {
      // Web platform: Return null to indicate not supported
      // The component should handle fallback for web
      return null;
    }
  } catch (error) {
    console.error('Camera error:', error);
    throw error;
  }
}

/**
 * Picks an image from the gallery using Capacitor Camera
 */
export async function pickFromGallery(): Promise<string | null> {
  try {
    if (Capacitor.isNativePlatform()) {
      const photo = await Camera.getPhoto({
        quality: 90,
        source: CameraSource.Photos,
        resultType: CameraResultType.DataUrl,
        allowEditing: false,
      });
      
      return photo.dataUrl || null;
    } else {
      // Web platform: Return null to let component use file input
      return null;
    }
  } catch (error) {
    console.error('Gallery picker error:', error);
    throw error;
  }
}
