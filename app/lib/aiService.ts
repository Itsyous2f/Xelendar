export interface ParsedEvent {
  title: string;
  description?: string;
  date: string; // ISO date string
  time?: string; // HH:MM format
  color?: string;
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    endDate?: string;
  };
}

export async function parseEventText(text: string): Promise<ParsedEvent> {
  try {
    const response = await fetch('/api/parse-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const parsedEvent = await response.json() as ParsedEvent;
    
    // Validate required fields
    if (!parsedEvent.title || !parsedEvent.date) {
      throw new Error('Missing required fields in AI response');
    }

    // Set defaults with blue color
    return {
      color: '#3B82F6', // Blue default
      recurrence: { type: 'none' },
      ...parsedEvent,
    };

  } catch (error) {
    console.error('Error parsing event text:', error);
    
    // Fallback: create a basic event with generated title and blue color
    const today = new Date().toISOString().split('T')[0];
    
    // Generate a simple title from the text
    const words = text.split(' ').filter(word => word.length > 0);
    const title = words.length > 0 
      ? words.slice(0, 3).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : 'Quick Event';
    
    return {
      title: title,
      description: `Quick added: ${text}`,
      date: today,
      time: undefined,
      color: '#3B82F6', // Blue default
      recurrence: { type: 'none', interval: 1, endDate: undefined }, // Never recurring
    };
  }
} 