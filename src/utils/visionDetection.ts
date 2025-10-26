import { supabase } from '@/integrations/supabase/client';
import { DetectedItem } from '@/types';
import { mockImageDetection } from './mockDetection';

export const detectIngredientsFromImages = async (
  images: string[]
): Promise<DetectedItem[]> => {
  // Create timeout promise (15 seconds)
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000);
  });

  try {
    console.log(`Calling Vision API for ${images.length} images`);
    
    // Race between API call and timeout
    const { data, error } = await Promise.race([
      supabase.functions.invoke('detect-ingredients', {
        body: { images }
      }),
      timeoutPromise
    ]);

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    // Check if we should use mock detection (API key not configured or error)
    if (data.useMock || data.error) {
      console.log('Falling back to mock detection:', data.error);
      throw new Error(data.error || 'API unavailable');
    }

    const detectedItems = data.detectedItems || [];
    console.log(`Vision API detected ${detectedItems.length} ingredients`);
    
    return detectedItems;
  } catch (error) {
    console.error('Error detecting ingredients:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Re-throw to let the UI handle it
    throw new Error(errorMessage);
  }
};
