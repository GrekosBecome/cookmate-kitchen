import { Camera, Image as ImageIcon, Plus, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface AddOptionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCameraClick: () => void;
  onPhotosClick: () => void;
  onManualClick: () => void;
}

export function AddOptionsSheet({
  open,
  onOpenChange,
  onCameraClick,
  onPhotosClick,
  onManualClick,
}: AddOptionsSheetProps) {
  const handleOptionClick = (callback: () => void) => {
    callback();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-auto rounded-t-3xl border-none bg-background/95 backdrop-blur-xl"
      >
        <SheetHeader className="pb-6">
          <SheetTitle className="text-center text-xl">Add to Pantry</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pb-8">
          <button
            onClick={() => handleOptionClick(onCameraClick)}
            className="w-full flex flex-col items-center justify-center gap-3 py-6 rounded-2xl hover:bg-accent/50 transition-colors active:scale-95"
          >
            <div className="h-24 w-24 rounded-full bg-card flex items-center justify-center shadow-sm">
              <Camera className="h-10 w-10 text-muted-foreground" />
            </div>
            <span className="text-base font-medium">Camera</span>
          </button>

          <button
            onClick={() => handleOptionClick(onPhotosClick)}
            className="w-full flex flex-col items-center justify-center gap-3 py-6 rounded-2xl hover:bg-accent/50 transition-colors active:scale-95"
          >
            <div className="h-24 w-24 rounded-full bg-card flex items-center justify-center shadow-sm">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <span className="text-base font-medium">Photos</span>
          </button>

          <button
            onClick={() => handleOptionClick(onManualClick)}
            className="w-full flex flex-col items-center justify-center gap-3 py-6 rounded-2xl hover:bg-accent/50 transition-colors active:scale-95"
          >
            <div className="h-24 w-24 rounded-full bg-card flex items-center justify-center shadow-sm">
              <Plus className="h-10 w-10 text-muted-foreground" />
            </div>
            <span className="text-base font-medium">Add manually</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
