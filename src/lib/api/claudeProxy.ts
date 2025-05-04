import { ChatCompletionRequest, ChatCompletionResponse, ApiError } from '../../types/api';

// Server API URL - will be replaced with environment variable in production
const API_URL = '/api/claude';

export class ClaudeProxyApi {
  private model: string;
  private requestQueue: Promise<any>[] = [];
  private maxConcurrentRequests: number = 3;
  private requestTimeout: number = 60000; // 60 seconds
  private mockMode: boolean = false; // Disable mock mode to use real Claude API

  // Map UI model names to actual API model names
  private modelMap: Record<string, string> = {
    'Claude 3.5 Haiku': 'claude-3-5-haiku-20241022',
    'Claude 3.7 Sonnet': 'claude-3-7-sonnet-20250219'
  };

  constructor(model = 'claude-3-7-sonnet-20250219') {
    // Map UI model name to API model name if needed
    this.model = this.modelMap[model] || model;
    console.log('ClaudeProxyApi initialized with model:', this.model);
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

      // Handle API errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status === 429) {
          throw new ApiError('Rate limit exceeded. Please try again later.');
        } else if (status === 401) {
          throw new ApiError('Authentication failed. Please check your API key.');
        } else if (status === 400) {
          throw new ApiError('Invalid request: ' + (error as any).message);
        } else if (status >= 500) {
          throw new ApiError('API server error. Please try again later.');
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
        console.log('Making request to Claude API via proxy:', {
          model: request.model || this.model,
          messages: request.messages
        });

        const response = await fetch(`${API_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: request.model || this.model,
            messages: request.messages,
            max_tokens: request.max_tokens || 4000,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        console.log('Claude API Response via proxy:', data);

        return {
          id: data.id,
          role: 'assistant',
          content: [{
            type: 'text' as const,
            text: data.content[0].type === 'text' ? data.content[0].text : JSON.stringify(data.content)
          }]
        };
      } catch (error) {
        console.error('Error in Claude API call via proxy:', error);
        throw error;
      }
    });
  }

  private async mockStreamChat(
    _request: ChatCompletionRequest,
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
        console.log('Making streaming request to Claude API via proxy:', {
          model: request.model || this.model,
          messages: request.messages
        });

        const response = await fetch(`${API_URL}/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: request.model || this.model,
            messages: request.messages,
            max_tokens: request.max_tokens || 4000,
            temperature: 0.7,
            stream: true
          }),
          signal
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error (${response.status}): ${errorText}`);
        }

        // Process the SSE stream
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          // Check if aborted
          if (signal?.aborted) {
            onChunk(" [Generation stopped]");
            break;
          }

          const { done, value } = await reader.read();
          if (done) break;

          // Decode the chunk and add it to the buffer
          buffer += decoder.decode(value, { stream: true });

          // Process complete lines in the buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6); // Remove 'data: ' prefix

              if (data === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta' && parsed.delta.type === 'text_delta') {
                  onChunk(parsed.delta.text);
                }
              } catch (e) {
                // If it's not valid JSON, just pass it through
                onChunk(data);
              }
            }
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
