import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { preferences, reset } = useStore();

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      reset();
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {preferences && (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Your Preferences</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Diet:</span> {preferences.diet}
              </div>
              {preferences.allergies.length > 0 && (
                <div>
                  <span className="font-medium">Allergies:</span>{' '}
                  {preferences.allergies.join(', ')}
                </div>
              )}
              {preferences.dislikes.length > 0 && (
                <div>
                  <span className="font-medium">Dislikes:</span>{' '}
                  {preferences.dislikes.join(', ')}
                </div>
              )}
              <div>
                <span className="font-medium">Notifications:</span>{' '}
                {preferences.notificationTime} on {preferences.notificationDays.join(', ')}
              </div>
              <div>
                <span className="font-medium">Default servings:</span> {preferences.servings}
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-3 pt-4">
          <Button
            onClick={() => navigate('/onboarding')}
            variant="outline"
            className="w-full h-12 rounded-full"
          >
            Update Preferences
          </Button>
          <Button
            onClick={handleReset}
            variant="destructive"
            className="w-full h-12 rounded-full"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Reset All Data
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>All data is stored locally on your device.</p>
          <p>You control your data.</p>
        </div>
      </div>
    </div>
  );
}
