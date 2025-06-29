-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    color TEXT DEFAULT '#3B82F6',
    recurrence JSONB,
    is_recurring BOOLEAN DEFAULT FALSE,
    original_event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    notification_enabled BOOLEAN DEFAULT TRUE,
    notification_time INTEGER DEFAULT 15, -- minutes before event
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add notification columns to existing table (if table already exists)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS notification_time INTEGER DEFAULT 15;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_original_event_id ON public.events(original_event_id);

-- Enable Row Level Security on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own events
CREATE POLICY "Users can view own events" ON public.events
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own events
CREATE POLICY "Users can insert own events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own events
CREATE POLICY "Users can update own events" ON public.events
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own events
CREATE POLICY "Users can delete own events" ON public.events
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON public.events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.events TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; 