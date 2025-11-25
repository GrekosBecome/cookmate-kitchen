import { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CameraCapture } from './CameraCapture';
import { toast } from 'sonner';
import { compressImage } from '@/utils/imageCompression';
import { takePhoto } from '@/utils/capacitorCamera';
import { Capacitor } from '@capacitor/core';

interface ImageUploaderProps {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  autoOpenCamera?: boolean;
  autoOpenGallery?: boolean;
}

export const ImageUploader = ({ onImagesChange, maxImages = 5, autoOpenCamera = false, autoOpenGallery = false }: ImageUploaderProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-open camera or gallery when props are set
  useEffect(() => {
    if (autoOpenCamera && images.length < maxImages) {
      setCameraOpen(true);
    } else if (autoOpenGallery && images.length < maxImages) {
      fileInputRef.current?.click();
    }
  }, [autoOpenCamera, autoOpenGallery]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = maxImages - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    try {
      // Compress all images in parallel (800x800px for pantry, higher quality than profile)
      const compressedImages = await Promise.all(
        filesToProcess.map(file => compressImage(file, 800, 800, 0.85))
      );
      
      const updated = [...images, ...compressedImages];
      setImages(updated);
      onImagesChange(updated);
    } catch (error) {
      console.error('Image compression error:', error);
      toast.error('Failed to process images');
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onImagesChange(updated);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const openCamera = async () => {
    if (images.length >= maxImages) return;
    
    if (Capacitor.isNativePlatform()) {
      // Native platform: use Capacitor Camera directly
      try {
        const photoData = await takePhoto();
        if (photoData) {
          handleCameraCapture(photoData);
        }
      } catch (error) {
        console.error('Camera error:', error);
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = (error as { message: string }).message;
          if (errorMessage.includes('cancelled') || errorMessage.includes('cancel')) {
            // User cancelled, do nothing
            return;
          }
        }
        toast.error('Camera access needed to take food photos 📸');
      }
    } else {
      // Web platform: use CameraCapture component (will show error)
      setCameraOpen(true);
    }
  };

  const handleCameraCapture = (imageData: string) => {
    const updated = [...images, imageData];
    setImages(updated);
    onImagesChange(updated);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={openCamera}
            variant="outline"
            className="h-24 flex flex-col gap-2"
          >
            <Camera className="h-8 w-8" />
            <span className="text-sm">Camera</span>
          </Button>
          <Button
            onClick={openFilePicker}
            variant="outline"
            className="h-24 flex flex-col gap-2"
          >
            <ImageIcon className="h-8 w-8" />
            <span className="text-sm">Gallery</span>
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        {images.length}/{maxImages} images • Upload photos of your fridge or pantry
      </p>

      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
