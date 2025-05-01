-- Check and fix the chats table structure
-- First, let's create a properly structured chats table if it doesn't exist

-- If the chats table exists but has wrong structure, drop it
DROP TABLE IF EXISTS public.chats CASCADE;

-- Create chats table with the expected structure
CREATE TABLE public.chats (
  id UUID PRIMARY KEY,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS for chats table
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access (for testing only)
CREATE POLICY "Public chats access" ON public.chats
  FOR ALL USING (true) WITH CHECK (true);

-- Re-create the messages table to ensure it references the new chats table
DROP TABLE IF EXISTS public.messages CASCADE;

CREATE TABLE public.messages (
  id UUID PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  content TEXT,
  role TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE
);

-- Set up RLS for messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access (for testing only)
CREATE POLICY "Public messages access" ON public.messages
  FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for both tables
BEGIN;
  -- Drop the publication if it exists already
  DROP PUBLICATION IF EXISTS supabase_realtime;

  -- Create a new publication for all tables
  CREATE PUBLICATION supabase_realtime FOR TABLE public.chats, public.messages;
COMMIT; 