-- Create messages table that's compatible with the existing chats table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  content TEXT,
  role TEXT,  -- This replaces sender to match the chat service implementation
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE
);

-- Set up RLS for messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access (for testing only)
CREATE POLICY "Public messages access" ON public.messages
  FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for messages table
BEGIN;
  -- Drop the publication if it exists already
  DROP PUBLICATION IF EXISTS supabase_realtime;

  -- Create a new publication for all tables
  CREATE PUBLICATION supabase_realtime FOR TABLE public.chats, public.messages;
COMMIT; 