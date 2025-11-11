/**
 * Compress an image file to a base64 string with specified dimensions and quality
 * @param file - The image file to compress
 * @param maxWidth - Maximum width in pixels (default: 400)
 * @param maxHeight - Maximum height in pixels (default: 400)
 * @param quality - JPEG quality from 0 to 1 (default: 0.8)
 * @returns Promise resolving to compressed base64 string
 */
export const compressImage = async (
  file: File,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (maintain aspect ratio)
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Calculate the size of a base64 string in kilobytes
 * @param base64String - The base64 string to measure
 * @returns Size in KB
 */
export const getImageSizeKB = (base64String: string): number => {
  // Remove data:image/jpeg;base64, prefix
  const base64 = base64String.split(',')[1] || base64String;
  
  // Calculate size in KB (base64 is ~33% larger than binary)
  const sizeInBytes = (base64.length * 3) / 4;
  return Math.round(sizeInBytes / 1024);
};
