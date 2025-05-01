import { createClient } from '@supabase/supabase-js';

/**
 * Run diagnostics tests on your Supabase configuration
 * 
 * Tests:
 * 1. Availability of Supabase credentials
 * 2. Successful connection to Supabase
 * 3. Access to 'chats' table
 * 4. Access to 'messages' table
 * 5. Row Level Security (RLS) policies by attempting to insert and delete a test chat
 * 6. Realtime functionality by subscribing to changes
 * 
 * @param supabaseUrl Optional custom Supabase URL to use
 * @param supabaseKey Optional custom Supabase anon key to use
 * @returns Object containing test results and overall status
 */
export async function runSupabaseDiagnostics(
  supabaseUrl?: string,
  supabaseKey?: string
) {
  console.log('🔍 Starting Supabase diagnostics...');
  
  const results = {
    credentialsPresent: false,
    connectionSuccessful: false,
    chatsTableAccessible: false,
    messagesTableAccessible: false,
    rlsPoliciesCorrect: false,
    realtimeWorking: false,
    logs: [] as string[],
    overallStatus: 'failed' as 'passed' | 'failed' | 'partial'
  };
  
  // Log function to track results
  const log = (message: string) => {
    console.log(message);
    results.logs.push(message);
  };
  
  // 1. Check for Supabase credentials
  if (!supabaseUrl) {
    supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  }
  
  if (!supabaseKey) {
    supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
  
  if (!supabaseUrl || !supabaseKey) {
    log('❌ No Supabase credentials found in environment variables.');
    log('Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
    log('You can find these in your Supabase project settings under API.');
    return results;
  }
  
  results.credentialsPresent = true;
  log('✅ Supabase credentials found.');
  
  // 2. Test connection to Supabase
  let supabase;
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      log(`❌ Failed to connect to Supabase: ${error.message}`);
      return results;
    }
    
    results.connectionSuccessful = true;
    log('✅ Successfully connected to Supabase.');
  } catch (error) {
    log(`❌ Error connecting to Supabase: ${(error as Error).message}`);
    return results;
  }
  
  // 3. Check access to chats table
  try {
    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select('count')
      .limit(1)
      .single();
    
    if (chatsError) {
      log(`❌ Couldn't access 'chats' table: ${chatsError.message}`);
      log('Make sure the "chats" table exists with the correct schema:');
      log(`
CREATE TABLE IF NOT EXISTS public.chats (
  id TEXT PRIMARY KEY,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public chats access" ON public.chats FOR ALL USING (true) WITH CHECK (true);
      `);
    } else {
      results.chatsTableAccessible = true;
      log('✅ Successfully accessed "chats" table.');
    }
  } catch (error) {
    log(`❌ Error accessing 'chats' table: ${(error as Error).message}`);
  }
  
  // 4. Check access to messages table
  try {
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('count')
      .limit(1)
      .single();
    
    if (messagesError) {
      log(`❌ Couldn't access 'messages' table: ${messagesError.message}`);
      log('Make sure the "messages" table exists with the correct schema:');
      log(`
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT REFERENCES public.chats(id) ON DELETE CASCADE,
  content TEXT,
  role TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public messages access" ON public.messages FOR ALL USING (true) WITH CHECK (true);
      `);
    } else {
      results.messagesTableAccessible = true;
      log('✅ Successfully accessed "messages" table.');
    }
  } catch (error) {
    log(`❌ Error accessing 'messages' table: ${(error as Error).message}`);
  }
  
  // 5. Test RLS policies by inserting and deleting a test chat
  try {
    const testId = `test-${Date.now()}`;
    
    // Try to insert
    const { data: insertData, error: insertError } = await supabase
      .from('chats')
      .insert({
        id: testId,
        title: 'Diagnostics Test'
      })
      .select()
      .single();
    
    if (insertError) {
      log(`❌ Failed to insert test chat: ${insertError.message}`);
      log('This might indicate an issue with your RLS policies.');
      log('Make sure you have the following RLS policy for the chats table:');
      log('CREATE POLICY "Public chats access" ON public.chats FOR ALL USING (true) WITH CHECK (true);');
    } else {
      log('✅ Successfully inserted test chat.');
      
      // Try to delete
      const { error: deleteError } = await supabase
        .from('chats')
        .delete()
        .eq('id', testId);
      
      if (deleteError) {
        log(`❌ Failed to delete test chat: ${deleteError.message}`);
        log('This might indicate an issue with your RLS policies.');
      } else {
        results.rlsPoliciesCorrect = true;
        log('✅ Successfully deleted test chat. RLS policies appear to be correct.');
      }
    }
  } catch (error) {
    log(`❌ Error testing RLS policies: ${(error as Error).message}`);
  }
  
  // 6. Test Realtime functionality
  try {
    let realtimeTestPassed = false;
    const testId = `rt-test-${Date.now()}`;
    
    const realtimePromise = new Promise<boolean>((resolve) => {
      // Set a timeout to fail the test if no realtime event is received
      const timeoutId = setTimeout(() => {
        log('❌ Realtime test timed out. No events received.');
        resolve(false);
      }, 7000);
      
      // Subscribe to the chats table
      const channel = supabase
        .channel('diagnostics')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'chats' },
          (payload) => {
            if (payload.new && payload.new.id === testId) {
              clearTimeout(timeoutId);
              log('✅ Realtime functionality working! Received test event.');
              realtimeTestPassed = true;
              resolve(true);
            }
          }
        )
        .subscribe();
      
      // Clean up subscription after the test
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 8000);
    });
    
    // Wait a bit for the subscription to be established
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Insert a test chat to trigger the realtime event
    log('⏳ Testing realtime functionality, inserting test chat...');
    const { error: insertError } = await supabase
      .from('chats')
      .insert({
        id: testId,
        title: 'Realtime Test'
      });
    
    if (insertError) {
      log(`❌ Failed to insert realtime test chat: ${insertError.message}`);
    } else {
      // Wait for the realtime event or timeout
      results.realtimeWorking = await realtimePromise;
      
      // Clean up - delete the test chat
      await supabase
        .from('chats')
        .delete()
        .eq('id', testId);
    }
    
    if (!results.realtimeWorking) {
      log('❌ Realtime functionality is not working.');
      log('Make sure realtime is enabled in your Supabase project settings.');
      log('Execute this SQL in the Supabase SQL editor:');
      log(`
-- Enable realtime for the chats table
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table chats, messages;
      `);
    }
  } catch (error) {
    log(`❌ Error testing realtime functionality: ${(error as Error).message}`);
  }
  
  // Calculate overall status
  const totalTests = 6;
  const passedTests = [
    results.credentialsPresent,
    results.connectionSuccessful,
    results.chatsTableAccessible,
    results.messagesTableAccessible,
    results.rlsPoliciesCorrect,
    results.realtimeWorking
  ].filter(Boolean).length;
  
  if (passedTests === totalTests) {
    results.overallStatus = 'passed';
    log('🎉 All Supabase diagnostics tests passed!');
  } else if (passedTests > 0) {
    results.overallStatus = 'partial';
    log(`⚠️ Supabase diagnostics completed with ${passedTests}/${totalTests} tests passing.`);
  } else {
    log('❌ All Supabase diagnostics tests failed.');
  }
  
  return results;
}

/**
 * Simple check to see if basic Supabase setup is working
 * This is a lighter version of the full diagnostics
 */
export async function checkSupabaseSetup() {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        isConfigured: false,
        message: 'Supabase credentials not found in environment variables'
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        isConfigured: false,
        message: `Connection error: ${error.message}`
      };
    }
    
    return {
      isConfigured: true,
      message: 'Supabase connection successful'
    };
  } catch (error) {
    return {
      isConfigured: false,
      message: `Unexpected error: ${(error as Error).message}`
    };
  }
} 