import { Event, RecurrenceRule, RecurrenceType } from '../types/calendar';

export function generateRecurringEvents(
  baseEvent: Event,
  startDate: Date,
  endDate: Date
): Event[] {
  if (!baseEvent.recurrence || baseEvent.recurrence.type === 'none') {
    return [baseEvent];
  }

  const events: Event[] = [];
  const { recurrence } = baseEvent;
  let currentDate = new Date(startDate);
  let occurrenceCount = 0;

  while (currentDate <= endDate) {
    // Check if we should stop recurring
    if (recurrence.endDate && currentDate > recurrence.endDate) {
      break;
    }
    if (recurrence.endAfter && occurrenceCount >= recurrence.endAfter) {
      break;
    }

    // Check if this date matches the recurrence pattern
    if (shouldIncludeDate(currentDate, recurrence, startDate)) {
      const eventInstance: Event = {
        ...baseEvent,
        id: `${baseEvent.id}_${currentDate.getTime()}`,
        date: new Date(currentDate),
        originalEventId: baseEvent.id,
        isRecurring: true,
      };
      events.push(eventInstance);
      occurrenceCount++;
    }

    // Move to next occurrence
    currentDate = getNextOccurrence(currentDate, recurrence);
  }

  return events;
}

function shouldIncludeDate(
  date: Date,
  recurrence: RecurrenceRule,
  startDate: Date
): boolean {
  if (date < startDate) return false;

  switch (recurrence.type) {
    case 'daily':
      return true;
    
    case 'weekly':
      if (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0) {
        return date.getDay() === startDate.getDay();
      }
      return recurrence.daysOfWeek.includes(date.getDay());
    
    case 'monthly':
      if (recurrence.dayOfMonth) {
        return date.getDate() === recurrence.dayOfMonth;
      }
      if (recurrence.weekOfMonth && recurrence.dayOfWeek !== undefined) {
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        return weekOfMonth === recurrence.weekOfMonth && 
               date.getDay() === recurrence.dayOfWeek;
      }
      return date.getDate() === startDate.getDate();
    
    case 'yearly':
      return date.getMonth() === startDate.getMonth() && 
             date.getDate() === startDate.getDate();
    
    default:
      return true;
  }
}

function getNextOccurrence(currentDate: Date, recurrence: RecurrenceRule): Date {
  const nextDate = new Date(currentDate);
  const interval = recurrence.interval || 1;

  switch (recurrence.type) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * interval));
      break;
    
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
    
    default:
      nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate;
}

export function getRecurrenceDescription(recurrence: RecurrenceRule): string {
  if (!recurrence || recurrence.type === 'none') {
    return 'No repeat';
  }

  const interval = recurrence.interval || 1;
  const intervalText = interval === 1 ? '' : ` every ${interval}`;

  switch (recurrence.type) {
    case 'daily':
      return `Daily${intervalText}`;
    
    case 'weekly':
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const selectedDays = recurrence.daysOfWeek
          .map(day => dayNames[day])
          .join(', ');
        return `Weekly on ${selectedDays}`;
      }
      return `Weekly${intervalText}`;
    
    case 'monthly':
      if (recurrence.dayOfMonth) {
        return `Monthly on day ${recurrence.dayOfMonth}`;
      }
      if (recurrence.weekOfMonth && recurrence.dayOfWeek !== undefined) {
        const weekNames = ['1st', '2nd', '3rd', '4th', '5th'];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Monthly on ${weekNames[recurrence.weekOfMonth - 1]} ${dayNames[recurrence.dayOfWeek]}`;
      }
      return `Monthly${intervalText}`;
    
    case 'yearly':
      return `Yearly${intervalText}`;
    
    default:
      return 'Custom';
  }
}

export function getEndDateDescription(recurrence: RecurrenceRule): string {
  if (recurrence.endDate) {
    return `until ${recurrence.endDate.toLocaleDateString()}`;
  }
  if (recurrence.endAfter) {
    return `after ${recurrence.endAfter} occurrences`;
  }
  return 'never';
} 