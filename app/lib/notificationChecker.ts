import { Event } from '../types/calendar';
import { notificationService } from './notificationService';

export class NotificationChecker {
  private static instance: NotificationChecker;
  private intervalId: NodeJS.Timeout | null = null;
  private events: Event[] = [];
  private isRunning = false;

  private constructor() {}

  public static getInstance(): NotificationChecker {
    if (!NotificationChecker.instance) {
      NotificationChecker.instance = new NotificationChecker();
    }
    return NotificationChecker.instance;
  }

  public setEvents(events: Event[]): void {
    this.events = events;
  }

  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    
    // Check immediately
    this.checkForNotifications();
    
    // Then check every minute
    this.intervalId = setInterval(() => {
      this.checkForNotifications();
    }, 60000); // 1 minute
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private async checkForNotifications(): Promise<void> {
    if (!notificationService.isSupported()) {
      return;
    }

    const now = new Date();
    const upcomingEvents = this.getUpcomingEvents(now);

    for (const event of upcomingEvents) {
      if (this.shouldSendNotification(event, now)) {
        try {
          await notificationService.sendEventNotification(event);
          console.log(`Notification sent for event: ${event.title}`);
        } catch (error) {
          console.error(`Failed to send notification for event ${event.title}:`, error);
        }
      }
    }
  }

  private getUpcomingEvents(now: Date): Event[] {
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    return this.events.filter(event => {
      // Skip events that don't have notifications enabled
      if (!event.notificationEnabled) {
        return false;
      }

      // Skip events that already had notifications sent
      if (event.notificationSent) {
        return false;
      }

      const eventDateTime = this.getEventDateTime(event);
      
      // Only include events that are happening within the next 30 minutes
      return eventDateTime >= now && eventDateTime <= thirtyMinutesFromNow;
    });
  }

  private shouldSendNotification(event: Event, now: Date): boolean {
    const eventDateTime = this.getEventDateTime(event);
    const notificationTime = event.notificationTime || 15; // default 15 minutes
    const notificationDateTime = new Date(eventDateTime.getTime() - notificationTime * 60 * 1000);
    
    // Send notification if we're within 1 minute of the notification time
    const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000);
    return now >= notificationDateTime && now <= oneMinuteFromNow;
  }

  private getEventDateTime(event: Event): Date {
    const eventDate = new Date(event.date);
    
    if (event.time) {
      const [hours, minutes] = event.time.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
    } else {
      // If no time specified, assume 9 AM
      eventDate.setHours(9, 0, 0, 0);
    }
    
    return eventDate;
  }

  public isActive(): boolean {
    return this.isRunning;
  }
}

// Export a singleton instance
export const notificationChecker = NotificationChecker.getInstance(); 