// Test script for Pinecone integration with Claude chat
import { searchKnowledgeBase } from '../lib/enhancedKnowledgeStorage.js';
import { isPineconeConfigured } from '../lib/pineconeUtils.js';
import { isEmbeddingConfigured } from '../lib/claudeApi.js';

async function testPineconeIntegration() {
  console.log('🧪 Testing Pinecone integration with Claude chat...');

  // Check if Pinecone and embedding API are configured
  const isPineconeConfig = isPineconeConfigured();
  const isEmbeddingConfig = isEmbeddingConfigured();
  
  console.log('📊 Pinecone configured:', isPineconeConfig);
  console.log('🔤 Embedding API configured:', isEmbeddingConfig);
  
  const canUseVectorSearch = isPineconeConfig && isEmbeddingConfig;
  console.log('🔎 Can use vector search:', canUseVectorSearch);

  if (!canUseVectorSearch) {
    console.log('❌ Pinecone or embedding API not configured. Please check your environment variables.');
    console.log('Required environment variables:');
    console.log('- VITE_PINECONE_API_KEY');
    console.log('- VITE_PINECONE_ENVIRONMENT');
    console.log('- VITE_PINECONE_INDEX');
    console.log('- VITE_OPENAI_API_KEY (for embeddings)');
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
    console.log(`\n🔍 Searching for: "${query}"`);
    try {
      console.time('Search time');
      const results = await searchKnowledgeBase(query, true);
      console.timeEnd('Search time');
      
      console.log(`✅ Found ${results.length} results`);

      if (results.length > 0) {
        console.log('📄 Top results:');
        results.slice(0, 3).forEach((result, index) => {
          console.log(`\n--- Result ${index + 1} ---`);
          console.log(`Title: ${result.metadata.title}`);
          console.log(`Type: ${result.metadata.type}`);
          console.log(`Tags: ${result.metadata.tags.join(', ')}`);
          console.log(`Content preview: ${result.content.substring(0, 100)}...`);
        });
      } else {
        console.log('⚠️ No results found. This could indicate an issue with the Pinecone configuration or that there is no relevant content in the index.');
      }
    } catch (error) {
      console.error('❌ Error searching knowledge base:', error);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
    }
  }
}

// Run the test
console.log('🚀 Starting Pinecone integration test...');
testPineconeIntegration()
  .then(() => console.log('✅ Test completed'))
  .catch(error => {
    console.error('❌ Test failed with error:', error);
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
  });
