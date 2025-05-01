import { useState, useCallback } from 'react';
import { ClaudeApi } from '../lib/api/claude';
import { config } from '../lib/config';
import { Message } from '../types/api';

export function useClaudeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claudeApi = new ClaudeApi(config.claude.apiKey);

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      const response = await claudeApi.chat({
        messages: [...messages, userMessage],
      });

      const assistantMessage = response.choices[0].message;
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [messages, claudeApi]);

  const streamMessage = useCallback(async (
    content: string,
    onChunk: (chunk: string) => void
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      await claudeApi.streamChat({
        messages: [...messages, userMessage],
        stream: true
      }, onChunk);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [messages, claudeApi]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    streamMessage
  };
} 