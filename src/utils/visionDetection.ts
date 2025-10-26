import { supabase } from '@/integrations/supabase/client';
import { DetectedItem } from '@/types';
import { mockImageDetection } from './mockDetection';

export const detectIngredientsFromImages = async (
  images: string[]
): Promise<DetectedItem[]> => {
  try {
    console.log(`Calling Vision API for ${images.length} images`);
    
    const { data, error } = await supabase.functions.invoke('detect-ingredients', {
      body: { images }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    // Check if we should use mock detection (API key not configured or error)
    if (data.useMock || data.error) {
      console.log('Falling back to mock detection:', data.error);
      return mockImageDetection(images.length);
    }

    const detectedItems = data.detectedItems || [];
    console.log(`Vision API detected ${detectedItems.length} ingredients`);
    
    return detectedItems;
  } catch (error) {
    console.error('Error detecting ingredients:', error);
    // Fallback to mock detection on any error
    return mockImageDetection(images.length);
  }
};
