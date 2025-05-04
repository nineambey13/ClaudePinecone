// API Proxy Server to hide API keys from the client
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

// Get API keys from environment variables
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// Enable CORS for all routes
router.use(cors());

// Middleware to check if Claude API is configured
const checkClaudeConfig = (req, res, next) => {
  if (!CLAUDE_API_KEY) {
    console.error('No Claude API key found in environment variables');
    return res.status(500).json({ error: 'Claude API key not configured' });
  }
  next();
};

// Claude API proxy endpoint
router.post('/claude', checkClaudeConfig, async (req, res) => {
  try {
    const { messages, model } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages must be an array' });
    }
    
    // Use the model from the request or default to claude-3-7-sonnet
    const claudeModel = model || 'claude-3-7-sonnet-20250219';
    
    console.log(`Proxying request to Claude API (${claudeModel})`);
    console.log(`Number of messages: ${messages.length}`);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: claudeModel,
        messages,
        max_tokens: 4000,
        stream: false
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API error (${response.status}): ${errorText}`);
      return res.status(response.status).json({
        error: `Claude API error: ${response.statusText}`,
        details: errorText
      });
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Error in Claude API proxy:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Claude API streaming proxy endpoint
router.post('/claude/stream', checkClaudeConfig, async (req, res) => {
  try {
    const { messages, model } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages must be an array' });
    }
    
    // Use the model from the request or default to claude-3-7-sonnet
    const claudeModel = model || 'claude-3-7-sonnet-20250219';
    
    console.log(`Proxying streaming request to Claude API (${claudeModel})`);
    console.log(`Number of messages: ${messages.length}`);
    
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: claudeModel,
        messages,
        max_tokens: 4000,
        stream: true
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API error (${response.status}): ${errorText}`);
      res.write(`data: ${JSON.stringify({ error: `Claude API error: ${response.statusText}` })}\n\n`);
      return res.end();
    }
    
    // Process the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      // Decode the chunk and add it to the buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines in the buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6); // Remove 'data: ' prefix
          
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
          } else {
            try {
              // Forward the event to the client
              res.write(`data: ${data}\n\n`);
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
      
      // Flush the response to ensure the client receives data immediately
      res.flush?.();
    }
    
    res.end();
  } catch (error) {
    console.error('Error in Claude API streaming proxy:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Embedding API proxy endpoint
router.post('/embedding', checkClaudeConfig, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    console.log('Proxying request to Claude Embedding API');
    console.log(`Text length: ${text.length} characters`);
    
    const response = await fetch('https://api.anthropic.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        input: text,
        dimensions: 384
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Embedding API error (${response.status}): ${errorText}`);
      return res.status(response.status).json({
        error: `Embedding API error: ${response.statusText}`,
        details: errorText
      });
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Error in Embedding API proxy:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
