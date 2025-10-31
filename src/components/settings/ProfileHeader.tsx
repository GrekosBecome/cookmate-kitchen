import { User, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore, defaultPreferences } from '@/store/useStore';
import { useRef } from 'react';

export const ProfileHeader = () => {
  const { preferences, updatePreferences } = useStore();
  const currentPrefs = preferences || defaultPreferences;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Limit file size to 500KB
    if (file.size > 500 * 1024) {
      alert('Image size should be less than 500KB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      updatePreferences({ profileImage: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    updatePreferences({ profileImage: undefined });
  };

  return (
    <div className="flex items-center gap-4 p-6 bg-card rounded-2xl border shadow-sm">
      <div className="relative">
        <Avatar 
          className="h-16 w-16 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => fileInputRef.current?.click()}
        >
          {currentPrefs.profileImage ? (
            <AvatarImage src={currentPrefs.profileImage} alt="Profile" />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-8 w-8" />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5">
          <Camera className="h-3 w-3 text-primary-foreground" />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>
      
      <div className="flex-1">
        <h2 className="text-xl font-semibold">Hello, Chef!</h2>
        <p className="text-sm text-muted-foreground">Your kitchen, your rules</p>
        {currentPrefs.profileImage && (
          <button
            onClick={handleRemovePhoto}
            className="text-xs text-muted-foreground hover:text-destructive mt-1 transition-colors"
          >
            Remove photo
          </button>
        )}
      </div>
    </div>
  );
};
