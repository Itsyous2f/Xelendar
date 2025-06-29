export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval?: number; // Every X days/weeks/months/years
  endDate?: Date; // When to stop recurring
  endAfter?: number; // Stop after X occurrences
  daysOfWeek?: number[]; // For weekly: [0,1,2,3,4,5,6] where 0=Sunday
  dayOfMonth?: number; // For monthly: 1-31
  weekOfMonth?: number; // For monthly: 1-5 (first, second, etc.)
  dayOfWeek?: number; // For monthly: 0-6 (Sunday-Saturday)
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time?: string;
  color?: string;
  recurrence?: RecurrenceRule;
  isRecurring?: boolean;
  originalEventId?: string; // For recurring event instances
  notificationEnabled?: boolean;
  notificationTime?: number; // minutes before event
  notificationSent?: boolean;
}

export interface CalendarProps {
  events: Event[];
  onDateClick: (date: Date) => void;
  onEventDelete: (eventId: string) => void;
}

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onUpdateEvent: (eventId: string, event: Omit<Event, 'id'>) => void;
  selectedDate: Date | null;
  editingEvent: Event | null;
}

export interface EventSidebarProps {
  events: Event[];
  onEventDelete: (eventId: string) => void;
  onEventClick: (event: Event) => void;
  onEventEdit: (event: Event) => void;
} 