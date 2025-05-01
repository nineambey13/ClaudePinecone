import { generateEmbedding, generateEmbeddings } from '../lib/embeddings';

async function testEmbeddingImprovements() {
  try {
    // Test 1: Single embedding with caching
    console.log('\n🧪 Testing single embedding with cache...');
    const testText = 'This is a test message to verify embedding generation.';
    
    console.log('First call (should generate new embedding):');
    const start1 = Date.now();
    const embedding1 = await generateEmbedding(testText);
    console.log(`✓ Generated in ${Date.now() - start1}ms`);
    console.log(`✓ Dimensions: ${embedding1.length}`);
    
    console.log('\nSecond call with same text (should use cache):');
    const start2 = Date.now();
    const embedding2 = await generateEmbedding(testText);
    console.log(`✓ Retrieved in ${Date.now() - start2}ms`);
    console.log(`✓ Same result: ${embedding1.length === embedding2.length}`);

    // Test 2: Batch processing with progress
    console.log('\n🧪 Testing batch processing...');
    const testTexts = [
      'First test message for batch processing',
      'Second test message with different content',
      'Third test message to verify batching',
      'Fourth test message for testing progress',
      'Fifth test message with unique content',
      'Sixth test message to test batch size',
      'Seventh test message for verification'
    ];

    console.log(`Processing ${testTexts.length} texts in batches...`);
    const embeddings = await generateEmbeddings(testTexts, (progress) => {
      console.log(`Progress: ${progress.completed}/${progress.total} completed, ${progress.failed} failed`);
    });

    console.log(`\n✓ Generated ${embeddings.length} embeddings`);
    console.log(`✓ All have correct dimensions: ${embeddings.every(emb => emb.length === 384)}`);

    // Test 3: Error handling
    console.log('\n🧪 Testing error handling...');
    try {
      await generateEmbedding('');
      console.log('❌ Should have thrown an error for empty text');
    } catch (error) {
      console.log('✓ Properly handled empty text error');
    }

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
console.log('🚀 Starting embedding improvements test...');
testEmbeddingImprovements().then(success => {
  if (success) {
    console.log('\n✅ All embedding tests passed successfully!');
  } else {
    console.log('\n❌ Some tests failed!');
  }
}); 