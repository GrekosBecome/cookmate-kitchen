import { Button } from '@/components/ui/button';
import { ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Pantry() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Pantry</h1>
          <Button onClick={() => navigate('/settings')}>Settings</Button>
        </div>

        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <ChefHat className="h-20 w-20 text-muted-foreground" />
          <h2 className="text-2xl font-semibold text-center">Pantry coming soon!</h2>
          <p className="text-muted-foreground text-center max-w-md">
            This is where you'll manage your ingredients. For now, let's explore other features.
          </p>
          <div className="pt-4 space-y-3 w-full max-w-sm">
            <Button onClick={() => navigate('/suggestion')} className="w-full h-12 rounded-full">
              View Suggestions
            </Button>
            <Button
              onClick={() => navigate('/chat')}
              variant="outline"
              className="w-full h-12 rounded-full"
            >
              Chat Assistant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
