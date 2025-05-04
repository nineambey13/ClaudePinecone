// Test script for Pinecone integration with Claude chat
import { searchKnowledgeBase } from '../lib/enhancedKnowledgeStorage';
import { isPineconeConfigured } from '../lib/pineconeUtils';
import { isEmbeddingConfigured } from '../lib/claudeApi';
import { generateEmbedding } from '../lib/embeddings';

// Check if proxy server is running
const PROXY_URL = import.meta.env.VITE_PINECONE_PROXY_URL || 'http://localhost:3001/api/pinecone';

// Test the Pinecone integration
async function testPineconeIntegration() {
  console.log('🧪 Starting Pinecone Integration Test...');

  // Check if proxy server is running
  try {
    console.log('📋 Checking proxy server...');
    const response = await fetch(PROXY_URL.replace('/api/pinecone', '/health'));
    if (response.ok) {
      console.log('✅ Proxy server is running');
    } else {
      console.error('❌ Proxy server returned an error:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to connect to proxy server. Make sure it is running at:', PROXY_URL);
    console.error('Error details:', error.message);
    return false;
  }

  // Step 1: Check configuration
  console.log('\n📋 Checking configuration...');
  const isPineconeConfig = isPineconeConfigured();
  const isEmbeddingConfig = isEmbeddingConfigured();
  console.log('📊 Pinecone configured:', isPineconeConfig);
  console.log('🔤 Embedding API configured:', isEmbeddingConfig);

  if (!isPineconeConfig || !isEmbeddingConfig) {
    console.error('❌ Pinecone or Embedding API not configured. Please check your environment variables.');
    return false;
  }

  // Step 2: Test embedding generation
  console.log('\n📋 Testing embedding generation...');
  try {
    const testText = 'This is a test query to verify embedding generation.';
    console.log('🔍 Generating embedding for:', testText);
    const embedding = await generateEmbedding(testText);
    console.log('✅ Embedding generated successfully, dimensions:', embedding.length);
    console.log('📊 First 5 values:', embedding.slice(0, 5));
  } catch (error) {
    console.error('❌ Error generating embedding:', error);
    return false;
  }

  // Step 3: Test Pinecone search
  console.log('\n📋 Testing Pinecone search...');
  try {
    const testQuery = 'How to implement authentication in a web application?';
    console.log('🔍 Searching Pinecone for:', testQuery);
    const results = await searchKnowledgeBase(testQuery, true);

    console.log(`✅ Search completed, found ${results.length} results`);

    if (results.length > 0) {
      console.log('\n📄 Top results:');
      results.slice(0, 3).forEach((entry, index) => {
        console.log(`\n--- Result ${index + 1}: ${entry.metadata.title} ---`);
        console.log(`Tags: ${entry.metadata.tags.join(', ')}`);
        console.log(`Content preview: ${entry.content.substring(0, 150)}...`);
      });
    } else {
      console.log('⚠️ No results found. This could be normal if no relevant content exists.');
    }
  } catch (error) {
    console.error('❌ Error searching Pinecone:', error);
    return false;
  }

  console.log('\n🎉 Pinecone integration test completed successfully!');
  return true;
}

// Run the test
testPineconeIntegration().then(success => {
  if (success) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n❌ Some tests failed. Please check the logs above.');
  }
});
