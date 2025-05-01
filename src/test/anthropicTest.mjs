import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../../.env') });

async function testClaudeAPI() {
  try {
    const apiKey = process.env.VITE_CLAUDE_API_KEY;
    const model = process.env.VITE_CLAUDE_MODEL || 'claude-3-7-sonnet-20250219';
    
    if (!apiKey) {
      throw new Error('API key not found in environment variables');
    }
    
    const anthropic = new Anthropic({
      apiKey
    });

    console.log('Testing Claude API with model:', model);
    
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: 'Write a short poem about coding'
        }
      ]
    });

    console.log('API Response:', response);
  } catch (error) {
    console.error('Error calling Claude API:', error);
  }
}

testClaudeAPI(); 