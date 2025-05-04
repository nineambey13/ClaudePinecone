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

// Log environment variables for debugging (without API keys for security)
console.log('Environment variables:', {
  VITE_CLAUDE_MODEL: getEnvVar('VITE_CLAUDE_MODEL'),
  VITE_PINECONE_ENVIRONMENT: getEnvVar('VITE_PINECONE_ENVIRONMENT'),
  VITE_PINECONE_INDEX: getEnvVar('VITE_PINECONE_INDEX'),
  VITE_SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  VITE_API_PROXY_URL: getEnvVar('VITE_API_PROXY_URL') || 'http://localhost:3001'
});

export const config = {
  claude: {
    model: getEnvVar('VITE_CLAUDE_MODEL') || 'claude-3-7-sonnet-20250219',
    useProxy: true // Always use the proxy to hide API keys
  },
  pinecone: {
    index: getEnvVar('VITE_PINECONE_INDEX') || 'clarity-opensource',
    useProxy: true // Always use the proxy to hide API keys
  },
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY')
  },
  api: {
    proxyUrl: getEnvVar('VITE_API_PROXY_URL') || 'http://localhost:3001'
  }
};
