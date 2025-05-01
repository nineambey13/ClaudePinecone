import axios from 'axios';
import { config } from './config';

// Configuration
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1';
const CLAUDE_MODEL = config.claude.model;
const EMBEDDING_MODEL = 'text-embedding-ada-002'; // OpenAI embedding model
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1';

// Check if Claude API is configured
export const isClaudeConfigured = (): boolean => {
  return !!CLAUDE_API_KEY;
};

// Check if OpenAI API is configured for embeddings
export const isEmbeddingConfigured = (): boolean => {
  return !!OPENAI_API_KEY;
};

// Generate an embedding using OpenAI's embedding API
export const getEmbedding = async (text: string): Promise<number[]> => {
  // If OpenAI API key is not configured, fall back to random embeddings
  if (!isEmbeddingConfigured()) {
    console.warn('OpenAI API is not configured for embeddings. Using placeholder embeddings.');
    // Return a placeholder embedding (1536-dimensional vector of random values)
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }

  try {
    // Call OpenAI's embedding API
    const response = await axios.post(
      `${OPENAI_API_URL}/embeddings`,
      {
        model: EMBEDDING_MODEL,
        input: text,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    
    // Return the embedding vector
    return response.data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Fall back to random embedding in case of error
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }
};

// Make a request to Claude API
export const callClaude = async (
  messages: { role: 'user' | 'assistant'; content: string }[],
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> => {
  if (!isClaudeConfigured()) {
    console.warn('Claude API is not configured.');
    return "I'm sorry, the Claude API is not configured.";
  }

  try {
    // Format messages for Claude API
    const response = await axios.post(
      `${CLAUDE_API_URL}/messages`,
      {
        model: CLAUDE_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    return response.data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return "I'm sorry, there was an error processing your request.";
  }
};

// Generate a summary of text using Claude
export const generateSummary = async (text: string): Promise<string> => {
  if (!isClaudeConfigured()) {
    console.warn('Claude API is not configured. Unable to generate summary.');
    return '';
  }

  try {
    const messages = [
      {
        role: 'user' as const,
        content: `Please provide a concise summary of the following content in one or two sentences:\n\n${text}`,
      },
    ];

    return await callClaude(messages, 0.3, 150);
  } catch (error) {
    console.error('Error generating summary:', error);
    return '';
  }
};

// Extract key concepts from text using Claude
export const extractConcepts = async (text: string): Promise<string[]> => {
  if (!isClaudeConfigured()) {
    console.warn('Claude API is not configured. Unable to extract concepts.');
    return [];
  }

  try {
    const messages = [
      {
        role: 'user' as const,
        content: `Extract 5-10 key concepts from the following text as a JSON array of strings:\n\n${text}`,
      },
    ];

    const response = await callClaude(messages, 0.3, 300);
    
    // Try to parse the response as JSON
    try {
      // Find JSON array in the response
      const jsonMatch = response.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (parseError) {
      console.error('Error parsing concepts:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error extracting concepts:', error);
    return [];
  }
}; 