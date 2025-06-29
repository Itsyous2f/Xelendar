'use client';

import { useMemo } from 'react';
import { Calendar, Clock, Repeat, Edit, X } from 'lucide-react';
import { Event } from '../types/calendar';
import { getRecurrenceDescription } from '../utils/recurrence';

interface AgendaViewProps {
  events: Event[];
  onEventDelete: (eventId: string) => void;
  onEventEdit: (event: Event) => void;
  onEventClick: (event: Event) => void;
}

export default function AgendaView({ events, onEventDelete, onEventEdit, onEventClick }: AgendaViewProps) {
  const groupedEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const groups = {
      today: [] as Event[],
      tomorrow: [] as Event[],
      thisWeek: [] as Event[],
      later: [] as Event[],
    };

    events.forEach(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      if (eventDate.getTime() === today.getTime()) {
        groups.today.push(event);
      } else if (eventDate.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(event);
      } else if (eventDate >= today && eventDate < nextWeek) {
        groups.thisWeek.push(event);
      } else if (eventDate >= nextWeek) {
        groups.later.push(event);
      }
    });

    return groups;
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
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const getEventColor = (event: Event) => {
    if (event.color) return event.color;
    return 'bg-blue-500';
  };

  const renderEventGroup = (title: string, events: Event[], color: string) => {
    if (events.length === 0) return null;

    return (
      <div key={title} className="mb-6">
        <h3 className={`text-lg font-semibold mb-3 ${color}`}>
          {title} ({events.length})
        </h3>
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => onEventClick(event)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getEventColor(event)}`} />
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h4>
                    {event.recurrence && event.recurrence.type !== 'none' && (
                      <Repeat className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
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
                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                      {getRecurrenceDescription(event.recurrence)}
                    </div>
                  )}
                  
                  {event.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
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
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Agenda
      </h2>
      
      <div className="space-y-6">
        {renderEventGroup('Today', groupedEvents.today, 'text-red-600 dark:text-red-400')}
        {renderEventGroup('Tomorrow', groupedEvents.tomorrow, 'text-orange-600 dark:text-orange-400')}
        {renderEventGroup('This Week', groupedEvents.thisWeek, 'text-blue-600 dark:text-blue-400')}
        {renderEventGroup('Later', groupedEvents.later, 'text-gray-600 dark:text-gray-400')}
      </div>
      
      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No events scheduled</p>
          <p className="text-sm mt-2">Click on a date to add your first event</p>
        </div>
      )}
    </div>
  );
} 