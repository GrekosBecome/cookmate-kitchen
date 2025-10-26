import { supabase } from '@/integrations/supabase/client';
import { DetectedItem } from '@/types';
import { mockImageDetection } from './mockDetection';

export const analyzeImagesForFood = async (
  images: string[]
): Promise<{ success: boolean; error?: string; reason?: string }> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Image analysis timeout after 15 seconds')), 15000);
  });

  try {
    console.log(`Analyzing ${images.length} images for food content...`);
    
    const { data, error } = await Promise.race([
      supabase.functions.invoke('analyze-image', {
        body: { images }
      }),
      timeoutPromise
    ]);

    if (error) {
      console.error('Image analysis error:', error);
      throw error;
    }

    if (data.error) {
      console.log('Image validation failed:', data.error);
      return { 
        success: false, 
        error: data.error,
        reason: data.reason 
      };
    }

    console.log(`Analysis complete: ${data.analyzed} images validated`);
    return { success: true };
  } catch (error) {
    console.error('Error analyzing images:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(errorMessage);
  }
};

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
