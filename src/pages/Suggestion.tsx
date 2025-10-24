import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Suggestion() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Today's Suggestions</h1>
          <Button variant="outline" onClick={() => navigate('/settings')}>
            Settings
          </Button>
        </div>

        <Card className="p-8 space-y-4 text-center">
          <ChefHat className="h-16 w-16 mx-auto text-primary" />
          <h2 className="text-2xl font-semibold">Suggestions coming soon!</h2>
          <p className="text-muted-foreground">
            We're working on personalized recipe suggestions based on your pantry and preferences.
          </p>
        </Card>

        <div className="space-y-3">
          <Button onClick={() => navigate('/pantry')} className="w-full h-12 rounded-full">
            Manage Pantry
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
  );
}
