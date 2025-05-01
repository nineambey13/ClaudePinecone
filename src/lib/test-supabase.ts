import { createClient } from '@supabase/supabase-js';

/**
 * Tests the basic Supabase connection
 * This is a simpler test that just verifies the connection is working
 */
export async function testSupabaseConnection() {
  console.log('🔑 Testing Supabase connection...');
  
  try {
    // Get environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase environment variables');
      console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
      return false;
    }
    
    console.log(`🔍 Connecting to Supabase at: ${supabaseUrl}`);
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test connection with a simple query
    const { data, error } = await supabase.from('chats').select('count').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.error('❌ Authentication failed: Invalid API key or missing permissions');
        console.error('This could be due to:');
        console.error('1. Incorrect anon key');
        console.error('2. Missing Row Level Security (RLS) policies');
      } else if (error.code === '42P01') {
        console.error('❌ Table not found: The chats table does not exist');
        console.error('You need to create the necessary tables in your Supabase project');
      } else {
        console.error(`❌ Supabase query failed: ${error.message} (Code: ${error.code})`);
      }
      
      console.log('');
      console.log('🛠️ Recommended Actions:');
      console.log('1. Verify your Supabase URL and anon key are correct');
      console.log('2. Check that the chats table exists in your database');
      console.log('3. Verify Row Level Security (RLS) policies are properly configured');
      console.log('4. Run the full diagnostics for more detailed troubleshooting');
      
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log(`📊 Received data: ${JSON.stringify(data)}`);
    
    // Test auth status
    const { data: session } = await supabase.auth.getSession();
    if (session && session.session) {
      console.log('✅ User is authenticated');
      console.log(`🔑 User ID: ${session.session.user.id}`);
    } else {
      console.log('ℹ️ No active user session (anonymous access)');
    }
    
    console.log('');
    console.log('🛠️ Recommended Actions:');
    console.log('1. If you\'re experiencing issues with persisting data, run the full diagnostics');
    console.log('2. For chat synchronization issues, check RLS policies and Realtime subscription setup');
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error during connection test:', error);
    
    console.log('');
    console.log('🛠️ Recommended Actions:');
    console.log('1. Check your network connection');
    console.log('2. Verify your Supabase project is up and running');
    console.log('3. Make sure you\'re using the correct Supabase URL');
    
    return false;
  }
} 