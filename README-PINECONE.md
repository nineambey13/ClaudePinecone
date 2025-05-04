# Pinecone Integration for Claude Chat

This document explains how the Pinecone integration works with Claude in the chat application.

## Overview

The integration allows Claude to:
1. Search Pinecone for relevant knowledge when answering user questions
2. Display a visual indicator when using Pinecone data
3. Maintain context across conversations

## Required Environment Variables

For the Pinecone integration to work, you need to set these environment variables:

```
VITE_PINECONE_API_KEY=your-pinecone-api-key
VITE_PINECONE_INDEX=your-pinecone-index-name
```

Note: For the `clarity-opensource` index, we've hardcoded the correct Pinecone URL:
```
https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io
```

The Pinecone URL format has changed and now follows this pattern:
```
https://INDEX_NAME-PROJECT_ID.svc.CLUSTER_ID.pinecone.io
```

You can find your correct URL in the Pinecone console or API keys section.

We use open source embeddings from the Xenova Transformers library, so no OpenAI API key is required for embeddings.

## Setting Up the Proxy Server (REQUIRED)

**IMPORTANT**: The proxy server is REQUIRED to use Pinecone in the browser due to CORS restrictions.

### Option 1: Using the Batch File (Windows)

1. Simply run the `startProxy.bat` file in the root directory:
   ```
   startProxy.bat
   ```

### Option 2: Manual Setup

1. Navigate to the server directory:
   ```
   cd src/server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your Pinecone credentials:
   ```
   PINECONE_API_KEY=your-pinecone-api-key
   PORT=3001
   ```

4. Start the server:
   ```
   npm start
   ```

### Verifying the Proxy Server

You should see output like:
```
Server running on port 3001
Pinecone proxy available at http://localhost:3001/api/pinecone
```

You can also check the health endpoint in your browser:
http://localhost:3001/health

## Testing the Integration

To test if the Pinecone integration is working correctly:

1. Make sure the proxy server is running

2. Run the test scripts:
   ```
   node src/test/pineconeIntegrationTest.js
   node src/test/claudePineconeTest.js
   ```

2. Check the console output for:
   - Confirmation that Pinecone and embedding API are configured
   - Results from test queries
   - Any error messages that might indicate configuration issues

## CORS Issues and Proxy Server

**Important**: Pinecone's API doesn't support direct browser access due to CORS restrictions. You'll see errors like:

```
Access to fetch at 'https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io/vectors/query' has been blocked by CORS policy
```

To solve this, we've implemented two approaches:

### 1. Proxy Server (Recommended for Production)

1. Set up the proxy server in `src/server`
2. Add the proxy URL to your .env file:
   ```
   VITE_PINECONE_PROXY_URL=http://localhost:3001/api/pinecone
   ```
3. The client will automatically use the proxy if the URL is provided

### 2. Mock Data Fallback (Development Mode)

For development purposes, we've implemented a mock data fallback:

1. If the proxy server is not running or not configured, the application will automatically use mock data
2. This allows you to develop and test the application without setting up the proxy server
3. The mock data includes sample entries that simulate Pinecone responses

## Troubleshooting

If the integration isn't working:

1. Check the browser console for detailed logs
2. Verify all environment variables are set correctly
3. Make sure your Pinecone index exists and has the correct dimension (384 for the all-MiniLM-L6-v2 model)
4. Check that your Pinecone API key has the correct permissions
5. **Set up the proxy server to avoid CORS issues**
   - This is the most common issue - browsers can't directly access Pinecone's API
   - Run the proxy server and set `VITE_PINECONE_PROXY_URL` in your .env file
6. **Verify the Pinecone URL is correct**
   - For the `clarity-opensource` index, we've hardcoded the URL to:
   - `https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io`
   - For other indexes, you'll need to update the code with your specific URL
7. If you see `ERR_NAME_NOT_RESOLVED` errors, it means the Pinecone URL is incorrect
8. If you see timeout errors, try increasing the timeout values in the code

## Visual Indicators

When Claude uses knowledge from Pinecone to answer a question, you'll see a blue badge at the top of the message that says "Using knowledge from Pinecone".

## Implementation Details

The integration works as follows:

1. When a user sends a message, the app checks if Pinecone and embedding API are configured
2. If configured, it generates an embedding for the user's message
3. It searches Pinecone for similar vectors (semantic search)
4. If relevant knowledge is found, it's added to the prompt sent to Claude
5. Claude's response is displayed with a visual indicator showing it used Pinecone data
