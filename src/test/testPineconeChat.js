// Test script for Pinecone integration with Claude chat
import { searchKnowledgeBase } from '../lib/enhancedKnowledgeStorage.js';
import { isPineconeConfigured } from '../lib/pineconeUtils.js';
import { isEmbeddingConfigured } from '../lib/claudeApi.js';

async function testPineconeChatIntegration() {
  console.log('Testing Pinecone integration with Claude chat...');

  // Check if Pinecone and embedding API are configured
  const canUseVectorSearch = isPineconeConfigured() && isEmbeddingConfigured();
  console.log('Vector search available:', canUseVectorSearch);

  if (!canUseVectorSearch) {
    console.log('Pinecone or embedding API not configured. Please check your environment variables.');
    return;
  }

  // Test queries
  const testQueries = [
    'What is the best way to implement a React component?',
    'How do I use TypeScript with React?',
    'Tell me about database optimization',
    'What are the best practices for mobile UI design?'
  ];

  for (const query of testQueries) {
    console.log(`\nSearching for: "${query}"`);
    try {
      const results = await searchKnowledgeBase(query, true);
      console.log(`Found ${results.length} results`);

      if (results.length > 0) {
        console.log('Top result:');
        console.log(`- Title: ${results[0].metadata.title}`);
        console.log(`- Type: ${results[0].metadata.type}`);
        console.log(`- Tags: ${results[0].metadata.tags.join(', ')}`);
        console.log(`- Content preview: ${results[0].content.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error('Error searching knowledge base:', error);
    }
  }
}

// Run the test
testPineconeChatIntegration().catch(console.error);
