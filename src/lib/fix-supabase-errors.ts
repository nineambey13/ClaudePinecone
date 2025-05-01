import { createClient } from '@supabase/supabase-js';

/**
 * Create required tables in Supabase if they don't exist
 */
export async function createRequiredTables(supabaseUrl: string, supabaseKey: string) {
  console.log('🔧 Creating required tables...');
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Check if tables exist by attempting to select from them
    const { error: chatsError } = await supabase
      .from('chats')
      .select('count')
      .limit(1);
    
    const { error: messagesError } = await supabase
      .from('messages')
      .select('count')
      .limit(1);
    
    // Use the REST API to create tables if they don't exist
    // Note: This requires admin privileges, which the anon key doesn't have
    // This is for reference only and would need to be run in a secure environment
    
    console.log('⚠️ Important: Table creation requires admin privileges');
    console.log('Please run the following SQL in the Supabase SQL Editor:');
    console.log('');
    
    if (chatsError && chatsError.code === '42P01') {
      console.log('-- Create chats table');
      console.log(`
CREATE TABLE IF NOT EXISTS public.chats (
  id TEXT PRIMARY KEY,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS for chats table
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access (for testing only)
CREATE POLICY "Public chats access" ON public.chats
  FOR ALL USING (true) WITH CHECK (true);
`);
    } else {
      console.log('✅ Chats table already exists');
    }
    
    if (messagesError && messagesError.code === '42P01') {
      console.log('-- Create messages table');
      console.log(`
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT REFERENCES public.chats(id) ON DELETE CASCADE,
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
`);
    } else {
      console.log('✅ Messages table already exists');
    }
    
    return {
      success: true,
      message: 'Table creation SQL generated'
    };
  } catch (error) {
    console.error('❌ Error checking/creating tables:', error);
    return {
      success: false,
      message: 'Failed to generate table creation SQL',
      error
    };
  }
}

/**
 * Fix RLS policies to allow anonymous access
 * This is for testing only - production systems should use proper authentication
 */
export async function fixRLSPolicies(supabaseUrl: string, supabaseKey: string) {
  console.log('🔧 Generating SQL to fix RLS policies...');
  
  console.log('⚠️ Important: RLS policy changes require admin privileges');
  console.log('Please run the following SQL in the Supabase SQL Editor:');
  console.log('');
  
  console.log(`
-- Enable RLS on tables
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public chats access" ON public.chats;
DROP POLICY IF EXISTS "Public messages access" ON public.messages;

-- Create new permissive policies for testing
CREATE POLICY "Public chats access" ON public.chats
  FOR ALL USING (true) WITH CHECK (true);
  
CREATE POLICY "Public messages access" ON public.messages
  FOR ALL USING (true) WITH CHECK (true);
`);
  
  return {
    success: true,
    message: 'RLS policy fix SQL generated'
  };
}

/**
 * Enable realtime for the relevant tables
 */
export async function enableRealtime(supabaseUrl: string, supabaseKey: string) {
  console.log('🔧 Generating SQL to enable realtime...');
  
  console.log('⚠️ Important: Realtime configuration requires admin privileges');
  console.log('Please run the following SQL in the Supabase SQL Editor:');
  console.log('');
  
  console.log(`
-- Enable realtime for chats and messages tables
BEGIN;
  -- Drop the publication if it exists already
  DROP PUBLICATION IF EXISTS supabase_realtime;

  -- Create a new publication for all tables
  CREATE PUBLICATION supabase_realtime FOR TABLE public.chats, public.messages;
COMMIT;
`);
  
  console.log('');
  console.log('Additionally, make sure realtime is enabled in your Supabase project settings:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to Database → Replication');
  console.log('3. Ensure that the "Realtime" option is enabled');
  
  return {
    success: true,
    message: 'Realtime configuration SQL generated'
  };
}

/**
 * Check if the client is correctly configured to use Supabase
 */
export function checkClientConfiguration() {
  console.log('🔍 Checking client configuration...');
  
  // Check for environment variables
  const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;
  const hasSupabaseKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.error('❌ Missing environment variables');
    console.log('');
    console.log('Please create or update your .env file with:');
    console.log('VITE_SUPABASE_URL=your_supabase_url');
    console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
    console.log('');
    console.log('You can find these values in your Supabase project settings under API settings.');
    
    return {
      success: false,
      message: 'Missing environment variables'
    };
  }
  
  console.log('✅ Environment variables found');
  
  // Additional client setup suggestions
  console.log('');
  console.log('Make sure your Supabase client is initialized correctly:');
  console.log(`
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
`);
  
  return {
    success: true,
    message: 'Client configuration appears correct'
  };
}

/**
 * Generate code for proper Supabase chat synchronization
 */
export function generateSyncImplementation() {
  console.log('🔧 Generating sample code for proper chat synchronization...');
  
  console.log(`
// ----- Chat Context Implementation -----

// 1. Initialize Supabase client and subscriptions in your ChatProvider
useEffect(() => {
  // Load existing chats from Supabase
  const loadChats = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setChats(data);
        // If there are chats and none is selected, select the first one
        if (data.length > 0 && !currentChatId) {
          setCurrentChatId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  loadChats();
  
  // Set up realtime subscriptions
  const chatsSubscription = supabase
    .channel('public:chats')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'chats' }, 
      (payload) => {
        console.log('Chats change received:', payload);
        
        // Handle different event types
        if (payload.eventType === 'INSERT') {
          setChats(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setChats(prev => 
            prev.map(chat => chat.id === payload.new.id ? payload.new : chat)
          );
        } else if (payload.eventType === 'DELETE') {
          setChats(prev => prev.filter(chat => chat.id !== payload.old.id));
          // If the current chat was deleted, select another one
          if (currentChatId === payload.old.id) {
            const remainingChats = chats.filter(chat => chat.id !== payload.old.id);
            setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
          }
        }
      }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(chatsSubscription);
  };
}, []);

// 2. Set up subscription for messages when currentChatId changes
useEffect(() => {
  if (!currentChatId) return;
  
  // Load messages for the current chat
  const loadMessages = async () => {
    setIsLoadingMessages(true);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', currentChatId)
        .order('timestamp', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };
  
  loadMessages();
  
  // Set up realtime subscription for messages
  const messagesSubscription = supabase
    .channel(\`messages:\${currentChatId}\`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'messages',
        filter: \`chat_id=eq.\${currentChatId}\`
      }, 
      (payload) => {
        console.log('Messages change received:', payload);
        
        // Handle different event types
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => 
            prev.map(message => message.id === payload.new.id ? payload.new : message)
          );
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => 
            prev.filter(message => message.id !== payload.old.id)
          );
        }
      }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(messagesSubscription);
  };
}, [currentChatId]);

// 3. Implement proper message sending with Supabase
const sendMessage = async (content: string) => {
  if (!currentChatId || !content.trim()) return;
  
  const newMessageId = \`msg_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  
  // Optimistic UI update
  const newUserMessage = {
    id: newMessageId,
    chat_id: currentChatId,
    content,
    role: 'user',
    timestamp: new Date().toISOString(),
    is_edited: false
  };
  
  // Add user message to UI immediately
  setMessages(prev => [...prev, newUserMessage]);
  
  try {
    // Save user message to Supabase
    const { error: insertError } = await supabase
      .from('messages')
      .insert([newUserMessage]);
      
    if (insertError) throw insertError;
    
    // Generate AI response
    const aiMessageId = \`msg_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
    const aiMessagePlaceholder = {
      id: aiMessageId,
      chat_id: currentChatId,
      content: '',
      role: 'assistant',
      timestamp: new Date().toISOString(),
      is_edited: false
    };
    
    // Add AI message placeholder to UI
    setMessages(prev => [...prev, aiMessagePlaceholder]);
    
    // Simulate AI response generation (replace with your actual AI implementation)
    const aiResponse = await generateAIResponse(content);
    
    // Update AI message with response
    const updatedAiMessage = {
      ...aiMessagePlaceholder,
      content: aiResponse
    };
    
    // Save AI message to Supabase
    const { error: aiInsertError } = await supabase
      .from('messages')
      .insert([updatedAiMessage]);
      
    if (aiInsertError) throw aiInsertError;
    
  } catch (error) {
    console.error('Error sending message:', error);
    // Handle error (e.g., show error message, retry logic)
  }
};

// 4. Implement proper chat creation with Supabase
const createNewChat = async (title = 'New Chat') => {
  const newChatId = \`chat_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  
  try {
    const { error } = await supabase
      .from('chats')
      .insert([{
        id: newChatId,
        title,
        created_at: new Date().toISOString()
      }]);
      
    if (error) throw error;
    
    // The chat will be added via the realtime subscription
    // And currentChatId will be updated there
  } catch (error) {
    console.error('Error creating chat:', error);
    // Handle error
  }
};
`);
  
  return {
    success: true,
    message: 'Sample synchronization code generated'
  };
}

/**
 * Run all available fixes
 */
export async function runAllFixes(supabaseUrl: string, supabaseKey: string) {
  console.log('🔧 Running all available fixes...');
  
  const results = {
    clientConfig: await checkClientConfiguration(),
    tables: await createRequiredTables(supabaseUrl, supabaseKey),
    rls: await fixRLSPolicies(supabaseUrl, supabaseKey),
    realtime: await enableRealtime(supabaseUrl, supabaseKey),
    syncCode: await generateSyncImplementation()
  };
  
  console.log('');
  console.log('📊 Fix Summary:');
  console.log(`Client Configuration: ${results.clientConfig.success ? '✅' : '❌'}`);
  console.log(`Table Creation: ${results.tables.success ? '✅' : '❌'}`);
  console.log(`RLS Policies: ${results.rls.success ? '✅' : '❌'}`);
  console.log(`Realtime: ${results.realtime.success ? '✅' : '❌'}`);
  console.log(`Sync Implementation: ${results.syncCode.success ? '✅' : '❌'}`);
  
  return results;
} 