# Knowledge Base Setup Guide

This guide will help you set up and configure the Knowledge Base page with Pinecone vector database and Claude/OpenAI API integration.

## Environment Variables Setup

Create a `.env` file in the root of your project with the following variables:

```
# Claude API Configuration
NEXT_PUBLIC_CLAUDE_API_KEY=your-claude-api-key-here

# OpenAI API Configuration (for embeddings)
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here

# Pinecone Configuration
NEXT_PUBLIC_PINECONE_API_KEY=your-pinecone-api-key-here
NEXT_PUBLIC_PINECONE_ENVIRONMENT=your-pinecone-environment-here
NEXT_PUBLIC_PINECONE_INDEX=your-pinecone-index-name-here
```

## Obtaining API Keys

### Claude API Key
1. Sign up for an Anthropic account at https://console.anthropic.com/
2. Create a new API key from your dashboard
3. Copy the key to your `.env` file

### OpenAI API Key (for embeddings)
1. Sign up for an OpenAI account at https://platform.openai.com/
2. Go to API Keys section and create a new key
3. Copy the key to your `.env` file

### Pinecone Setup
1. Sign up for a Pinecone account at https://app.pinecone.io/
2. Create a new project
3. Create a new index with the following settings:
   - Dimensions: 1536 (for compatibility with OpenAI embeddings)
   - Metric: Cosine
   - Pod Type: Select based on your needs (e.g., s1.x1 for starter)
4. Copy your API key, environment, and index name to your `.env` file

## Running the Application

After setting up the environment variables:

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Navigate to the Knowledge Base page to test the functionality

## How It Works

The Knowledge Base integrates three main components:

1. **Local Storage**: All entries are saved locally by default, ensuring functionality even without API access
2. **Claude API**: Provides AI capabilities like generating summaries and extracting key concepts
3. **OpenAI Embeddings**: Creates vector representations of text
4. **Pinecone**: Stores and retrieves vectors for semantic search

When you save a knowledge entry:
- It's saved to local storage
- If Claude API is configured, it extracts key concepts as tags
- If OpenAI and Pinecone are configured, it generates an embedding and stores it in Pinecone

When you search:
- If vector search is available (Pinecone + OpenAI configured), it performs a semantic search
- Otherwise, it falls back to text-based search in local storage
- If Claude is configured, it generates a summary of search results

## Troubleshooting

### Claude API Issues
- Ensure you're using a valid API key
- Check the Claude API dashboard for usage limits
- Verify your account has access to the selected model

### OpenAI Embedding Issues
- Ensure you're using a valid API key
- Check the OpenAI dashboard for usage limits
- Verify the embedding model is available on your plan

### Pinecone Issues
- Verify your index was created with 1536 dimensions
- Check that your environment and index name are correct
- Ensure your Pinecone plan supports your usage patterns

## Fallback Behavior

The application is designed to gracefully degrade functionality:

- If Claude API is unavailable: Tag extraction and summaries won't work
- If OpenAI API is unavailable: Vector embeddings will use random placeholders
- If Pinecone is unavailable: Searches will use local text-based search

This ensures the app remains functional even with limited API access. 