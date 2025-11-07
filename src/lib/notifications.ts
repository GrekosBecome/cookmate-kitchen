import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { track } from './analytics';

export interface NotificationPreferences {
  enabled: boolean;
  time: string;
  days: string[];
}

class NotificationService {
  private isNative = Capacitor.isNativePlatform();

  async requestPermission(): Promise<boolean> {
    try {
      if (!this.isNative) {
        // PWA/Web fallback - in-app only
        console.log('Web platform - notifications will be in-app only');
        track('notification_permission_web_fallback');
        return true;
      }

      const result = await LocalNotifications.requestPermissions();
      const granted = result.display === 'granted';
      
      track('notification_permission_requested', { 
        granted,
        platform: 'native'
      });

      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      track('notification_permission_error', { error: String(error) });
      return false;
    }
  }

  async checkPermission(): Promise<boolean> {
    try {
      if (!this.isNative) {
        return true; // Web always returns true (in-app notifications)
      }

      const result = await LocalNotifications.checkPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  }

  async scheduleNotifications(preferences: NotificationPreferences): Promise<void> {
    try {
      if (!this.isNative) {
        // Store preferences for in-app notifications
        localStorage.setItem('notification_preferences', JSON.stringify(preferences));
        console.log('Web platform - preferences saved for in-app notifications');
        return;
      }

      if (!preferences.enabled) {
        await this.cancelAllNotifications();
        return;
      }

      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        throw new Error('Notification permission not granted');
      }

      // Cancel existing notifications
      await this.cancelAllNotifications();

      // Parse time (format: "08:00")
      const [hours, minutes] = preferences.time.split(':').map(Number);

      // Schedule notifications for selected days
      const dayMap: Record<string, number> = {
        'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 
        'Fri': 5, 'Sat': 6, 'Sun': 0
      };

      const notifications = preferences.days.map((day, index) => ({
        id: index + 1,
        title: '🍳 Time for a delicious recipe!',
        body: 'Check your pantry and discover what you can cook today',
        schedule: {
          on: {
            hour: hours,
            minute: minutes,
            weekday: dayMap[day],
          },
          allowWhileIdle: true,
        },
        actionTypeId: 'RECIPE_SUGGESTION',
        extra: {
          route: '/suggestion'
        }
      }));

      await LocalNotifications.schedule({
        notifications
      });

      track('notifications_scheduled', {
        time: preferences.time,
        days: preferences.days.length,
        platform: 'native'
      });

    } catch (error) {
      console.error('Error scheduling notifications:', error);
      track('notification_schedule_error', { error: String(error) });
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      if (!this.isNative) {
        localStorage.removeItem('notification_preferences');
        return;
      }

      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications
        });
      }

      track('notifications_cancelled', { platform: 'native' });
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  async testNotification(): Promise<void> {
    try {
      if (!this.isNative) {
        // Show in-app toast for web
        console.log('Test notification - web platform');
        track('test_notification_web');
        return;
      }

      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        throw new Error('Notification permission not granted');
      }

      await LocalNotifications.schedule({
        notifications: [{
          id: 999,
          title: '🍳 Test Notification',
          body: 'Your recipe notifications are working!',
          schedule: {
            at: new Date(Date.now() + 1000) // 1 second from now
          },
          actionTypeId: 'TEST',
        }]
      });

      track('test_notification_sent', { platform: 'native' });
    } catch (error) {
      console.error('Error sending test notification:', error);
      track('test_notification_error', { error: String(error) });
      throw error;
    }
  }

  isNativePlatform(): boolean {
    return this.isNative;
  }

  async sendLowStockAlert(itemName: string, confidence: number): Promise<void> {
    try {
      if (!this.isNative) {
        // For web, we'll rely on toast notifications
        console.log(`Low stock alert for ${itemName} (${Math.round(confidence)}%)`);
        track('low_stock_alert_web', { itemName, confidence });
        return;
      }

      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        console.log('No notification permission for low stock alert');
        return;
      }

      // Generate unique ID based on item name
      const id = Math.abs(itemName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 100000;

      await LocalNotifications.schedule({
        notifications: [{
          id: id,
          title: '🛒 Low Stock Alert',
          body: `Your ${itemName} is running low (${Math.round(confidence)}%). Time to add it to your shopping list!`,
          schedule: {
            at: new Date(Date.now() + 2000) // 2 seconds from now
          },
          actionTypeId: 'LOW_STOCK',
          extra: {
            route: '/pantry?tab=shopping',
            itemName: itemName
          }
        }]
      });

      track('low_stock_alert_sent', { 
        itemName, 
        confidence,
        platform: 'native' 
      });
    } catch (error) {
      console.error('Error sending low stock alert:', error);
      track('low_stock_alert_error', { error: String(error) });
    }
  }
}

export const notificationService = new NotificationService();
