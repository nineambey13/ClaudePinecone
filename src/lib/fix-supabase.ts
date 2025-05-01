import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';

const TABLES = {
  CHATS: 'chats',
  MESSAGES: 'messages'
};

// Schema definitions for automatic table creation
const SCHEMA = {
  CHATS: `
    id uuid not null primary key,
    title text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id text,
    is_pinned boolean default false
  `,
  MESSAGES: `
    id uuid not null primary key,
    chat_id uuid references chats(id) on delete cascade not null,
    content text not null,
    role text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    token_count integer default 0,
    metadata jsonb
  `
};

// RLS policies to apply
const RLS_POLICIES = {
  CHATS: [
    {
      name: 'Enable read access for authenticated users',
      using: 'auth.uid() = user_id',
      check: '',
      operation: 'SELECT'
    },
    {
      name: 'Enable insert access for authenticated users',
      using: '',
      check: 'auth.uid() = user_id',
      operation: 'INSERT'
    },
    {
      name: 'Enable update access for authenticated users',
      using: 'auth.uid() = user_id',
      check: '',
      operation: 'UPDATE'
    },
    {
      name: 'Enable delete access for authenticated users',
      using: 'auth.uid() = user_id',
      check: '',
      operation: 'DELETE'
    }
  ],
  MESSAGES: [
    {
      name: 'Enable read access for authenticated users',
      using: 'auth.uid() = (SELECT user_id FROM chats WHERE id = chat_id)',
      check: '',
      operation: 'SELECT'
    },
    {
      name: 'Enable insert access for authenticated users',
      using: '',
      check: 'auth.uid() = (SELECT user_id FROM chats WHERE id = chat_id)',
      operation: 'INSERT'
    },
    {
      name: 'Enable update access for authenticated users',
      using: 'auth.uid() = (SELECT user_id FROM chats WHERE id = chat_id)',
      check: '',
      operation: 'UPDATE'
    },
    {
      name: 'Enable delete access for authenticated users',
      using: 'auth.uid() = (SELECT user_id FROM chats WHERE id = chat_id)',
      check: '',
      operation: 'DELETE'
    }
  ]
};

// Setup Supabase client
const setupSupabase = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or anon key missing from environment variables');
    console.log('Please make sure you have the following in your .env file:');
    console.log('VITE_SUPABASE_URL=https://your-project-id.supabase.co');
    console.log('VITE_SUPABASE_ANON_KEY=your-supabase-anon-key');
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
};

// Test and fix Supabase connection
export const fixSupabaseConnection = async () => {
  console.log('🔍 Starting Supabase diagnostic and fix tool...');
  
  // Step 1: Setup Supabase client
  const supabase = setupSupabase();
  if (!supabase) {
    console.error('Could not initialize Supabase client. Please check your environment variables.');
    return false;
  }
  console.log('✅ Supabase client initialized successfully');

  // Step 2: Test authentication
  console.log('🔑 Testing authentication...');
  const { data: authData, error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.error('Authentication error:', authError.message);
    console.log('Please sign in before running this fix tool');
    return false;
  }
  
  if (!authData.session) {
    console.log('No active session found. You need to be signed in to fix your database.');
    console.log('Please sign in and try again.');
    return false;
  }
  
  console.log(`✅ Authenticated as: ${authData.session.user.email}`);

  // Step 3: Check for required tables
  const tablesCheckResults = await checkTables(supabase);
  
  // Step 4: Check RLS policies
  const rlsCheckResults = await checkRlsPolicies(supabase);
  
  // Step 5: Check Realtime subscriptions
  await testRealtimeSubscription(supabase);
  
  // Final report
  console.log('\n📋 Final Diagnostic Report:');
  console.log('-------------------------');
  console.log(`Tables status: ${tablesCheckResults.allTablesExist ? '✅ All required tables exist' : '❌ Some tables are missing'}`);
  console.log(`RLS policies status: ${rlsCheckResults.allPoliciesExist ? '✅ All required RLS policies exist' : '❌ Some RLS policies are missing'}`);
  
  console.log('\n🛠️ Recommended Actions:');
  if (!tablesCheckResults.allTablesExist || !rlsCheckResults.allPoliciesExist) {
    console.log('1. Run Supabase migrations');
    console.log('2. Make sure your schema matches the expected structure');
    console.log('3. Ensure RLS is enabled on all tables with appropriate policies');
  } else {
    console.log('Your Supabase setup looks good! If you are still experiencing issues:');
    console.log('1. Check if you have network connectivity issues');
    console.log('2. Verify that your application is using the correct Supabase project');
    console.log('3. Make sure your client-side code correctly handles authentication');
  }
  
  console.log('\nDiagnostic completed!');
  return true;
};

// Check if required tables exist
async function checkTables(supabase: any) {
  console.log('\n📊 Checking for required tables...');
  const results = {
    allTablesExist: true,
    tables: {} as Record<string, boolean>
  };

  for (const tableName of Object.values(TABLES)) {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select()
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
    
    const exists = data && data.length > 0;
    results.tables[tableName] = exists;
    
    if (!exists) {
      results.allTablesExist = false;
      console.log(`❌ Table '${tableName}' does not exist`);
    } else {
      console.log(`✅ Table '${tableName}' exists`);
      await checkTableColumns(supabase, tableName);
    }
  }

  if (!results.allTablesExist) {
    console.log('Would you like to create missing tables? (This feature requires admin privileges)')
    console.log('This can only be done through the Supabase dashboard or with direct SQL execution rights');
  }

  return results;
}

// Check columns in tables
async function checkTableColumns(supabase: any, tableName: string) {
  console.log(`   Checking columns for table '${tableName}'...`);
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_schema', 'public')
    .eq('table_name', tableName);

  if (error) {
    console.error(`   Error checking columns for table '${tableName}':`, error);
    return;
  }

  console.log(`   Found ${data.length} columns in table '${tableName}'`);
  
  // Optional: detailed column check
  if (tableName === TABLES.CHATS) {
    const requiredColumns = ['id', 'title', 'created_at', 'updated_at', 'user_id', 'is_pinned'];
    checkRequiredColumns(data, requiredColumns, tableName);
  } else if (tableName === TABLES.MESSAGES) {
    const requiredColumns = ['id', 'chat_id', 'content', 'role', 'created_at', 'updated_at', 'token_count', 'metadata'];
    checkRequiredColumns(data, requiredColumns, tableName);
  }
}

// Check if all required columns exist in a table
function checkRequiredColumns(columns: any[], requiredColumns: string[], tableName: string) {
  const columnNames = columns.map(col => col.column_name);
  const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
  
  if (missingColumns.length > 0) {
    console.log(`   ❌ Missing required columns in '${tableName}': ${missingColumns.join(', ')}`);
  } else {
    console.log(`   ✅ All required columns exist in '${tableName}'`);
  }
}

// Check RLS policies
async function checkRlsPolicies(supabase: any) {
  console.log('\n🔒 Checking for RLS policies...');
  const results = {
    allPoliciesExist: true,
    policies: {} as Record<string, Record<string, boolean>>
  };

  // First check if RLS is enabled
  for (const tableName of Object.values(TABLES)) {
    const { data, error } = await supabase
      .from('pg_tables')
      .select('rowsecurity')
      .eq('schemaname', 'public')
      .eq('tablename', tableName);

    if (error) {
      console.error(`Error checking RLS for table '${tableName}':`, error);
      continue;
    }

    const rlsEnabled = data?.[0]?.rowsecurity === true;
    if (!rlsEnabled) {
      console.log(`❌ RLS is NOT enabled on table '${tableName}'`);
      results.allPoliciesExist = false;
    } else {
      console.log(`✅ RLS is enabled on table '${tableName}'`);
      
      // Check for specific policies
      const { data: policiesData, error: policiesError } = await supabase
        .from('pg_policies')
        .select('policyname')
        .eq('schemaname', 'public')
        .eq('tablename', tableName);
        
      if (policiesError) {
        console.error(`Error checking policies for table '${tableName}':`, policiesError);
        continue;
      }
      
      const policyNames = policiesData.map((p: any) => p.policyname);
      console.log(`   Found ${policyNames.length} policies on table '${tableName}'`);
      
      // Check specific expected policies by operation
      const tableKey = tableName === TABLES.CHATS ? 'CHATS' : 'MESSAGES';
      const expectedPolicies = RLS_POLICIES[tableKey as keyof typeof RLS_POLICIES];
      
      results.policies[tableName] = {};
      expectedPolicies.forEach((policy: any) => {
        const operation = policy.operation.toLowerCase();
        const hasPolicy = policyNames.some((p: string) => 
          p.toLowerCase().includes(operation.toLowerCase()));
        results.policies[tableName][operation] = hasPolicy;
        
        if (!hasPolicy) {
          results.allPoliciesExist = false;
          console.log(`   ❌ Missing ${operation} policy on table '${tableName}'`);
        } else {
          console.log(`   ✅ ${operation} policy exists on table '${tableName}'`);
        }
      });
    }
  }

  return results;
}

// Test realtime subscription
async function testRealtimeSubscription(supabase: any): Promise<void> {
  console.log('\n📡 Testing Realtime subscription capabilities...');
  
  let channel: RealtimeChannel;
  try {
    let timeoutId: number;
    let realtimeWorking = false;
    
    // Create a promise that resolves if we get a subscription event, rejects on timeout
    const realtimePromise = new Promise<void>((resolve, reject) => {
      channel = supabase
        .channel('test-realtime-channel')
        .on('presence', { event: 'sync' }, () => {
          console.log('✅ Realtime presence sync event received');
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          realtimeWorking = true;
          resolve();
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to realtime channel');
          } else {
            console.log(`Subscription status: ${status}`);
          }
        });
      
      timeoutId = window.setTimeout(() => {
        if (!realtimeWorking) {
          reject(new Error('Realtime test timed out'));
        }
      }, 5000);
    });
    
    console.log('Testing presence...');
    await channel.track({
      online_at: new Date().toISOString(),
    });
    
    await realtimePromise;
    console.log('✅ Realtime functionality is working correctly');
  } catch (error) {
    console.error('❌ Realtime test failed:', error);
    console.log('This could be due to:');
    console.log('1. Realtime addon not being enabled in your Supabase project');
    console.log('2. Firewall blocking WebSocket connections');
    console.log('3. Network connectivity issues');
  } finally {
    if (channel) {
      await channel.unsubscribe();
    }
  }
}

// For browser usage
export function runSupabaseFix() {
  fixSupabaseConnection()
    .then(success => {
      if (success) {
        console.log('Diagnostic completed successfully');
      } else {
        console.log('Diagnostic failed - please check the errors above');
      }
    })
    .catch(error => {
      console.error('Unexpected error during diagnostic:', error);
    });
}

/**
 * Comprehensive Supabase diagnostics tool
 * This runs a series of tests to identify issues with Supabase configuration
 */
export async function runSupabaseDiagnostics(supabaseUrl?: string, supabaseAnonKey?: string) {
  console.log('🔍 Running Supabase diagnostics...');
  console.log('');
  
  // Use provided credentials or fallback to environment variables
  const url = supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
  const key = supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Check if credentials are available
  if (!url || !key) {
    console.error('❌ Missing Supabase credentials');
    console.error('Either provide them directly or set the following environment variables:');
    console.error('- VITE_SUPABASE_URL');
    console.error('- VITE_SUPABASE_ANON_KEY');
    return {
      success: false,
      environmentVariables: false,
      connection: false,
      tables: { chats: false, messages: false },
      rls: false,
      realtime: false
    };
  }
  
  try {
    // Initialize Supabase client
    const supabase = createClient(url, key);
    const results = {
      success: false,
      environmentVariables: true,
      connection: false,
      tables: { chats: false, messages: false },
      rls: false,
      realtime: false
    };
    
    // --- Test 1: Basic Connection ---
    console.log('🧪 Test 1: Checking basic Supabase connection...');
    try {
      const { error } = await supabase.from('chats').select('count').limit(1);
      
      if (error) {
        console.error(`❌ Connection failed: ${error.message} (${error.code})`);
        
        if (error.code === 'PGRST116' || error.message?.includes('JWT')) {
          console.error('This appears to be an authentication issue:');
          console.error('1. Your Supabase anon key might be incorrect');
          console.error('2. RLS policies might be blocking access');
        }
        
        // Even with an error, we made some connection
        results.connection = false;
      } else {
        console.log('✅ Successfully connected to Supabase!');
        results.connection = true;
      }
    } catch (err) {
      console.error('❌ Connection failed with an unexpected error:', err);
      results.connection = false;
    }
    
    if (!results.connection) {
      console.log('');
      console.log('🛑 Cannot proceed with further tests due to connection failure');
      console.log('🛠️ Suggested fixes:');
      console.log('1. Verify your Supabase URL and anon key are correct');
      console.log('2. Check if your Supabase project is up and running');
      console.log('3. Ensure your network can reach the Supabase servers');
      
      return results;
    }
    
    // --- Test 2: Table Structure ---
    console.log('');
    console.log('🧪 Test 2: Checking database tables...');
    
    // Check chats table
    try {
      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('id, title, created_at')
        .limit(1);
      
      if (chatsError) {
        console.error('❌ Chats table issue:', chatsError.message);
        if (chatsError.code === '42P01') {
          console.error('The "chats" table does not exist');
        } else {
          console.error(`Error code: ${chatsError.code}`);
        }
        results.tables.chats = false;
      } else {
        console.log('✅ Chats table exists and is accessible');
        results.tables.chats = true;
      }
    } catch (err) {
      console.error('❌ Error checking chats table:', err);
      results.tables.chats = false;
    }
    
    // Check messages table
    try {
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id, chat_id, content, role, timestamp, is_edited')
        .limit(1);
      
      if (messagesError) {
        console.error('❌ Messages table issue:', messagesError.message);
        if (messagesError.code === '42P01') {
          console.error('The "messages" table does not exist');
        } else {
          console.error(`Error code: ${messagesError.code}`);
        }
        results.tables.messages = false;
      } else {
        console.log('✅ Messages table exists and is accessible');
        results.tables.messages = true;
      }
    } catch (err) {
      console.error('❌ Error checking messages table:', err);
      results.tables.messages = false;
    }
    
    if (!results.tables.chats || !results.tables.messages) {
      console.log('');
      console.log('🛠️ Table setup instructions:');
      
      if (!results.tables.chats) {
        console.log('1. Create the "chats" table with the following schema:');
        console.log('   - id: text (primary key)');
        console.log('   - title: text');
        console.log('   - created_at: timestamptz (default: now())');
      }
      
      if (!results.tables.messages) {
        console.log('2. Create the "messages" table with the following schema:');
        console.log('   - id: text (primary key)');
        console.log('   - chat_id: text (foreign key to chats.id)');
        console.log('   - content: text');
        console.log('   - role: text');
        console.log('   - timestamp: timestamptz (default: now())');
        console.log('   - is_edited: boolean (default: false)');
      }
    }
    
    // --- Test 3: Row Level Security (RLS) ---
    console.log('');
    console.log('🧪 Test 3: Checking Row Level Security (RLS) configuration...');
    
    // RLS testing is complex, but we can give some indication based on behavior
    try {
      // Insert a test chat and immediately delete it to check write permissions
      const testId = `test-${Date.now()}`;
      
      // Insert test
      const { error: insertError } = await supabase
        .from('chats')
        .insert([{ id: testId, title: 'RLS Test' }]);
      
      if (insertError) {
        console.error('❌ Failed to insert test data:', insertError.message);
        console.error('This might indicate RLS policies are blocking inserts');
        results.rls = false;
      } else {
        console.log('✅ Successfully inserted test data');
        
        // Delete test data
        const { error: deleteError } = await supabase
          .from('chats')
          .delete()
          .eq('id', testId);
        
        if (deleteError) {
          console.error('❌ Failed to delete test data:', deleteError.message);
          console.error('This might indicate RLS policies are blocking deletes');
          results.rls = false;
        } else {
          console.log('✅ Successfully deleted test data');
          console.log('✅ Row Level Security appears to be configured correctly for anonymous access');
          results.rls = true;
        }
      }
    } catch (err) {
      console.error('❌ Error testing RLS:', err);
      results.rls = false;
    }
    
    if (!results.rls) {
      console.log('');
      console.log('🛠️ Suggested RLS fixes:');
      console.log('1. Check your RLS policies in the Supabase dashboard');
      console.log('2. For anonymous access (not logged in), you need permissive policies');
      console.log('3. Example RLS policy for public read/write access:');
      console.log('   CREATE POLICY "Public access" ON "public"."chats" FOR ALL USING (true) WITH CHECK (true);');
      console.log('   CREATE POLICY "Public access" ON "public"."messages" FOR ALL USING (true) WITH CHECK (true);');
    }
    
    // --- Test 4: Realtime Configuration ---
    console.log('');
    console.log('🧪 Test 4: Testing Realtime configuration...');
    
    try {
      let realtimeSuccess = false;
      
      // Create a channel to test realtime
      const channel = supabase.channel('test-diagnostics')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'chats' }, 
            (payload) => {
              console.log('✅ Realtime event received:', payload.eventType);
              realtimeSuccess = true;
            })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to realtime events');
          } else {
            console.error('❌ Realtime subscription status:', status);
          }
        });
      
      // Insert a test record to trigger a realtime event
      const testId = `realtime-test-${Date.now()}`;
      console.log('Inserting test record to trigger realtime event...');
      
      const { error: insertError } = await supabase
        .from('chats')
        .insert([{ id: testId, title: 'Realtime Test' }]);
      
      if (insertError) {
        console.error('❌ Failed to insert test record:', insertError.message);
      }
      
      // Wait 2 seconds to see if a realtime event is received
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('chats')
        .delete()
        .eq('id', testId);
      
      if (deleteError) {
        console.error('❌ Failed to delete test record:', deleteError.message);
      }
      
      // Clean up realtime subscription
      supabase.removeChannel(channel);
      
      if (realtimeSuccess) {
        console.log('✅ Realtime is properly configured');
        results.realtime = true;
      } else {
        console.error('❌ No realtime events were received');
        console.error('This suggests realtime is not properly configured');
        results.realtime = false;
      }
    } catch (err) {
      console.error('❌ Error testing realtime:', err);
      results.realtime = false;
    }
    
    if (!results.realtime) {
      console.log('');
      console.log('🛠️ Suggested realtime fixes:');
      console.log('1. Check if realtime is enabled in your Supabase project settings');
      console.log('2. Verify that you have enabling replication for the tables');
      console.log('3. Ensure your RLS policies allow access to the tables for realtime');
    }
    
    // --- Final Summary ---
    console.log('');
    console.log('📊 Diagnostics Summary:');
    console.log(`Environment Variables: ${results.environmentVariables ? '✅' : '❌'}`);
    console.log(`Connection: ${results.connection ? '✅' : '❌'}`);
    console.log(`Tables: Chats (${results.tables.chats ? '✅' : '❌'}), Messages (${results.tables.messages ? '✅' : '❌'})`);
    console.log(`Row Level Security: ${results.rls ? '✅' : '❌'}`);
    console.log(`Realtime: ${results.realtime ? '✅' : '❌'}`);
    
    results.success = results.connection && 
                     results.tables.chats && 
                     results.tables.messages && 
                     results.rls && 
                     results.realtime;
    
    console.log('');
    if (results.success) {
      console.log('🎉 All tests passed! Your Supabase setup appears to be working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Review the results above and fix the issues.');
      
      // Provide specific recommendations based on what failed
      console.log('');
      console.log('🔧 What to do next:');
      
      if (!results.connection) {
        console.log('- Verify your Supabase URL and anon key');
        console.log('- Check if your Supabase project is up and running');
      }
      
      if (!results.tables.chats || !results.tables.messages) {
        console.log('- Create the missing tables in your Supabase project');
        console.log('- Use the table schema instructions provided above');
      }
      
      if (!results.rls) {
        console.log('- Review and update your Row Level Security policies');
        console.log('- For testing, you might want to temporarily set permissive policies');
      }
      
      if (!results.realtime) {
        console.log('- Enable realtime in your Supabase project settings');
        console.log('- Set up database replication for the tables you want to monitor');
      }
    }
    
    return results;
  } catch (error) {
    console.error('❌ Unexpected error during diagnostics:', error);
    return {
      success: false,
      environmentVariables: false,
      connection: false,
      tables: { chats: false, messages: false },
      rls: false,
      realtime: false
    };
  }
} 