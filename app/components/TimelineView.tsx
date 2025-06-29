'use client';

import { useMemo } from 'react';
import { Calendar, Clock, Repeat, Edit, X } from 'lucide-react';
import { Event } from '../types/calendar';
import { getRecurrenceDescription } from '../utils/recurrence';

interface TimelineViewProps {
  events: Event[];
  onEventDelete: (eventId: string) => void;
  onEventEdit: (event: Event) => void;
  onEventClick: (event: Event) => void;
}

export default function TimelineView({ events, onEventDelete, onEventEdit, onEventClick }: TimelineViewProps) {
  const timelineEvents = useMemo(() => {
    return events
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((event, index) => ({
        ...event,
        timelineIndex: index,
      }));
  }, [events]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return eventDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getEventColor = (event: Event) => {
    if (event.color) return event.color;
    return 'bg-blue-500';
  };

  const isToday = (date: Date) => {
    const today = new Date();
    const eventDate = new Date(date);
    return today.toDateString() === eventDate.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    const eventDate = new Date(date);
    return eventDate < today;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Timeline
      </h2>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
        
        <div className="space-y-6">
          {timelineEvents.map((event, index) => {
            const eventDate = new Date(event.date);
            const isEventToday = isToday(eventDate);
            const isEventPast = isPast(eventDate);
            
            return (
              <div key={event.id} className="relative">
                {/* Timeline Dot */}
                <div className={`absolute left-4 w-4 h-4 rounded-full border-4 border-white dark:border-gray-800 ${
                  isEventToday ? 'bg-red-500' : isEventPast ? 'bg-gray-400' : 'bg-blue-500'
                }`} />
                
                {/* Event Card */}
                <div className={`ml-12 group bg-white dark:bg-gray-800 rounded-lg border-2 p-4 hover:shadow-lg transition-all cursor-pointer ${
                  isEventToday 
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' 
                    : isEventPast 
                    ? 'border-gray-200 dark:border-gray-700 opacity-75' 
                    : 'border-blue-200 dark:border-blue-800'
                }`} onClick={() => onEventClick(event)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getEventColor(event)}`} />
                        <h4 className={`font-medium ${
                          isEventToday ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-white'
                        }`}>
                          {event.title}
                        </h4>
                        {event.recurrence && event.recurrence.type !== 'none' && (
                          <Repeat className="w-4 h-4 text-blue-500" />
                        )}
                        {isEventToday && (
                          <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(event.date)}
                        </div>
                        {event.time && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(event.time)}
                          </div>
                        )}
                      </div>
                      
                      {event.recurrence && event.recurrence.type !== 'none' && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                          {getRecurrenceDescription(event.recurrence)}
                        </div>
                      )}
                      
                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventEdit(event);
                        }}
                        className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                        title="Edit event"
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventDelete(event.id);
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        title="Delete event"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {timelineEvents.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No events scheduled</p>
            <p className="text-sm mt-2">Click on a date to add your first event</p>
          </div>
        )}
      </div>
    </div>
  );
} 