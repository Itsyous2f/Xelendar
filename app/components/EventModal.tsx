'use client';

import { useState, useEffect } from 'react';
import { X, Repeat, Bell, BellOff } from 'lucide-react';
import { EventModalProps, Event, RecurrenceRule } from '../types/calendar';
import RecurrenceSettings from './RecurrenceSettings';
import { generateRecurringEvents } from '../utils/recurrence';

const EVENT_COLORS = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Orange', value: 'bg-orange-500' }
];

const DEFAULT_RECURRENCE: RecurrenceRule = {
  type: 'none'
};

const NOTIFICATION_TIMES = [
  { value: 0, label: 'At event time' },
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' }
];

export default function EventModal({ isOpen, onClose, onAddEvent, onUpdateEvent, selectedDate, editingEvent }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [color, setColor] = useState(EVENT_COLORS[0].value);
  const [date, setDate] = useState<Date | null>(null);
  const [recurrence, setRecurrence] = useState<RecurrenceRule>(DEFAULT_RECURRENCE);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState(15);

  const isEditing = !!editingEvent;

  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        // Editing existing event
        setTitle(editingEvent.title);
        setDescription(editingEvent.description || '');
        setTime(editingEvent.time || '');
        setColor(editingEvent.color || EVENT_COLORS[0].value);
        setDate(new Date(editingEvent.date));
        setRecurrence(editingEvent.recurrence || DEFAULT_RECURRENCE);
        setNotificationEnabled(editingEvent.notificationEnabled ?? true);
        setNotificationTime(editingEvent.notificationTime ?? 15);
      } else {
        // Creating new event
        setTitle('');
        setDescription('');
        setTime('');
        setColor(EVENT_COLORS[0].value);
        setDate(selectedDate);
        setRecurrence(DEFAULT_RECURRENCE);
        setNotificationEnabled(true);
        setNotificationTime(15);
      }
    }
  }, [isOpen, editingEvent, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !date) return;

    const eventData = {
      title: title.trim(),
      description: description.trim() || undefined,
      date: date,
      time: time || undefined,
      color,
      recurrence: recurrence.type === 'none' ? undefined : recurrence,
      isRecurring: recurrence.type !== 'none',
      notificationEnabled,
      notificationTime
    };

    if (isEditing && editingEvent) {
      onUpdateEvent(editingEvent.id, eventData);
    } else {
      onAddEvent(eventData);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Create date at noon in local timezone to avoid timezone issues
    const dateString = e.target.value; // Format: YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number);
    const newDate = new Date(year, month - 1, day, 12, 0, 0, 0); // Noon in local timezone
    setDate(newDate);
  };

  const isRecurring = recurrence.type !== 'none';

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {isEditing ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white dark:bg-gray-800">
          {/* Date Selection */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              id="date"
              value={date ? date.toISOString().split('T')[0] : ''}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Enter event description (optional)"
            />
          </div>

          {/* Time */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time
            </label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {EVENT_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`w-full h-10 rounded-lg border-2 transition-all shadow-sm ${
                    color === colorOption.value
                      ? 'border-gray-800 dark:border-white scale-105 shadow-md'
                      : 'border-gray-300 dark:border-gray-600 hover:scale-105 hover:shadow-md'
                  } ${colorOption.value}`}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {notificationEnabled ? (
                  <Bell className="w-4 h-4 text-blue-500" />
                ) : (
                  <BellOff className="w-4 h-4 text-gray-400" />
                )}
                <span>Notifications</span>
              </label>
              <button
                type="button"
                onClick={() => setNotificationEnabled(!notificationEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {notificationEnabled && (
              <div>
                <label htmlFor="notificationTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Remind me
                </label>
                <select
                  id="notificationTime"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {NOTIFICATION_TIMES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Recurrence Settings */}
          <RecurrenceSettings
            recurrence={recurrence}
            onRecurrenceChange={setRecurrence}
          />

          {/* Recurring Event Warning */}
          {isRecurring && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <Repeat className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">Recurring Event</p>
                  <p className="text-xs mt-1">
                    This event will repeat according to your settings. You can edit individual occurrences later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isEditing ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 