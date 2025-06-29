import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onShowShortcuts: () => void;
  onCreateEvent: () => void;
  onSwitchToCalendar: () => void;
  onSwitchToTimeline: () => void;
  onToggleSidebar: () => void;
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  onGoToToday: () => void;
  onToggleTheme?: () => void;
  onCloseModal?: () => void;
  onDeleteSelectedEvent?: () => void;
  onSelectDate?: (date: Date) => void;
  onFocusQuickAdd?: () => void;
  currentCalendarDate?: Date;
  isModalOpen: boolean;
  isShortcutsOpen: boolean;
}

export function useKeyboardShortcuts({
  onShowShortcuts,
  onCreateEvent,
  onSwitchToCalendar,
  onSwitchToTimeline,
  onToggleSidebar,
  onPreviousPeriod,
  onNextPeriod,
  onGoToToday,
  onToggleTheme,
  onCloseModal,
  onDeleteSelectedEvent,
  onSelectDate,
  onFocusQuickAdd,
  currentCalendarDate,
  isModalOpen,
  isShortcutsOpen,
}: KeyboardShortcutsProps) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, altKey, ctrlKey, metaKey, shiftKey } = event;

    // Escape key - always handle this first
    if (key === 'Escape') {
      event.preventDefault();
      if (isShortcutsOpen) {
        onShowShortcuts(); // This will close the shortcuts modal
      } else if (isModalOpen && onCloseModal) {
        onCloseModal();
      }
      return;
    }

    // Don't handle other shortcuts if a modal is open (except for shortcuts modal)
    if (isModalOpen && !isShortcutsOpen) return;
    
    // Don't handle shortcuts if shortcuts modal is open
    if (isShortcutsOpen) return;

    // Alt + K: Show keyboard shortcuts
    if (altKey && key.toLowerCase() === 'k') {
      event.preventDefault();
      onShowShortcuts();
      return;
    }

    // Alt + N: Create new event
    if (altKey && key.toLowerCase() === 'n') {
      event.preventDefault();
      onCreateEvent();
      return;
    }

    // Alt + C: Switch to calendar view
    if (altKey && key.toLowerCase() === 'c') {
      event.preventDefault();
      onSwitchToCalendar();
      return;
    }

    // Alt + T: Switch to timeline view
    if (altKey && key.toLowerCase() === 't') {
      event.preventDefault();
      onSwitchToTimeline();
      return;
    }

    // Alt + S: Toggle sidebar
    if (altKey && key.toLowerCase() === 's') {
      event.preventDefault();
      onToggleSidebar();
      return;
    }

    // Alt + D: Toggle theme
    if (altKey && key.toLowerCase() === 'd') {
      event.preventDefault();
      onToggleTheme?.();
      return;
    }

    // Q: Focus quick add input
    if (key.toLowerCase() === 'q' && !isInputField(event.target)) {
      event.preventDefault();
      onFocusQuickAdd?.();
      return;
    }

    // Arrow keys for navigation (only when not in input fields)
    if ((key === 'ArrowLeft' || key === 'ArrowRight') && !isInputField(event.target)) {
      event.preventDefault();
      if (key === 'ArrowLeft') {
        onPreviousPeriod();
      } else {
        onNextPeriod();
      }
      return;
    }

    // Today navigation (Home key or Ctrl+T)
    if ((key === 'Home' || (ctrlKey && key.toLowerCase() === 't')) && !isInputField(event.target)) {
      event.preventDefault();
      onGoToToday();
      return;
    }

    // Delete key for deleting events (only when not in input fields)
    if (key === 'Delete' && onDeleteSelectedEvent && !isInputField(event.target)) {
      event.preventDefault();
      onDeleteSelectedEvent();
      return;
    }

    // Number keys 1-9 for quick date navigation (only when not in input fields)
    if (/^[1-9]$/.test(key) && onSelectDate && !isInputField(event.target)) {
      event.preventDefault();
      const dayNumber = parseInt(key);
      const baseDate = currentCalendarDate || new Date();
      const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), dayNumber);
      onSelectDate(targetDate);
      return;
    }

    // Space key for creating event on today's date
    if (key === ' ' && !isInputField(event.target)) {
      event.preventDefault();
      onCreateEvent();
      return;
    }
  }, [
    isModalOpen,
    isShortcutsOpen,
    currentCalendarDate,
    onShowShortcuts,
    onCreateEvent,
    onSwitchToCalendar,
    onSwitchToTimeline,
    onToggleSidebar,
    onToggleTheme,
    onCloseModal,
    onPreviousPeriod,
    onNextPeriod,
    onGoToToday,
    onDeleteSelectedEvent,
    onSelectDate,
    onFocusQuickAdd,
  ]);

  // Helper function to check if the target is an input field
  const isInputField = (target: EventTarget | null): boolean => {
    if (!target) return false;
    const element = target as HTMLElement;
    return element.tagName === 'INPUT' || 
           element.tagName === 'TEXTAREA' || 
           element.contentEditable === 'true' ||
           element.closest('[contenteditable="true"]') !== null;
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
} 