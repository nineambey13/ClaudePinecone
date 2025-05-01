import { ChatCompletionRequest, ChatCompletionResponse, ApiError } from '../../types/api';
import { Anthropic } from '@anthropic-ai/sdk';
import { config } from '../config';

export class ClaudeApi {
  private client: Anthropic;
  private model: string;
  private requestQueue: Promise<any>[] = [];
  private maxConcurrentRequests: number = 3;
  private requestTimeout: number = 60000; // 60 seconds
  private mockMode: boolean = false; // Disable mock mode to use real Claude API

  constructor(apiKey: string, model = config.claude.model) {
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    this.model = model;
    console.log('ClaudeApi initialized with model:', model);
  }

  /**
   * Process a request with rate limiting and error handling
   */
  private async processRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    // If we've reached the maximum number of concurrent requests, wait
    if (this.requestQueue.length >= this.maxConcurrentRequests) {
      await Promise.race(this.requestQueue);
    }

    // Create a new request promise
    const requestPromise = requestFn();
    
    // Add a timeout to the request
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new ApiError('Request timed out after ' + this.requestTimeout + 'ms'));
      }, this.requestTimeout);
    });

    // Race the request against the timeout
    const racePromise = Promise.race([requestPromise, timeoutPromise]);
    
    // Add the promise to the queue
    this.requestQueue.push(racePromise);
    
    try {
      // Wait for the request to complete
      const result = await racePromise;
      return result;
    } catch (error) {
      // Handle specific error types
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle Anthropic API errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status === 429) {
          throw new ApiError('Rate limit exceeded. Please try again later.');
        } else if (status === 401) {
          throw new ApiError('Authentication failed. Please check your API key.');
        } else if (status === 400) {
          throw new ApiError('Invalid request: ' + (error as any).message);
        } else if (status >= 500) {
          throw new ApiError('Anthropic API server error. Please try again later.');
        }
      }
      
      // Generic error handling
      throw new ApiError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      // Remove the promise from the queue when it's done
      const index = this.requestQueue.indexOf(racePromise);
      if (index !== -1) {
        this.requestQueue.splice(index, 1);
      }
    }
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    return this.processRequest(async () => {
      try {
        console.log('Making request to Claude API:', {
          model: request.model || this.model,
          messages: request.messages
        });

        const response = await this.client.messages.create({
          model: request.model || this.model,
          max_tokens: request.max_tokens || 1000,
          messages: request.messages
        });

        console.log('Claude API Response:', response);

        return {
          id: response.id,
          role: 'assistant',
          content: [{
            type: 'text',
            text: response.content[0].text
          }]
        };
      } catch (error) {
        console.error('Error in Claude API call:', error);
        throw error;
      }
    });
  }

  private async mockStreamChat(
    request: ChatCompletionRequest,
    onChunk: (chunk: string) => void,
    onError?: (error: Error) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const mockResponse = "This is a mock response that will be streamed word by word to test the loading states and stop generation functionality. You should see this text appear gradually and be able to stop the generation using the stop button.";
    const words = mockResponse.split(' ');
    
    try {
      for (const word of words) {
        // Check if already aborted
        if (signal?.aborted) {
          onChunk(" [Generation stopped]");
          return;
        }

        // Wait for delay unless aborted
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(resolve, 200);
          
          if (signal) {
            signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('Generation stopped'));
            }, { once: true });
          }
        });
        
        onChunk(word + ' ');
      }
    } catch (error) {
      // If it's an abort error, add the stopped message
      if (error.message === 'Generation stopped') {
        onChunk(" [Generation stopped]");
        return;
      }
      
      // Otherwise handle as regular error
      if (onError) {
        onError(error instanceof Error ? error : new Error('Mock streaming error'));
      }
    }
  }

  async streamChat(
    request: ChatCompletionRequest,
    onChunk: (chunk: string) => void,
    onError?: (error: Error) => void,
    signal?: AbortSignal
  ): Promise<void> {
    if (this.mockMode) {
      return this.mockStreamChat(request, onChunk, onError, signal);
    }

    return this.processRequest(async () => {
      try {
        const stream = await this.client.messages.create({
          model: request.model || this.model,
          max_tokens: request.max_tokens || 1000,
          messages: request.messages,
          stream: true
        }, { signal });

        for await (const chunk of stream) {
          // Check if aborted
          if (signal?.aborted) {
            onChunk(" [Generation stopped]");
            break;
          }

          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            onChunk(chunk.delta.text);
          }
        }
      } catch (error) {
        // Don't treat abort as an error
        if (error.name === 'AbortError') {
          onChunk(" [Generation stopped]");
          return;
        }

        console.error('Error in stream request:', error);
        if (onError) {
          onError(error instanceof Error ? error : new Error('Unknown error occurred'));
        }
        throw error;
      }
    });
  }
} 