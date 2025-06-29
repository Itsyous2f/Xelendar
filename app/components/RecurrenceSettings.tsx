'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Repeat } from 'lucide-react';
import { RecurrenceRule, RecurrenceType } from '../types/calendar';
import { getRecurrenceDescription, getEndDateDescription } from '../utils/recurrence';

interface RecurrenceSettingsProps {
  recurrence: RecurrenceRule;
  onRecurrenceChange: (recurrence: RecurrenceRule) => void;
}

const RECURRENCE_TYPES: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'No repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export default function RecurrenceSettings({ recurrence, onRecurrenceChange }: RecurrenceSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateRecurrence = (updates: Partial<RecurrenceRule>) => {
    onRecurrenceChange({
      ...recurrence,
      ...updates,
    });
  };

  const handleTypeChange = (type: RecurrenceType) => {
    if (type === 'none') {
      updateRecurrence({ type: 'none' });
    } else {
      updateRecurrence({ 
        type,
        interval: 1,
        daysOfWeek: type === 'weekly' ? [new Date().getDay()] : undefined,
      });
    }
  };

  const toggleDayOfWeek = (day: number) => {
    if (!recurrence.daysOfWeek) {
      updateRecurrence({ daysOfWeek: [day] });
      return;
    }

    const newDays = recurrence.daysOfWeek.includes(day)
      ? recurrence.daysOfWeek.filter(d => d !== day)
      : [...recurrence.daysOfWeek, day];

    updateRecurrence({ daysOfWeek: newDays.length > 0 ? newDays : undefined });
  };

  const isRecurring = recurrence.type !== 'none';

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Repeat className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Repeat
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {isRecurring && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getRecurrenceDescription(recurrence)}
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-600 space-y-4">
          {/* Recurrence Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Repeat
            </label>
            <select
              value={recurrence.type}
              onChange={(e) => handleTypeChange(e.target.value as RecurrenceType)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            >
              {RECURRENCE_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {isRecurring && (
            <>
              {/* Interval */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Every
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={recurrence.interval || 1}
                    onChange={(e) => updateRecurrence({ interval: parseInt(e.target.value) || 1 })}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {recurrence.type === 'daily' && 'day(s)'}
                    {recurrence.type === 'weekly' && 'week(s)'}
                    {recurrence.type === 'monthly' && 'month(s)'}
                    {recurrence.type === 'yearly' && 'year(s)'}
                  </span>
                </div>
              </div>

              {/* Days of Week for Weekly */}
              {recurrence.type === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Days of week
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {DAYS_OF_WEEK.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleDayOfWeek(value)}
                        className={`px-2 py-1 text-xs rounded border transition-colors ${
                          recurrence.daysOfWeek?.includes(value)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showAdvanced ? 'Hide' : 'Show'} advanced options
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-3">
                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End date
                      </label>
                      <input
                        type="date"
                        value={recurrence.endDate ? recurrence.endDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => updateRecurrence({ 
                          endDate: e.target.value ? new Date(e.target.value) : undefined,
                          endAfter: undefined 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>

                    {/* End After Occurrences */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End after
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={recurrence.endAfter || ''}
                          onChange={(e) => updateRecurrence({ 
                            endAfter: e.target.value ? parseInt(e.target.value) : undefined,
                            endDate: undefined 
                          })}
                          className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          occurrences
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {getRecurrenceDescription(recurrence)} {getEndDateDescription(recurrence)}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 