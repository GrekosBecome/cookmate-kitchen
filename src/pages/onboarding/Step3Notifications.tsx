import { useEffect, useState } from 'react';
import { SelectableChip } from '@/components/SelectableChip';
import { ServingsStepper } from '@/components/ServingsStepper';
import { Card, CardHeader, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { notificationService } from '@/lib/notifications';
import { toast } from 'sonner';
interface Step3NotificationsProps {
  notificationTime: string;
  notificationDays: string[];
  servings: number;
  onUpdateTime: (time: string) => void;
  onUpdateDays: (days: string[]) => void;
  onUpdateServings: (servings: number) => void;
}
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00'];
export const Step3Notifications = ({
  notificationTime,
  notificationDays,
  servings,
  onUpdateTime,
  onUpdateDays,
  onUpdateServings
}: Step3NotificationsProps) => {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const granted = await notificationService.requestPermission();
        setPermissionGranted(granted);
        
        if (granted) {
          toast.success('Notifications enabled!', {
            description: 'You\'ll receive daily recipe suggestions'
          });
        } else {
          toast.error('Notifications blocked', {
            description: 'You can enable them later in Settings'
          });
        }
      } catch (error) {
        setPermissionGranted(false);
        toast.error('Failed to request notification permission');
      }
    };

    requestPermission();
  }, []);

  const toggleDay = (day: string) => {
    if (notificationDays.includes(day)) {
      onUpdateDays(notificationDays.filter(d => d !== day));
    } else {
      onUpdateDays([...notificationDays, day]);
    }
  };
  return <div className="space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-4xl tracking-wide gradient-text font-normal">
          Set your preferences
        </h1>
        <p className="text-muted-foreground text-lg font-light">
          When would you like recipe suggestions?
        </p>
      </div>

      {/* Permission Status Card */}
      {permissionGranted !== null && (
        <Card className={permissionGranted ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : "border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20"}>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 py-3">
            {permissionGranted ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <CardDescription className="text-green-700 dark:text-green-300">
                  ✅ Notifications enabled! Choose when you'd like to be notified.
                </CardDescription>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-orange-500" />
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  ⚠️ Notifications blocked. You can enable them later in Settings.
                </CardDescription>
              </>
            )}
          </CardHeader>
        </Card>
      )}

      {/* Time */}
      <div className="space-y-4">
        <h2 className="text-xl font-extralight">Notification time</h2>
        <div className="flex flex-wrap gap-3">
          {timeSlots.map(time => <SelectableChip key={time} label={time} selected={notificationTime === time} onToggle={() => onUpdateTime(time)} variant="small" />)}
        </div>
      </div>

      {/* Days */}
      <div className="space-y-4">
        <h2 className="text-xl font-extralight">Days</h2>
        <div className="flex flex-wrap gap-3">
          {weekDays.map(day => <SelectableChip key={day} label={day} selected={notificationDays.includes(day)} onToggle={() => toggleDay(day)} variant="small" />)}
        </div>
      </div>

      {/* Servings */}
      <div className="space-y-4">
        <h2 className="text-xl font-extralight">Default servings</h2>
        <div className="flex justify-center py-4">
          <ServingsStepper value={servings} onChange={onUpdateServings} min={1} max={10} />
        </div>
      </div>

      <div className="pt-4 text-center">
        <p className="text-sm text-muted-foreground font-light">
          Your preferences are stored locally. You control your data.
        </p>
      </div>
    </div>;
};