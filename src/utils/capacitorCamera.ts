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
  console.log('📸 takePhoto: Starting...');
  
  try {
    if (!Capacitor.isNativePlatform()) {
      console.log('📸 takePhoto: Not native platform, returning null');
      return null;
    }

    console.log('📸 takePhoto: Native platform detected');
    
    // First check if we have permissions
    console.log('📸 takePhoto: Checking permissions...');
    let currentPermission: string;
    
    try {
      currentPermission = await checkCameraPermissions();
      console.log('📸 takePhoto: Current permission:', currentPermission);
    } catch (permError) {
      console.error('📸 takePhoto: Permission check failed:', permError);
      throw new Error('PERMISSION_CHECK_FAILED');
    }
    
    if (currentPermission === 'denied') {
      console.log('📸 takePhoto: Permission denied');
      throw new Error('PERMISSION_DENIED');
    }
    
    // Request permissions if not granted
    if (currentPermission !== 'granted') {
      console.log('📸 takePhoto: Requesting permissions...');
      try {
        const granted = await requestCameraPermissions();
        console.log('📸 takePhoto: Permission granted:', granted);
        if (!granted) {
          throw new Error('PERMISSION_DENIED');
        }
      } catch (reqError) {
        console.error('📸 takePhoto: Permission request failed:', reqError);
        throw new Error('PERMISSION_DENIED');
      }
    }
    
    // Native platform: Use Capacitor Camera API
    console.log('📸 takePhoto: Opening camera...');
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        source: CameraSource.Camera,
        resultType: CameraResultType.DataUrl,
        allowEditing: false,
        saveToGallery: false,
      });
      
      console.log('📸 takePhoto: Photo captured successfully');
      return photo.dataUrl || null;
    } catch (cameraError) {
      console.error('📸 takePhoto: Camera.getPhoto failed:', cameraError);
      throw cameraError;
    }
  } catch (error) {
    console.error('📸 takePhoto: Final catch - error:', error);
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
