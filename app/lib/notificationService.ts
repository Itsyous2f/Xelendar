export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.initialize();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initialize() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
      
      if (this.permission === 'default') {
        this.permission = await Notification.requestPermission();
      }
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  public async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('Notification permission not granted');
        return;
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: false,
        silent: false,
        ...options,
      });

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  public async sendEventNotification(event: { title: string; date: Date; time?: string; description?: string }): Promise<void> {
    const eventDate = new Date(event.date);
    const timeString = event.time ? ` at ${event.time}` : '';
    const dateString = eventDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });

    const title = `Upcoming Event: ${event.title}`;
    const body = `${dateString}${timeString}${event.description ? `\n${event.description}` : ''}`;

    await this.sendNotification(title, {
      body,
      tag: `event-${event.title}-${eventDate.toISOString()}`, // Prevent duplicate notifications
      data: {
        type: 'event',
        eventId: event.title,
        date: eventDate.toISOString(),
      },
    });
  }

  public isSupported(): boolean {
    return 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    return this.permission;
  }
}

// Export a singleton instance
export const notificationService = NotificationService.getInstance(); 