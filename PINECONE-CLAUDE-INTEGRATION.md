# Pinecone Integration with Claude

This document explains how to use the Pinecone integration with Claude in the chat application.

## Overview

The integration allows Claude to:
1. Search Pinecone for relevant knowledge when answering user questions
2. Display a visual indicator when using Pinecone data
3. Maintain context across conversations

## Setup

1. Make sure you have the required environment variables set in your `.env` file:

```
# Claude API Key
VITE_CLAUDE_API_KEY=your-claude-api-key

# Claude Model name
VITE_CLAUDE_MODEL=claude-3-7-sonnet-20250219

# Pinecone credentials
VITE_PINECONE_API_KEY=your-pinecone-api-key
VITE_PINECONE_INDEX=clarity-opensource

# Pinecone proxy URL
VITE_PINECONE_PROXY_URL=http://localhost:3001/api/pinecone
```

2. Make sure you have the required environment variables set in your `src/server/.env` file:

```
PINECONE_API_KEY=your-pinecone-api-key
PORT=3001
```

3. Start the proxy server:

```
cd src/server
node server.js
```

4. Start the application:

```
npm run dev
```

## How It Works

1. When a user sends a message, the app checks if Pinecone and embedding API are configured
2. If configured, it generates an embedding for the user's message
3. It searches Pinecone for similar vectors (semantic search)
4. If relevant knowledge is found, it's added to the prompt sent to Claude
5. Claude's response is displayed with a visual indicator showing it used Pinecone data

## Testing the Integration

You can test the integration using the provided test scripts:

1. Test the Pinecone API directly:

```
node src/server/test-pinecone.js
```

2. Test the Claude-Pinecone integration:

```
node src/test/testClaudePinecone.js
```

3. Test in the browser:

Open `src/test/testClaudePinecone.html` in your browser.

## Troubleshooting

If you encounter issues with the Pinecone integration, check the following:

1. Make sure the proxy server is running
2. Check the browser console for error messages
3. Verify that your Pinecone API key is correct
4. Ensure the Pinecone index exists and is accessible
5. Check that the vector dimensions match (384 for Claude embeddings)

## Common Issues

1. **404 Not Found**: This usually means the proxy server is not running or the URL is incorrect
   - Make sure you're using the correct URL format: `https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io/query` (NOT `/vectors/query`)
   - The Pinecone API endpoints are `/query`, `/upsert`, and `/delete` (NOT `/vectors/query`, `/vectors/upsert`, `/vectors/delete`)
2. **401 Unauthorized**: This means your Pinecone API key is invalid
3. **CORS errors**: These occur when trying to access Pinecone directly from the browser (use the proxy server instead)
4. **Vector dimension mismatch**: Make sure you're using 384-dimensional vectors for Claude embeddings

## Using Pinecone with Claude in Your Application

To use Pinecone with Claude in your application:

1. Make sure the proxy server is running
2. Send a message in the chat interface
3. The app will automatically search Pinecone for relevant knowledge
4. If found, Claude will use this knowledge to enhance its response
5. A visual indicator will show that Claude used Pinecone data

You don't need to do anything special to trigger the Pinecone search - it happens automatically for every message when Pinecone is configured.
