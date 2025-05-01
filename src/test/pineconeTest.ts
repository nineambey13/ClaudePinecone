import { generateEmbedding } from '../lib/embeddings.js';
import { upsertVectors, querySimilar, deleteVectors } from '../lib/pinecone.js';
import { config } from '../lib/config.js';

async function testPineconeConnection() {
  console.log('Starting test with config:', {
    hasClaudeKey: !!config.claude.apiKey,
    claudeModel: config.claude.model,
    hasPineconeKey: !!config.pinecone.apiKey,
    pineconeEnv: config.pinecone.environment,
    pineconeIndex: config.pinecone.index
  });

  try {
    // Test embedding generation
    console.log('\nStep 1: Testing embedding generation...');
    const testText = 'This is a test message to verify Pinecone integration.';
    let embedding;
    try {
      embedding = await generateEmbedding(testText);
      console.log('✓ Successfully generated embedding of length:', embedding.length);
    } catch (embedError) {
      console.error('× Failed to generate embedding:', embedError);
      if (embedError instanceof Error) {
        console.error('Embedding error details:', {
          message: embedError.message,
          stack: embedError.stack
        });
      }
      throw embedError;
    }

    // Test vector upsert
    console.log('\nStep 2: Testing vector upsert...');
    const testVector = {
      id: 'test-' + Date.now(),
      values: embedding,
      metadata: {
        text: testText,
        timestamp: Date.now(),
        chatId: 'test-chat',
        role: 'user' as const
      }
    };
    
    try {
      const upsertResponse = await upsertVectors([testVector]);
      console.log('✓ Successfully upserted vector:', upsertResponse);
    } catch (upsertError) {
      console.error('× Failed to upsert vector:', upsertError);
      if (upsertError instanceof Error) {
        console.error('Upsert error details:', {
          message: upsertError.message,
          stack: upsertError.stack
        });
      }
      throw upsertError;
    }

    // Test vector query
    console.log('\nStep 3: Testing vector query...');
    try {
      const queryResponse = await querySimilar(embedding, 1);
      console.log('✓ Successfully queried similar vectors:', queryResponse);
    } catch (queryError) {
      console.error('× Failed to query vectors:', queryError);
      if (queryError instanceof Error) {
        console.error('Query error details:', {
          message: queryError.message,
          stack: queryError.stack
        });
      }
      throw queryError;
    }

    // Clean up test vector
    console.log('\nStep 4: Cleaning up test vector...');
    try {
      await deleteVectors([testVector.id]);
      console.log('✓ Successfully deleted test vector');
    } catch (deleteError) {
      console.error('× Failed to delete vector:', deleteError);
      if (deleteError instanceof Error) {
        console.error('Delete error details:', {
          message: deleteError.message,
          stack: deleteError.stack
        });
      }
      throw deleteError;
    }

    console.log('\n✓ All Pinecone operations completed successfully!');
  } catch (error) {
    console.error('\n× Test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    process.exit(1);
  }
}

// Run the test
testPineconeConnection(); 