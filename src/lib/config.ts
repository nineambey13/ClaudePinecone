import * as dotenv from 'dotenv';

// Load environment variables from .env file when running directly with Node.js
if (typeof import.meta.env === 'undefined') {
  dotenv.config();
}

// Helper function to get environment variables
const getEnvVar = (key: string): string => {
  if (typeof import.meta.env !== 'undefined') {
    return import.meta.env[key] || process.env[key] || '';
  }
  return process.env[key] || '';
};

// Log environment variables for debugging
console.log('Environment variables:', {
  VITE_CLAUDE_API_KEY: getEnvVar('VITE_CLAUDE_API_KEY'),
  VITE_CLAUDE_MODEL: getEnvVar('VITE_CLAUDE_MODEL'),
  VITE_PINECONE_API_KEY: getEnvVar('VITE_PINECONE_API_KEY'),
  VITE_PINECONE_ENVIRONMENT: getEnvVar('VITE_PINECONE_ENVIRONMENT'),
  VITE_PINECONE_INDEX: getEnvVar('VITE_PINECONE_INDEX'),
  VITE_SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  VITE_SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY')
});

export const config = {
  claude: {
    apiKey: getEnvVar('VITE_CLAUDE_API_KEY'),
    model: getEnvVar('VITE_CLAUDE_MODEL') || 'claude-3-7-sonnet-20250219'
  },
  pinecone: {
    apiKey: getEnvVar('VITE_PINECONE_API_KEY'),
    environment: getEnvVar('VITE_PINECONE_ENVIRONMENT'),
    index: getEnvVar('VITE_PINECONE_INDEX')
  },
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY')
  }
}; 