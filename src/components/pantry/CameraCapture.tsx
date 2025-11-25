import { useEffect } from 'react';
import { Camera } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { takePhoto } from '@/utils/capacitorCamera';
import { Capacitor } from '@capacitor/core';

interface CameraCaptureProps {
  open: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export const CameraCapture = ({ open, onClose, onCapture }: CameraCaptureProps) => {
  useEffect(() => {
    if (open && Capacitor.isNativePlatform()) {
      // On native platforms, immediately trigger camera
      handleTakePhoto();
    }
  }, [open]);

  const handleTakePhoto = async () => {
    try {
      const photoData = await takePhoto();
      
      if (photoData) {
        onCapture(photoData);
        onClose();
      } else {
        toast.error("Couldn't capture photo. Please try again.");
        onClose();
      }
    } catch (error) {
      console.error('Camera error:', error);
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message;
        if (errorMessage.includes('cancelled') || errorMessage.includes('cancel')) {
          // User cancelled, just close silently
          onClose();
          return;
        }
      }
      
      toast.error('Camera access needed to take food photos 📸');
      onClose();
    }
  };

  // On web, show error message
  if (!Capacitor.isNativePlatform() && open) {
    toast.error("Camera is only available in the mobile app");
    onClose();
    return null;
  }

  // On native, the dialog opens but camera is triggered immediately
  // so we don't need to show any UI
  return null;
};
