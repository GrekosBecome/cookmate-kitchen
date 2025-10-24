import { useNavigate } from 'react-router-dom';
import { useStore, defaultPreferences } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { SelectableChip } from '@/components/SelectableChip';
import { ServingsStepper } from '@/components/ServingsStepper';
import { ArrowLeft, Trash2, Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getTopTags } from '@/lib/learning';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 4 }, (_, i) => {
  const hour = 7 + i;
  return `${hour.toString().padStart(2, '0')}:00`;
});

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { preferences, updatePreferences, reset, learning, resetLearning } = useStore();
  const [showResetLearningDialog, setShowResetLearningDialog] = useState(false);

  const currentPrefs = preferences || defaultPreferences;
  const topTags = getTopTags(learning, 8);
  const likedTags = topTags.filter(t => t.weight > 0);
  const mutedTags = topTags.filter(t => t.weight < 0);

  const handleDietChange = (diet: string) => {
    updatePreferences({ diet: diet as any });
  };

  const handleNotificationTimeChange = (time: string) => {
    updatePreferences({ notificationTime: time });
  };

  const toggleDay = (day: string) => {
    const newDays = currentPrefs.notificationDays.includes(day)
      ? currentPrefs.notificationDays.filter(d => d !== day)
      : [...currentPrefs.notificationDays, day];
    updatePreferences({ notificationDays: newDays });
  };

  const handleServingsChange = (servings: number) => {
    updatePreferences({ servings });
  };

  const handlePrivacyToggle = (checked: boolean) => {
    updatePreferences({ privacyNoStoreImages: checked });
  };

  const handleDeleteAllData = () => {
    reset();
    toast({
      title: "All data cleared",
      description: "Your preferences and pantry have been reset.",
    });
    navigate('/');
  };

  const handleResetLearning = () => {
    resetLearning();
    setShowResetLearningDialog(false);
    toast({
      title: "Learning data reset",
      description: "Your personalization has been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/suggestion')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <header>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your preferences and data
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Diet Preference</CardTitle>
            <CardDescription>Choose your dietary style</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Regular', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Gluten-free'].map((diet) => (
                <SelectableChip
                  key={diet}
                  label={diet}
                  selected={currentPrefs.diet === diet}
                  onToggle={() => handleDietChange(diet)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Daily recipe suggestions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="time-select">Time</Label>
              <Select
                value={currentPrefs.notificationTime}
                onValueChange={handleNotificationTimeChange}
              >
                <SelectTrigger id="time-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Days</Label>
              <div className="flex gap-2 flex-wrap mt-2">
                {DAYS.map((day) => (
                  <SelectableChip
                    key={day}
                    label={day}
                    selected={currentPrefs.notificationDays.includes(day)}
                    onToggle={() => toggleDay(day)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Servings</CardTitle>
            <CardDescription>Default number of servings</CardDescription>
          </CardHeader>
          <CardContent>
            <ServingsStepper
              value={currentPrefs.servings}
              onChange={handleServingsChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>Control your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Process photos locally</Label>
                <p className="text-sm text-muted-foreground">
                  Don't store uploaded images
                </p>
              </div>
              <Switch
                checked={currentPrefs.privacyNoStoreImages || false}
                onCheckedChange={handlePrivacyToggle}
              />
            </div>

            <Separator />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete all data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your preferences, pantry items, and signals. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllData}>
                    Delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Learning
            </CardTitle>
            <CardDescription>
              We learn your taste over time — you can reset this anytime.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {likedTags.length > 0 && (
              <div className="space-y-2">
                <Label>Liked Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {likedTags.map(({ tag, weight }) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {tag} (+{weight.toFixed(1)})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {mutedTags.length > 0 && (
              <div className="space-y-2">
                <Label>Muted Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {mutedTags.map(({ tag, weight }) => (
                    <Badge key={tag} variant="outline" className="gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {tag} ({weight.toFixed(1)})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {likedTags.length === 0 && mutedTags.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No learning data yet. Keep using the app to personalize your suggestions!
              </p>
            )}

            <Button
              variant="outline"
              onClick={() => setShowResetLearningDialog(true)}
              className="w-full"
            >
              Reset Learning
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Your data is stored locally on your device. You have full control.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
