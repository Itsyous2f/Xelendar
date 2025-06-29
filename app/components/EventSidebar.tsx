'use client';

import { useState, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { Search, Calendar, Clock, X, Edit, Repeat, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Event, RecurrenceRule } from '../types/calendar';
import { getRecurrenceDescription } from '../utils/recurrence';

interface EventSidebarProps {
  events: Event[];
  onEventDelete: (eventId: string) => void;
  onEventClick: (event: Event) => void;
  onEventEdit: (event: Event) => void;
  onQuickAdd?: (text: string, selectedDate?: string) => void;
}

export interface EventSidebarRef {
  focusQuickAdd: () => void;
}

const EventSidebar = forwardRef<EventSidebarRef, EventSidebarProps>(({ events, onEventDelete, onEventClick, onEventEdit, onQuickAdd }, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [quickAddText, setQuickAddText] = useState('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const quickAddInputRef = useRef<HTMLInputElement>(null);

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'today':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === today.getTime();
        });
        break;
      case 'upcoming':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() >= today.getTime();
        });
        break;
      case 'past':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() < today.getTime();
        });
        break;
    }

    // Sort by date
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, searchTerm, filter]);

  const formatEventDate = (date: Date) => {
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
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
      'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
    ];
    return { className: colors[index % colors.length] };
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddText.trim() || !onQuickAdd) return;

    setIsQuickAdding(true);
    try {
      await onQuickAdd(quickAddText.trim(), selectedDate || undefined);
      setQuickAddText('');
      setSelectedDate('');
      setShowDatePicker(false);
      toast.success('Event added successfully');
    } catch (error) {
      console.error('Quick add failed:', error);
      toast.error('Failed to add event');
    } finally {
      setIsQuickAdding(false);
    }
  };

  const handleQuickAddTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuickAddText(text);
    
    // Show date picker if user starts typing and there's no date in the text
    const hasDateKeywords = /\b(today|tomorrow|next|on|in)\b/i.test(text);
    setShowDatePicker(text.length > 0 && !hasDateKeywords);
  };

  useImperativeHandle(ref, () => ({
    focusQuickAdd: () => {
      quickAddInputRef.current?.focus();
    }
  }));

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-screen overflow-hidden flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Events ({filteredEvents.length})
        </h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'today', label: 'Today' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`flex-1 px-3 py-1 text-xs rounded-md transition-colors ${
                filter === key
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
        {filteredEvents.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 'No events found' : 'No events yet'}
            </p>
            {!searchTerm && (
              <p className="text-xs mt-1">Click on a date to add an event</p>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group relative p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600"
                onClick={() => onEventClick(event)}
              >
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventEdit(event);
                    }}
                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded transition-colors"
                    title="Edit event"
                  >
                    <Edit className="w-3 h-3 text-blue-500" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventDelete(event.id);
                    }}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
                    title="Delete event"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                </div>

                {/* Event Color Indicator */}
                <div 
                  className={`w-2 h-2 rounded-full ${getEventColor(event, 0).className || ''} mb-2 shadow-sm`} 
                  style={getEventColor(event, 0).backgroundColor ? { backgroundColor: getEventColor(event, 0).backgroundColor } : undefined}
                />

                {/* Event Title */}
                <h3 className="font-medium text-gray-800 dark:text-white text-sm mb-1 line-clamp-1">
                  {event.title}
                </h3>

                {/* Event Date */}
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatEventDate(event.date)}
                </div>

                {/* Event Time */}
                {event.time && (
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {event.time}
                  </div>
                )}

                {/* Recurrence Indicator */}
                {event.recurrence && event.recurrence.type !== 'none' && (
                  <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mb-1">
                    <Repeat className="w-3 h-3 mr-1" />
                    {getRecurrenceDescription(event.recurrence)}
                  </div>
                )}

                {/* Event Description */}
                {event.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <form onSubmit={handleQuickAdd} className="space-y-2">
          <div className="relative">
            <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Quick add event with AI..."
              value={quickAddText}
              onChange={handleQuickAddTextChange}
              className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500"
              disabled={isQuickAdding}
              ref={quickAddInputRef}
            />
            <button
              type="submit"
              disabled={!quickAddText.trim() || isQuickAdding}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Add event with AI"
            >
              {isQuickAdding ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          </div>
          
          {/* Date Picker - shows when user starts typing and no date keywords detected */}
          {showDatePicker && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Select date (optional)"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedDate('');
                  setShowDatePicker(false);
                }}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear
              </button>
            </div>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Try: "Meeting with John tomorrow at 2pm" or "Dentist appointment next Friday"
            {showDatePicker && <br />}
            {showDatePicker && "Or use the date picker above for precise dates"}
          </p>
        </form>
      </div>
    </div>
  );
});

export default EventSidebar; 