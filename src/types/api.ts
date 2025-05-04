export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export type ChatCompletionRequest = {
  model?: string;
  max_tokens?: number;
  system?: string;
  temperature?: number;
  messages: {
    role: 'user' | 'assistant';
    content: string;
  }[];
};

export type ChatCompletionResponse = {
  id: string;
  role: 'assistant';
  content: {
    type: 'text';
    text: string;
  }[];
};

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}