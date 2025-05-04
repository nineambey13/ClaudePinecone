import axios from 'axios';
import { config } from './config';

// Configuration
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1';
const CLAUDE_MODEL = config.claude.model;

// Check if Claude API is configured
export const isClaudeConfigured = (): boolean => {
  return !!CLAUDE_API_KEY;
};

// Check if embeddings are configured
export const isEmbeddingConfigured = (): boolean => {
  // Always return true for open source embeddings
  // since we're using the Xenova Transformers library which doesn't require an API key
  return true;
};

// Generate an embedding using the Xenova Transformers library
export const getEmbedding = async (text: string): Promise<number[]> => {
  try {
    // Import the generateEmbedding function from embeddings.ts
    const { generateEmbedding } = await import('./embeddings');

    // Use the open source embedding model
    return await generateEmbedding(text);
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Fall back to random embedding in case of error (384 dimensions for all-MiniLM-L6-v2)
    return Array.from({ length: 384 }, () => Math.random() * 2 - 1);
  }
};

// Add a function to map UI model names to API model IDs
export const getModelIdFromName = (modelName: string): string => {
  switch (modelName) {
    case 'Claude 3.5 Haiku':
      return 'claude-3-5-haiku-20240307';
    case 'Claude 3.7 Sonnet':
      return 'claude-3-7-sonnet-20250219';
    default:
      return 'claude-3-5-haiku-20240307'; // Default to Haiku
  }
};

// Make a request to Claude API
export const callClaude = async (
  messages: { role: 'user' | 'assistant'; content: string }[],
  temperature: number = 0.7,
  maxTokens: number = 1000,
  modelName: string = 'Claude 3.5 Haiku'
): Promise<string> => {
  if (!isClaudeConfigured()) {
    console.warn('Claude API is not configured.');
    return "I'm sorry, the Claude API is not configured.";
  }

  const modelId = getModelIdFromName(modelName);

  try {
    // Format messages for Claude API
    const response = await axios.post(
      `${CLAUDE_API_URL}/messages`,
      {
        model: modelId,
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
