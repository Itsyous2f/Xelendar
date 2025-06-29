import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq client on the server side
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Use server-side environment variable
});

export async function POST(request: NextRequest) {
  // Check if Groq API key is configured
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not configured');
    return NextResponse.json(
      { error: 'AI service is not configured' },
      { status: 500 }
    );
  }

  // Helper function to get next occurrence of a day
  const getNextDayOfWeek = (dayName: string) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayName.toLowerCase());
    if (targetDay === -1) return null;
    
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + daysUntilTarget);
    return nextDate.toISOString().split('T')[0];
  };

  // Helper function to get this week's occurrence of a day
  const getThisWeekDay = (dayName: string) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayName.toLowerCase());
    if (targetDay === -1) return null;
    
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    const targetDate = new Date(currentDate);
    targetDate.setDate(currentDate.getDate() + daysUntilTarget);
    return targetDate.toISOString().split('T')[0];
  };

  // Helper function to parse date patterns server-side
  const parseDatePattern = (text: string) => {
    const lowerText = text.toLowerCase();
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Check for "today"
    if (lowerText.includes('today')) {
      return currentDate.toISOString().split('T')[0];
    }
    
    // Check for "next [day]" patterns
    const nextDayMatch = lowerText.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
    if (nextDayMatch) {
      const dayName = nextDayMatch[1];
      return getNextDayOfWeek(dayName);
    }
    
    // Check for "on [day]" patterns - this should be this week's occurrence
    const onDayMatch = lowerText.match(/on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
    if (onDayMatch) {
      const dayName = onDayMatch[1];
      return getThisWeekDay(dayName);
    }
    
    // Check for "this [day]" patterns
    const thisDayMatch = lowerText.match(/this\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
    if (thisDayMatch) {
      const dayName = thisDayMatch[1];
      return getThisWeekDay(dayName);
    }
    
    // Check for "tomorrow"
    if (lowerText.includes('tomorrow')) {
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    
    // Check for "next week"
    if (lowerText.includes('next week')) {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    }
    
    // Check for "in X days"
    const daysMatch = lowerText.match(/in\s+(\d+)\s+days?/);
    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      const futureDate = new Date(currentDate);
      futureDate.setDate(futureDate.getDate() + days);
      return futureDate.toISOString().split('T')[0];
    }
    
    // Check for specific month and day patterns like "June 30", "Dec 25", etc.
    const monthDayMatch = lowerText.match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})/);
    if (monthDayMatch) {
      const monthName = monthDayMatch[1];
      const day = parseInt(monthDayMatch[2]);
      
      // Map month names to numbers
      const monthMap: { [key: string]: number } = {
        'january': 0, 'jan': 0,
        'february': 1, 'feb': 1,
        'march': 2, 'mar': 2,
        'april': 3, 'apr': 3,
        'may': 4,
        'june': 5, 'jun': 5,
        'july': 6, 'jul': 6,
        'august': 7, 'aug': 7,
        'september': 8, 'sep': 8,
        'october': 9, 'oct': 9,
        'november': 10, 'nov': 10,
        'december': 11, 'dec': 11
      };
      
      const month = monthMap[monthName];
      if (month !== undefined && day >= 1 && day <= 31) {
        // Try current year first
        let targetDate = new Date(currentYear, month, day);
        
        // If the date has already passed this year, use next year
        if (targetDate < currentDate) {
          targetDate = new Date(currentYear + 1, month, day);
        }
        
        return targetDate.toISOString().split('T')[0];
      }
    }
    
    // Check for "on [month] [day]" patterns
    const onMonthDayMatch = lowerText.match(/on\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})/);
    if (onMonthDayMatch) {
      const monthName = onMonthDayMatch[1];
      const day = parseInt(onMonthDayMatch[2]);
      
      const monthMap: { [key: string]: number } = {
        'january': 0, 'jan': 0,
        'february': 1, 'feb': 1,
        'march': 2, 'mar': 2,
        'april': 3, 'apr': 3,
        'may': 4,
        'june': 5, 'jun': 5,
        'july': 6, 'jul': 6,
        'august': 7, 'aug': 7,
        'september': 8, 'sep': 8,
        'october': 9, 'oct': 9,
        'november': 10, 'nov': 10,
        'december': 11, 'dec': 11
      };
      
      const month = monthMap[monthName];
      if (month !== undefined && day >= 1 && day <= 31) {
        let targetDate = new Date(currentYear, month, day);
        
        if (targetDate < currentDate) {
          targetDate = new Date(currentYear + 1, month, day);
        }
        
        return targetDate.toISOString().split('T')[0];
      }
    }
    
    return null; // Let AI handle other date patterns
  };

  // Extract text from request body first
  let text: string;
  try {
    const body = await request.json();
    text = body.text;
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  if (!text || typeof text !== 'string') {
    return NextResponse.json(
      { error: 'Text is required' },
      { status: 400 }
    );
  }

  try {
    // Get current date for context
    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const currentDayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Calculate this week's dates for better context
    const getThisWeekDates = () => {
      const dates = [];
      const currentDay = currentDate.getDay();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDay);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = date.toISOString().split('T')[0];
        dates.push(`${dayName}: ${dateStr}`);
      }
      return dates;
    };
    
    const thisWeekDates = getThisWeekDates();
    
    const prompt = `
You are an AI assistant that helps users create calendar events from natural language descriptions. 
Parse the following text and extract event details. Return a JSON object with the following structure:

{
  "title": "Event title (required - generate a concise, descriptive title)",
  "description": "Optional description (can include the original text)",
  "date": "YYYY-MM-DD (required, use today if no date specified)",
  "time": "HH:MM (optional, 24-hour format)",
  "color": "hex color code (required, default to #3B82F6 for blue)",
  "recurrence": {
    "type": "none",
    "interval": 1,
    "endDate": null
  }
}

RULES:
- NEVER create recurring events. Always set recurrence.type to "none"
- Generate a concise, descriptive title (don't just repeat the input text)
- If no date is mentioned, use today's date
- If no time is mentioned, set time to null
- Always set color to "#3B82F6" (blue)
- Make titles professional and calendar-friendly
- IMPORTANT: "today" means ${currentDateStr} (the current date)
- IMPORTANT: When someone says "on [day]" (like "on monday"), they mean THIS WEEK's [day], not next week
- "next [day]" means the [day] of next week
- "this [day]" means the [day] of this week

CURRENT DATE CONTEXT:
Today is ${currentDayName}, ${currentDateStr} (${currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })})

THIS WEEK'S DATES:
${thisWeekDates.join('\n')}

Examples:
- "math test today at 2pm" → {"title": "Math Test", "date": "${currentDateStr}", "time": "14:00", "color": "#3B82F6", "recurrence": {"type": "none", "interval": 1, "endDate": null}}
- "meeting with john next monday at 5pm" → {"title": "Meeting with John", "date": "2024-07-08", "time": "17:00", "color": "#3B82F6", "recurrence": {"type": "none", "interval": 1, "endDate": null}}
- "dentist appointment tomorrow at 2pm" → {"title": "Dentist Appointment", "date": "2024-07-01", "time": "14:00", "color": "#3B82F6", "recurrence": {"type": "none", "interval": 1, "endDate": null}}
- "team standup on friday" → {"title": "Team Standup", "date": "2024-07-05", "time": null, "color": "#3B82F6", "recurrence": {"type": "none", "interval": 1, "endDate": null}}
- "social studies test on monday" → {"title": "Social Studies Test", "date": "2024-07-01", "time": null, "color": "#3B82F6", "recurrence": {"type": "none", "interval": 1, "endDate": null}}
- "birthday party on june 30" → {"title": "Birthday Party", "date": "2024-06-30", "time": null, "color": "#3B82F6", "recurrence": {"type": "none", "interval": 1, "endDate": null}}

Text to parse: "${text}"

Return only the JSON object, no additional text or explanation.
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from AI');
    }

    console.log('AI Response:', response);

    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const parsedEvent = JSON.parse(jsonMatch[0]);
    
    console.log('Parsed Event:', parsedEvent);
    
    // Validate required fields
    if (!parsedEvent.title || !parsedEvent.date) {
      throw new Error('Missing required fields in AI response');
    }

    // Set defaults
    const result = {
      color: '#3B82F6',
      recurrence: { type: 'none', interval: 1, endDate: null },
      ...parsedEvent,
    };

    console.log('Final result:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error parsing event text:', error);
    
    // Return fallback response with better title generation
    const today = new Date().toISOString().split('T')[0];
    
    // Generate a simple title from the text
    const words = text.split(' ').filter(word => word.length > 0);
    const title = words.length > 0 
      ? words.slice(0, 3).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : 'Quick Event';
    
    return NextResponse.json({
      title: title,
      description: `Quick added: ${text}`,
      date: today,
      time: undefined,
      color: '#3B82F6', // Blue default
      recurrence: { type: 'none', interval: 1, endDate: undefined }, // Never recurring
    });
  }
} 