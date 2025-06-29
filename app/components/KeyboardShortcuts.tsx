'use client';

import { useEffect } from 'react';
import { X, Calendar, Clock, Plus, Search, ArrowLeft, ArrowRight, Sun, Sparkles } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  key: string;
  description: string;
  icon?: React.ReactNode;
}

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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

  const shortcuts: Shortcut[] = [
    { key: 'Alt + K', description: 'Show keyboard shortcuts', icon: <Search className="w-4 h-4" /> },
    { key: 'Alt + N', description: 'Create new event', icon: <Plus className="w-4 h-4" /> },
    { key: 'Alt + C', description: 'Switch to calendar view', icon: <Calendar className="w-4 h-4" /> },
    { key: 'Alt + T', description: 'Switch to timeline view', icon: <Clock className="w-4 h-4" /> },
    { key: 'Alt + S', description: 'Toggle sidebar', icon: <ArrowLeft className="w-4 h-4" /> },
    { key: 'Alt + D', description: 'Toggle dark mode', icon: <Sun className="w-4 h-4" /> },
    { key: 'Q', description: 'Focus AI quick add input', icon: <Sparkles className="w-4 h-4" /> },
    { key: '←', description: 'Previous month', icon: <ArrowLeft className="w-4 h-4" /> },
    { key: '→', description: 'Next month', icon: <ArrowRight className="w-4 h-4" /> },
    { key: 'Home', description: 'Go to today', icon: <Calendar className="w-4 h-4" /> },
    { key: 'Ctrl + T', description: 'Go to today (alternative)', icon: <Calendar className="w-4 h-4" /> },
    { key: 'Space', description: 'Create new event', icon: <Plus className="w-4 h-4" /> },
    { key: '1-9', description: 'Navigate to date (1-9th)', icon: <Calendar className="w-4 h-4" /> },
    { key: 'Escape', description: 'Close modal/shortcuts', icon: <X className="w-4 h-4" /> },
    { key: 'Tab', description: 'Navigate between elements', icon: <ArrowRight className="w-4 h-4" /> },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                  {shortcut.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {shortcut.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded">
                    {shortcut.key}
                  </kbd>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> Use number keys 1-9 to quickly navigate to specific dates in the current month. 
              Press <kbd className="px-1 py-0.5 text-xs bg-blue-200 dark:bg-blue-800 rounded">Home</kbd> or <kbd className="px-1 py-0.5 text-xs bg-blue-200 dark:bg-blue-800 rounded">Ctrl + T</kbd> to go to today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 