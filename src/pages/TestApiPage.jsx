import React, { useState } from 'react';
import Anthropic from '@anthropic-ai/sdk';

const TestApiPage = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
      const model = import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-7-sonnet-20250219';
      
      if (!apiKey) {
        throw new Error('API key not found in environment variables');
      }
      
      const anthropic = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true // Enable browser usage
      });

      console.log('Testing Claude API with model:', model);
      
      const response = await anthropic.messages.create({
        model,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: input
          }
        ]
      });

      console.log('API Response:', response);
      setResult(response.content[0].text);
    } catch (error) {
      console.error('Error calling Claude API:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Claude API Test</h1>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your message:
          </label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            placeholder="Type your message here..."
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`px-4 py-2 rounded-md text-white ${
            loading || !input.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-claude-orange hover:bg-claude-orange/90'
          }`}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h2 className="text-lg font-medium mb-2">Response:</h2>
          <div className="whitespace-pre-wrap">{result}</div>
        </div>
      )}
    </div>
  );
};

export default TestApiPage; 