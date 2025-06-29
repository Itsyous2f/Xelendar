'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Menu, X, Calendar as CalendarIcon, Clock, Bell, BellOff, LogOut } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import Calendar from './components/Calendar';
import TimelineView from './components/TimelineView';
import EventModal from './components/EventModal';
import EventSidebar, { EventSidebarRef } from './components/EventSidebar';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import ThemeToggle, { ThemeToggleRef } from './components/ThemeToggle';
import { Event } from './types/calendar';
import { generateRecurringEvents } from './utils/recurrence';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { supabase } from './lib/supabaseClient';
import { parseEventText } from './lib/aiService';
import AuthForm from './components/AuthForm';
import { notificationChecker } from './lib/notificationChecker';
import { notificationService } from './lib/notificationService';

type ViewType = 'calendar' | 'timeline';

export default function Home() {
  const [baseEvents, setBaseEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('calendar');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const themeToggleRef = useRef<ThemeToggleRef>(null);
  const eventSidebarRef = useRef<EventSidebarRef>(null);

  // Check auth state and load events
  useEffect(() => {
    const getUserAndEvents = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Load events for this user
          const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: true });
            
          if (error) {
            console.error('Load events error:', error);
            alert(`Failed to load events: ${error.message}`);
            return;
          }
          
          if (events) {
            // Convert database records to Event objects
            const convertedEvents = events.map((e: any) => ({
              id: e.id,
              title: e.title,
              description: e.description,
              date: new Date(e.date),
              time: e.time,
              color: e.color,
              recurrence: e.recurrence ? JSON.parse(e.recurrence) : undefined,
              isRecurring: e.is_recurring,
              originalEventId: e.original_event_id,
              notificationEnabled: e.notification_enabled ?? true,
              notificationTime: e.notification_time ?? 15,
              notificationSent: e.notification_sent ?? false,
            }));
            
            setBaseEvents(convertedEvents);
            
            // Initialize notification checker with events
            notificationChecker.setEvents(convertedEvents);
            
            // Start notification checker if notifications are supported
            if (notificationService.isSupported()) {
              notificationChecker.start();
              ('Notification checker started');
            }
            
            console.log('Loaded events:', convertedEvents);
          }
        }
      } catch (err) {
        console.error('Unexpected error loading events:', err);
        alert('An unexpected error occurred while loading events');
      } finally {
        setLoading(false);
      }
    };
    getUserAndEvents();
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getUserAndEvents();
      } else {
        setBaseEvents([]);
        notificationChecker.stop();
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
      notificationChecker.stop();
    };
  }, []);

  // Update notification permission state
  useEffect(() => {
    if (notificationService.isSupported()) {
      setNotificationPermission(notificationService.getPermission());
    }
  }, []);

  // Generate all recurring event instances for the next 6 months
  const allEvents = useMemo(() => {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const allInstances: Event[] = [];
    baseEvents.forEach(baseEvent => {
      if (baseEvent.recurrence && baseEvent.recurrence.type !== 'none') {
        const instances = generateRecurringEvents(baseEvent, startDate, endDate);
        allInstances.push(...instances);
      } else {
        allInstances.push(baseEvent);
      }
    });
    return allInstances;
  }, [baseEvents]);

  // Helper function to convert Date to YYYY-MM-DD string in local timezone
  const formatDateForDatabase = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Add event to Supabase
  const addEvent = async (event: Omit<Event, 'id'>) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }
    
    try {
      const payload = {
        title: event.title,
        description: event.description || null,
        date: event.date instanceof Date ? formatDateForDatabase(event.date) : event.date,
        time: event.time || null,
        color: event.color || '#3B82F6',
        recurrence: event.recurrence ? JSON.stringify(event.recurrence) : null,
        is_recurring: event.isRecurring || false,
        original_event_id: event.originalEventId || null,
        notification_enabled: event.notificationEnabled ?? true,
        notification_time: event.notificationTime ?? 15,
        notification_sent: false,
        user_id: user.id,
      };
      
      console.log('Current user:', user.id);
      console.log('Inserting event:', payload);
      
      const { data, error } = await supabase
        .from('events')
        .insert([payload])
        .select();
        
      if (error) {
        console.error('Add event error:', error);
        alert(`Failed to add event: ${error.message}`);
        return;
      }
      
      if (data && data[0]) {
        // Parse date string manually to avoid timezone issues
        let eventDate: Date;
        if (typeof data[0].date === 'string') {
          const [year, month, day] = data[0].date.split('-').map(Number);
          eventDate = new Date(year, month - 1, day, 12, 0, 0, 0);
        } else {
          eventDate = new Date(data[0].date);
        }
        
        const newEvent = {
          ...data[0],
          date: eventDate,
          recurrence: data[0].recurrence ? JSON.parse(data[0].recurrence) : undefined,
          notificationEnabled: data[0].notification_enabled,
          notificationTime: data[0].notification_time,
          notificationSent: data[0].notification_sent,
        };
        setBaseEvents(prev => [...prev, newEvent]);
        
        // Update notification checker with new events
        notificationChecker.setEvents([...baseEvents, newEvent]);
        
        console.log('Event added successfully:', newEvent);
      }
    } catch (err) {
      console.error('Unexpected error adding event:', err);
      alert('An unexpected error occurred while adding the event');
    }
    
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  // Update event in Supabase
  const updateEvent = async (eventId: string, eventData: Omit<Event, 'id'>) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }
    
    try {
      const payload = {
        title: eventData.title,
        description: eventData.description || null,
        date: eventData.date instanceof Date ? formatDateForDatabase(eventData.date) : eventData.date,
        time: eventData.time || null,
        color: eventData.color || '#3B82F6',
        recurrence: eventData.recurrence ? JSON.stringify(eventData.recurrence) : null,
        is_recurring: eventData.isRecurring || false,
        original_event_id: eventData.originalEventId || null,
        notification_enabled: eventData.notificationEnabled ?? true,
        notification_time: eventData.notificationTime ?? 15,
        notification_sent: false, // Reset notification sent when event is updated
      };
      
      console.log('Current user:', user.id);
      console.log('Updating event:', eventId, payload);
      
      const { data, error } = await supabase
        .from('events')
        .update(payload)
        .eq('id', eventId)
        .eq('user_id', user.id)
        .select();
        
      if (error) {
        console.error('Update event error:', error);
        alert(`Failed to update event: ${error.message}`);
        return;
      }
      
      if (data && data[0]) {
        // Parse date string manually to avoid timezone issues
        let eventDate: Date;
        if (typeof data[0].date === 'string') {
          const [year, month, day] = data[0].date.split('-').map(Number);
          eventDate = new Date(year, month - 1, day, 12, 0, 0, 0);
        } else {
          eventDate = new Date(data[0].date);
        }
        
        const updatedEvent = {
          ...data[0],
          date: eventDate,
          recurrence: data[0].recurrence ? JSON.parse(data[0].recurrence) : undefined,
          notificationEnabled: data[0].notification_enabled,
          notificationTime: data[0].notification_time,
          notificationSent: data[0].notification_sent,
        };
        setBaseEvents(prev => prev.map(event =>
          event.id === eventId ? updatedEvent : event
        ));
        
        // Update notification checker with updated events
        const updatedEvents = baseEvents.map(event =>
          event.id === eventId ? updatedEvent : event
        );
        notificationChecker.setEvents(updatedEvents);
        
        console.log('Event updated successfully:', updatedEvent);
      }
    } catch (err) {
      console.error('Unexpected error updating event:', err);
      alert('An unexpected error occurred while updating the event');
    }
    
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  // Delete event from Supabase
  const deleteEvent = async (eventId: string) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }
    
    try {
      console.log('Current user:', user.id);
      console.log('Deleting event:', eventId);
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Delete event error:', error);
        alert(`Failed to delete event: ${error.message}`);
        return;
      }
      
      setBaseEvents(prev => {
        const updatedEvents = prev.filter(event => event.id !== eventId);
        // Update notification checker with remaining events
        notificationChecker.setEvents(updatedEvents);
        return updatedEvents;
      });
      
      console.log('Event deleted successfully');
    } catch (err) {
      console.error('Unexpected error deleting event:', err);
      alert('An unexpected error occurred while deleting the event');
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    // For now, just scroll to the date in the calendar
    // You could expand this to highlight the event or open an edit modal
    setSelectedDate(event.date);
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  const handleEventEdit = (event: Event) => {
    // If editing a recurring instance, find the base event
    const baseEvent = baseEvents.find(e => e.id === event.originalEventId || e.id === event.id);
    if (baseEvent) {
      setEditingEvent(baseEvent);
      setSelectedDate(baseEvent.date);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  // Keyboard shortcuts handlers
  const handleShowShortcuts = () => {
    setIsShortcutsOpen(true);
  };

  const handleCreateEvent = () => {
    setSelectedDate(new Date());
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleSwitchToCalendar = () => {
    setCurrentView('calendar');
  };

  const handleSwitchToTimeline = () => {
    setCurrentView('timeline');
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePreviousPeriod = () => {
    if (currentView === 'calendar') {
      setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
    }
  };

  const handleNextPeriod = () => {
    if (currentView === 'calendar') {
      setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
    }
  };

  const handleGoToToday = () => {
    setCurrentCalendarDate(new Date());
    setSelectedDate(new Date());
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setCurrentCalendarDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setIsModalOpen(true);
  };

  const handleToggleTheme = () => {
    themeToggleRef.current?.toggleTheme();
  };

  const handleRequestNotificationPermission = async () => {
    if (notificationService.isSupported()) {
      const granted = await notificationService.requestPermission();
      setNotificationPermission(notificationService.getPermission());
      
      if (granted) {
        toast.success('Notifications enabled! You\'ll receive reminders for your events.');
      } else {
        toast.error('Notification permission denied. You can enable it in your browser settings.');
      }
    } else {
      toast.error('Notifications are not supported in this browser.');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const handleQuickAdd = async (text: string, selectedDate?: string) => {
    try {
      let parsedEvent;
      
      if (selectedDate) {
        // If a date is provided, create a simple event without AI parsing
        // Create date at noon in local timezone to avoid timezone issues
        const [year, month, day] = selectedDate.split('-').map(Number);
        const localDate = new Date(year, month - 1, day, 12, 0, 0, 0);
        
        parsedEvent = {
          title: text,
          description: `Quick added: ${text}`,
          date: localDate,
          time: null,
          color: '#3B82F6',
          recurrence: { type: 'none', interval: 1, endDate: null }
        };
      } else {
        // Use AI to parse the event text
        parsedEvent = await parseEventText(text);
      }
      
      // Convert the parsed event to our Event format
      let eventDate: Date;
      if (parsedEvent.date instanceof Date) {
        eventDate = parsedEvent.date;
      } else if (typeof parsedEvent.date === 'string') {
        // Parse date string manually to avoid timezone issues
        const [year, month, day] = parsedEvent.date.split('-').map(Number);
        eventDate = new Date(year, month - 1, day, 12, 0, 0, 0);
      } else {
        // Fallback to today
        const today = new Date();
        today.setHours(12, 0, 0, 0);
        eventDate = today;
      }
      
      const newEvent: Omit<Event, 'id'> = {
        title: parsedEvent.title,
        description: parsedEvent.description,
        date: eventDate,
        time: parsedEvent.time || null,
        color: parsedEvent.color || '#3B82F6',
        recurrence: parsedEvent.recurrence,
        isRecurring: parsedEvent.recurrence?.type !== 'none',
        originalEventId: null,
      };
      
      await addEvent(newEvent);
    } catch (error) {
      console.error('Error processing quick add:', error);
      // Fallback to basic event creation
      const today = new Date();
      today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      
      let fallbackDate = today;
      if (selectedDate) {
        // Create date at noon in local timezone
        const [year, month, day] = selectedDate.split('-').map(Number);
        fallbackDate = new Date(year, month - 1, day, 12, 0, 0, 0);
      }
      
      const fallbackEvent: Omit<Event, 'id'> = {
        title: text,
        description: `Quick added: ${text}`,
        date: fallbackDate,
        time: null,
        color: '#3B82F6',
        recurrence: undefined,
        isRecurring: false,
        originalEventId: null,
      };
      
      await addEvent(fallbackEvent);
    }
  };

  const handleFocusQuickAdd = () => {
    eventSidebarRef.current?.focusQuickAdd();
  };

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onShowShortcuts: handleShowShortcuts,
    onCreateEvent: handleCreateEvent,
    onSwitchToCalendar: handleSwitchToCalendar,
    onSwitchToTimeline: handleSwitchToTimeline,
    onToggleSidebar: handleToggleSidebar,
    onPreviousPeriod: handlePreviousPeriod,
    onNextPeriod: handleNextPeriod,
    onGoToToday: handleGoToToday,
    onToggleTheme: handleToggleTheme,
    onCloseModal: handleCloseModal,
    onSelectDate: handleSelectDate,
    currentCalendarDate,
    isModalOpen,
    isShortcutsOpen,
    onFocusQuickAdd: handleFocusQuickAdd,
  });

  const viewConfigs = [
    { key: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { key: 'timeline', label: 'Timeline', icon: Clock },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'calendar':
        return (
          <Calendar 
            events={allEvents}
            onDateClick={handleDateClick}
            onEventDelete={deleteEvent}
            currentDate={currentCalendarDate}
            onPreviousMonth={handlePreviousPeriod}
            onNextMonth={handleNextPeriod}
          />
        );
      case 'timeline':
        return (
          <TimelineView
            events={baseEvents}
            onEventDelete={deleteEvent}
            onEventEdit={handleEventEdit}
            onEventClick={handleEventClick}
          />
        );
      default:
        return null;
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Show AuthForm if not signed in
  if (!user) {
    return <AuthForm onAuth={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Xelendar
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your personal calendar companion
                  </p>
                </div>
              </div>
              
              {/* View Switcher */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {viewConfigs.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setCurrentView(key as ViewType)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        currentView === key
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden md:inline">{label}</span>
                    </button>
                  ))}
                </div>
                
                {/* Event Count Badge */}
                <div className="ml-4 text-sm text-gray-600 dark:text-gray-300">
                  {baseEvents.length} event{baseEvents.length !== 1 ? 's' : ''} ({allEvents.length} instances)
                </div>
                
                {/* Keyboard Shortcuts Indicator */}
                <div className="ml-4 text-xs text-gray-500 dark:text-gray-400">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                    Alt + K
                  </kbd>
                  <span className="ml-1">shortcuts</span>
                </div>
                
                {/* Theme Toggle */}
                <div className="ml-4">
                  <ThemeToggle ref={themeToggleRef} />
                </div>
                
                {/* Notification Permission Button */}
                {notificationService.isSupported() && notificationPermission !== 'granted' && (
                  <div className="ml-4">
                    <button
                      onClick={handleRequestNotificationPermission}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      title="Enable notifications"
                    >
                      {notificationPermission === 'denied' ? (
                        <BellOff className="w-4 h-4 text-red-500" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                      <span className="hidden md:inline">
                        {notificationPermission === 'denied' ? 'Notifications blocked' : 'Enable notifications'}
                      </span>
                    </button>
                  </div>
                )}
                
                {/* Notification Status Indicator */}
                {notificationService.isSupported() && notificationPermission === 'granted' && (
                  <div className="ml-4">
                    <div className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                      <Bell className="w-4 h-4" />
                      <span className="hidden md:inline">Notifications enabled</span>
                    </div>
                  </div>
                )}
                
                {/* Logout Button */}
                <div className="ml-4">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Content Container */}
          <div className={`flex-1 ${currentView === 'calendar' ? 'p-2' : 'p-4 lg:p-8'} overflow-hidden`}>
            <div className={`h-full ${currentView === 'calendar' ? 'overflow-hidden' : 'overflow-auto'}`}>
              {renderCurrentView()}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`
          fixed lg:relative inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <EventSidebar
            ref={eventSidebarRef}
            events={allEvents}
            onEventDelete={deleteEvent}
            onEventClick={handleEventClick}
            onEventEdit={handleEventEdit}
            onQuickAdd={handleQuickAdd}
          />
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
      
      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddEvent={addEvent}
        onUpdateEvent={updateEvent}
        selectedDate={selectedDate}
        editingEvent={editingEvent}
      />
      
      <KeyboardShortcuts
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
      
      <Toaster 
        position="top-right"
        richColors
        closeButton
      />
    </div>
  );
}
