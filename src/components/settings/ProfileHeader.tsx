import { User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const ProfileHeader = () => {
  return (
    <div className="flex items-center gap-4 p-6 bg-card rounded-2xl border shadow-sm">
      <Avatar className="h-16 w-16">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <User className="h-8 w-8" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <h2 className="text-xl font-semibold">Hello, Chef!</h2>
        <p className="text-sm text-muted-foreground">Your kitchen, your rules</p>
      </div>
    </div>
  );
};
