'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CalendarProps, Event } from '../types/calendar';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EVENT_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500'
];

interface CalendarProps {
  events: Event[];
  onDateClick: (date: Date) => void;
  onEventDelete: (eventId: string) => void;
  currentDate?: Date;
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
}

export default function Calendar({ 
  events, 
  onDateClick, 
  onEventDelete, 
  currentDate: propCurrentDate,
  onPreviousMonth,
  onNextMonth
}: CalendarProps) {
  const [internalCurrentDate, setInternalCurrentDate] = useState(new Date());
  
  // Use prop if provided, otherwise use internal state
  const currentDate = propCurrentDate || internalCurrentDate;
  const setCurrentDate = propCurrentDate ? (onPreviousMonth && onNextMonth ? () => {} : setInternalCurrentDate) : setInternalCurrentDate;

  // Debug logging
  console.log('Calendar received events:', events.length, events);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      // Normalize both dates to start of day for comparison
      const normalizedEventDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const matches = normalizedEventDate.getTime() === normalizedDate.getTime();
      
      // Debug logging for today's events
      if (date.toDateString() === new Date().toDateString()) {
        console.log('Checking event for today:', {
          eventTitle: event.title,
          eventDate: eventDate,
          normalizedEventDate,
          normalizedDate,
          matches
        });
      }
      
      return matches;
    });
    
    // Debug logging for today
    if (date.toDateString() === new Date().toDateString() && dayEvents.length > 0) {
      console.log('Events found for today:', dayEvents);
    }
    
    return dayEvents;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear();
  };

  const previousMonth = () => {
    if (onPreviousMonth) {
      onPreviousMonth();
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const nextMonth = () => {
    if (onNextMonth) {
      onNextMonth();
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const getEventColor = (event: Event, index: number) => {
    // If event has a hex color, use it as inline style
    if (event.color && event.color.startsWith('#')) {
      return { backgroundColor: event.color };
    }
    
    // If event has a CSS class color, use it
    if (event.color && !event.color.startsWith('#')) {
      return { className: event.color };
    }
    
    // Fallback to predefined colors
    return { className: EVENT_COLORS[index % EVENT_COLORS.length] };
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col border border-gray-200 dark:border-gray-700">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-900">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => {
              const today = new Date();
              setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
            }}
            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Today
          </button>
        </div>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid Container */}
      <div className="flex-1 p-4 flex flex-col bg-white dark:bg-gray-800">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 mb-2 flex-shrink-0">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDate(day) : [];
            
            return (
              <div
                key={index}
                className={`p-2 border border-gray-200 dark:border-gray-700 ${
                  day ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                } ${!day || !isCurrentMonth(day) ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'} ${
                  day && isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''
                } transition-colors flex flex-col min-h-[80px]`}
                onClick={() => day && onDateClick(day)}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 flex-shrink-0 ${
                      isToday(day) ? 'text-blue-600 dark:text-blue-400' : ''
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    {/* Events */}
                    <div className="space-y-1 flex-1 overflow-hidden">
                      {dayEvents.slice(0, 3).map((event, eventIndex) => {
                        const colorStyle = getEventColor(event, eventIndex);
                        return (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate text-white relative group flex-shrink-0 shadow-sm ${
                              colorStyle.className || ''
                            }`}
                            style={colorStyle.backgroundColor ? { backgroundColor: colorStyle.backgroundColor } : undefined}
                          >
                            <span className="truncate block">{event.title}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventDelete(event.id);
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs shadow-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 