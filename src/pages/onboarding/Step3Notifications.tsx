import { SelectableChip } from '@/components/SelectableChip';
import { ServingsStepper } from '@/components/ServingsStepper';

interface Step3NotificationsProps {
  notificationTime: string;
  notificationDays: string[];
  servings: number;
  onUpdateTime: (time: string) => void;
  onUpdateDays: (days: string[]) => void;
  onUpdateServings: (servings: number) => void;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const timeSlots = [
  '07:00',
  '07:30',
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
];

export const Step3Notifications = ({
  notificationTime,
  notificationDays,
  servings,
  onUpdateTime,
  onUpdateDays,
  onUpdateServings,
}: Step3NotificationsProps) => {
  const toggleDay = (day: string) => {
    if (notificationDays.includes(day)) {
      onUpdateDays(notificationDays.filter((d) => d !== day));
    } else {
      onUpdateDays([...notificationDays, day]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Set your preferences</h1>
        <p className="text-muted-foreground text-lg">
          When would you like recipe suggestions?
        </p>
      </div>

      {/* Time */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Notification time</h2>
        <div className="flex flex-wrap gap-3">
          {timeSlots.map((time) => (
            <SelectableChip
              key={time}
              label={time}
              selected={notificationTime === time}
              onToggle={() => onUpdateTime(time)}
              variant="small"
            />
          ))}
        </div>
      </div>

      {/* Days */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Days</h2>
        <div className="flex flex-wrap gap-3">
          {weekDays.map((day) => (
            <SelectableChip
              key={day}
              label={day}
              selected={notificationDays.includes(day)}
              onToggle={() => toggleDay(day)}
              variant="small"
            />
          ))}
        </div>
      </div>

      {/* Servings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Default servings</h2>
        <div className="flex justify-center py-4">
          <ServingsStepper
            value={servings}
            onChange={onUpdateServings}
            min={1}
            max={10}
          />
        </div>
      </div>

      <div className="pt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Your preferences are stored locally. You control your data.
        </p>
      </div>
    </div>
  );
};
