// Simple script to check Supabase configuration
console.log('🔍 Checking Supabase Configuration');

// Load config
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load .env file
let supabaseUrl;
let supabaseAnonKey;

// First try to load from process.env
supabaseUrl = process.env.VITE_SUPABASE_URL;
supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// If not found, try to read .env file manually
if (!supabaseUrl || !supabaseAnonKey) {
  try {
    const envPath = resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      for (const line of envLines) {
        const [key, value] = line.split('=');
        if (key === 'VITE_SUPABASE_URL') supabaseUrl = value;
        if (key === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = value;
      }
    }
  } catch (err) {
    console.error('Error reading .env file:', err);
  }
}

console.log('Supabase URL:', supabaseUrl ? 'Set (not showing full URL for security)' : 'Not set');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set (not showing key for security)' : 'Not set');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase credentials in environment variables');
  console.log('Please check your .env file at the root of your project:');
  console.log('VITE_SUPABASE_URL=your_project_url');
  console.log('VITE_SUPABASE_ANON_KEY=your_anon_key');
  process.exit(1);
}

try {
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client initialized');
  console.log('🔍 Testing connection...');

  // Basic connection test
  const sessionResult = await supabase.auth.getSession();
  if (sessionResult.error) {
    console.error('❌ Connection error:', sessionResult.error.message);
    process.exit(1);
  }
  
  console.log('✅ Connected to Supabase successfully');
  
  // Check for tables
  const chatsResult = await supabase.from('chats').select('count').limit(1);
  const messagesResult = await supabase.from('messages').select('count').limit(1);
  
  if (chatsResult.error) {
    console.error('❌ Chats table error:', chatsResult.error.message);
    if (chatsResult.error.code === '42P01') {
      console.error('The chats table does not exist');
    }
  } else {
    console.log('✅ Chats table accessible');
  }
  
  if (messagesResult.error) {
    console.error('❌ Messages table error:', messagesResult.error.message);
    if (messagesResult.error.code === '42P01') {
      console.error('The messages table does not exist');
    }
  } else {
    console.log('✅ Messages table accessible');
  }
  
  console.log('\n🛠️ Fixing Steps:');
  console.log('1. Ensure your Supabase project is running');
  console.log('2. Verify you have the correct URL and anon key');
  console.log('3. Create the chats and messages tables if they don\'t exist');
  console.log('4. Check your Row Level Security (RLS) policies');
} catch (error) {
  console.error('❌ Failed to initialize or test Supabase client:', error);
  process.exit(1);
} 