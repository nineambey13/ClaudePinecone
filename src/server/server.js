// Express server to host our proxies (Pinecone and API)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pineconeProxy = require('./pineconeProxy');
const apiProxy = require('./apiProxy');

// Load environment variables
console.log('Loading environment variables...');
console.log('Current working directory:', process.cwd());
console.log('Dotenv path:', require.resolve('dotenv'));

// Try to load from specific path
try {
  const result = dotenv.config({ path: './src/server/.env' });
  console.log('Dotenv config result:', result.parsed ? 'Loaded successfully' : 'Failed to load');

  if (!result.parsed) {
    console.log('Trying alternate path...');
    const result2 = dotenv.config({ path: './.env' });
    console.log('Alternate dotenv config result:', result2.parsed ? 'Loaded successfully' : 'Failed to load');
  }
} catch (e) {
  console.error('Error loading dotenv:', e);
}

// Log environment variables (with API keys partially hidden for security)
const pineconeApiKey = process.env.PINECONE_API_KEY || 'Not found';
const claudeApiKey = process.env.CLAUDE_API_KEY || 'Not found';

console.log('Pinecone API Key available:', pineconeApiKey ? `${pineconeApiKey.substring(0, 5)}...${pineconeApiKey.substring(pineconeApiKey.length - 5)}` : 'No');
console.log('Claude API Key available:', claudeApiKey ? `${claudeApiKey.substring(0, 5)}...${claudeApiKey.substring(claudeApiKey.length - 5)}` : 'No');
console.log('PORT:', process.env.PORT || '3001 (default)');
console.log('Environment variables loaded:', Object.keys(process.env).length);
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Pass the API key to the pineconeProxy
pineconeProxy.apiKey = process.env.PINECONE_API_KEY;

// Routes
app.use('/api/pinecone', (req, res, next) => {
  // Explicitly set the API key for each request
  req.pineconeApiKey = process.env.PINECONE_API_KEY;
  next();
}, pineconeProxy);

// API proxy routes
app.use('/api/claude', apiProxy);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
