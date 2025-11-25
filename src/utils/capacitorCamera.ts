import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

/**
 * Requests camera permissions from the user
 */
export async function requestCameraPermissions(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const permissions = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
      return permissions.camera === 'granted' || permissions.photos === 'granted';
    }
    return true; // Web doesn't need explicit permission request
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
}

/**
 * Checks current camera permissions status
 */
export async function checkCameraPermissions(): Promise<string> {
  try {
    if (Capacitor.isNativePlatform()) {
      const permissions = await Camera.checkPermissions();
      return permissions.camera;
    }
    return 'granted';
  } catch (error) {
    console.error('Permission check error:', error);
    return 'denied';
  }
}

/**
 * Takes a photo using Capacitor Camera on native platforms
 * Falls back to web API in browser for development
 */
export async function takePhoto(): Promise<string | null> {
  try {
    if (Capacitor.isNativePlatform()) {
      // First check if we have permissions
      const currentPermission = await checkCameraPermissions();
      
      if (currentPermission === 'denied') {
        throw new Error('PERMISSION_DENIED');
      }
      
      // Request permissions if not granted
      if (currentPermission !== 'granted') {
        const granted = await requestCameraPermissions();
        if (!granted) {
          throw new Error('PERMISSION_DENIED');
        }
      }
      
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
      // Request permissions for photo library
      const granted = await requestCameraPermissions();
      if (!granted) {
        throw new Error('PERMISSION_DENIED');
      }
      
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
