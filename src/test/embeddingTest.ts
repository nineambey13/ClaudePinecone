import { generateEmbedding, generateEmbeddings } from '../lib/embeddings';

async function testEmbeddings() {
  try {
    console.log('Testing single embedding generation...');
    const testText = 'This is a test message to verify embedding generation.';
    const embedding = await generateEmbedding(testText);
    
    console.log('Embedding generated successfully!');
    console.log(`Embedding dimensions: ${embedding.length}`);
    console.log('First 5 values:', embedding.slice(0, 5));
    
    console.log('\nTesting batch embedding generation...');
    const testTexts = [
      'First test message',
      'Second test message',
      'Third test message with different content',
      'Fourth test message to verify batch processing'
    ];
    
    const embeddings = await generateEmbeddings(testTexts);
    console.log('Batch embeddings generated successfully!');
    console.log(`Number of embeddings: ${embeddings.length}`);
    console.log(`Each embedding dimensions: ${embeddings[0].length}`);
    
    // Verify all embeddings have the correct dimensions
    const allValid = embeddings.every(emb => emb.length === 384);
    console.log('All embeddings have correct dimensions:', allValid);
    
    return true;
  } catch (error) {
    console.error('Error in embedding test:', error);
    return false;
  }
}

// Run the test
testEmbeddings().then(success => {
  if (success) {
    console.log('\n✅ Embedding tests passed successfully!');
  } else {
    console.log('\n❌ Embedding tests failed!');
  }
}); 