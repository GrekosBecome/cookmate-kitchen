import { useState } from 'react';
import { Bell, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { notificationService } from '@/lib/notifications';
import { toast } from 'sonner';
import { track } from '@/lib/analytics';

type PermissionState = 'default' | 'granted' | 'denied' | 'checking';

export const NotificationPermission = () => {
  const [permissionState, setPermissionState] = useState<PermissionState>('default');

  const handleRequestPermission = async () => {
    setPermissionState('checking');
    track('notification_permission_button_clicked');

    try {
      const granted = await notificationService.requestPermission();
      
      if (granted) {
        setPermissionState('granted');
        toast.success('Notifications enabled!', {
          description: 'You\'ll receive daily recipe suggestions'
        });
      } else {
        setPermissionState('denied');
        toast.error('Notifications blocked', {
          description: 'Please enable notifications in your device settings'
        });
      }
    } catch (error) {
      setPermissionState('denied');
      console.error('Permission request failed:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const getStateIcon = () => {
    switch (permissionState) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <AlertCircle className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const getStateText = () => {
    switch (permissionState) {
      case 'granted':
        return 'Notifications Enabled';
      case 'denied':
        return 'Notifications Blocked';
      case 'checking':
        return 'Checking...';
      default:
        return 'Enable Notifications';
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStateIcon()}
          <div>
            <CardTitle className="text-lg">{getStateText()}</CardTitle>
            <CardDescription>
              {permissionState === 'granted' 
                ? 'You\'ll receive daily recipe suggestions at your chosen time'
                : permissionState === 'denied'
                ? 'Go to Settings > Kitchen Mate > Notifications to enable'
                : 'Get personalized recipe ideas based on your pantry'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {permissionState === 'default' && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium">Why enable notifications?</p>
              <ul className="space-y-1 text-muted-foreground ml-4 list-disc">
                <li>Daily recipe suggestions at your preferred time</li>
                <li>Reminders when ingredients are running low</li>
                <li>Personalized based on your pantry and preferences</li>
              </ul>
            </div>
            <Button 
              onClick={handleRequestPermission}
              className="w-full"
              size="lg"
            >
              <Bell className="w-4 h-4 mr-2" />
              Enable Notifications
            </Button>
          </div>
        )}

        {permissionState === 'granted' && (
          <p className="text-sm text-muted-foreground">
            ✅ All set! Configure your notification schedule in the settings below.
          </p>
        )}

        {permissionState === 'denied' && (
          <Button 
            variant="outline" 
            onClick={handleRequestPermission}
            className="w-full"
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
