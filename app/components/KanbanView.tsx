'use client';

import { useMemo } from 'react';
import { Calendar, Clock, Repeat, Edit, X, Plus } from 'lucide-react';
import { Event } from '../types/calendar';
import { getRecurrenceDescription } from '../utils/recurrence';

interface KanbanViewProps {
  events: Event[];
  onEventDelete: (eventId: string) => void;
  onEventEdit: (event: Event) => void;
  onEventClick: (event: Event) => void;
  onDateClick: (date: Date) => void;
}

export default function KanbanView({ events, onEventDelete, onEventEdit, onEventClick, onDateClick }: KanbanViewProps) {
  const columns = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const columns = {
      overdue: [] as Event[],
      today: [] as Event[],
      tomorrow: [] as Event[],
      thisWeek: [] as Event[],
      thisMonth: [] as Event[],
      later: [] as Event[],
    };

    events.forEach(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        columns.overdue.push(event);
      } else if (eventDate.getTime() === today.getTime()) {
        columns.today.push(event);
      } else if (eventDate.getTime() === tomorrow.getTime()) {
        columns.tomorrow.push(event);
      } else if (eventDate < nextWeek) {
        columns.thisWeek.push(event);
      } else if (eventDate < nextMonth) {
        columns.thisMonth.push(event);
      } else {
        columns.later.push(event);
      }
    });

    return columns;
  }, [events]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventColor = (event: Event) => {
    if (event.color) return event.color;
    return 'bg-blue-500';
  };

  const getColumnConfig = (key: string) => {
    const configs = {
      overdue: { title: 'Overdue', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20' },
      today: { title: 'Today', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
      tomorrow: { title: 'Tomorrow', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
      thisWeek: { title: 'This Week', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
      thisMonth: { title: 'This Month', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' },
      later: { title: 'Later', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-900/20' },
    };
    return configs[key as keyof typeof configs];
  };

  const renderColumn = (key: string, events: Event[]) => {
    const config = getColumnConfig(key);
    
    return (
      <div key={key} className="min-w-[280px] max-w-xs flex-shrink-0">
        <div className={`p-3 rounded-lg ${config.bgColor} h-full`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-semibold text-sm ${config.color}`}>
              {config.title}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
              {events.length}
            </span>
          </div>
          
          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.id}
                className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 hover:shadow-md transition-all cursor-pointer"
                onClick={() => onEventClick(event)}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getEventColor(event)}`} />
                    <h4 className="font-medium text-gray-900 dark:text-white text-xs line-clamp-1 min-w-0">
                      {event.title}
                    </h4>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventEdit(event);
                      }}
                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                      title="Edit event"
                    >
                      <Edit className="w-3 h-3 text-blue-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventDelete(event.id);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                      title="Delete event"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{formatDate(event.date)}</span>
                  {event.time && (
                    <>
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{formatTime(event.time)}</span>
                    </>
                  )}
                </div>
                
                {event.recurrence && event.recurrence.type !== 'none' && (
                  <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mb-1">
                    <Repeat className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{getRecurrenceDescription(event.recurrence)}</span>
                  </div>
                )}
                
                {event.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
            
            {/* Add Event Button */}
            <button
              onClick={() => {
                const today = new Date();
                if (key === 'today') onDateClick(today);
                else if (key === 'tomorrow') {
                  const tomorrow = new Date(today);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  onDateClick(tomorrow);
                } else {
                  onDateClick(today);
                }
              }}
              className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs">Add Event</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-full">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Kanban Board
      </h2>
      
      <div className="flex space-x-3 overflow-x-auto pb-4 w-full">
        {renderColumn('overdue', columns.overdue)}
        {renderColumn('today', columns.today)}
        {renderColumn('tomorrow', columns.tomorrow)}
        {renderColumn('thisWeek', columns.thisWeek)}
        {renderColumn('thisMonth', columns.thisMonth)}
        {renderColumn('later', columns.later)}
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