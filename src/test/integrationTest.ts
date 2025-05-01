import { generateEmbedding, generateEmbeddings } from '../lib/embeddings';
import { upsertVectors, querySimilar, deleteVectors } from '../lib/pinecone';
import { storeChatMessage, storeChatMessages, querySimilarMessages, deleteMessages } from '../lib/chatVectorStore';

async function runIntegrationTests() {
  console.log('🧪 Starting Integration Tests...\n');

  // Test 1: Embedding Generation
  console.log('📝 Testing Embedding Generation...');
  try {
    const testText = 'This is a test message for embedding generation.';
    const embedding = await generateEmbedding(testText);
    console.log('✅ Single embedding generation successful');
    console.log(`   Dimensions: ${embedding.length}`);
    console.log(`   Sample values: ${embedding.slice(0, 3).join(', ')}...\n`);
  } catch (error) {
    console.error('❌ Single embedding generation failed:', error);
  }

  // Test 2: Batch Embedding Generation
  console.log('📦 Testing Batch Embedding Generation...');
  try {
    const testMessages = [
      'First test message',
      'Second test message',
      'Third test message'
    ];
    const embeddings = await generateEmbeddings(testMessages);
    console.log('✅ Batch embedding generation successful');
    console.log(`   Number of embeddings: ${embeddings.length}`);
    console.log(`   All dimensions correct: ${embeddings.every(e => e.length === 384)}\n`);
  } catch (error) {
    console.error('❌ Batch embedding generation failed:', error);
  }

  // Test 3: Pinecone Integration
  console.log('🌲 Testing Pinecone Integration...');
  try {
    const testMessage = 'Testing Pinecone vector storage';
    const embedding = await generateEmbedding(testMessage);
    const vectorId = `test-${Date.now()}`;
    
    // Test upsert
    await upsertVectors([{
      id: vectorId,
      values: embedding,
      metadata: { text: testMessage }
    }]);
    console.log('✅ Vector upsert successful');

    // Test query
    const queryResult = await querySimilar(embedding, 1);
    console.log('✅ Vector query successful');
    console.log(`   Found ${queryResult.matches.length} matches\n`);

    // Cleanup
    await deleteVectors([vectorId]);
    console.log('✅ Vector deletion successful\n');
  } catch (error) {
    console.error('❌ Pinecone integration failed:', error);
  }

  // Test 4: Chat Vector Store
  console.log('💬 Testing Chat Vector Store...');
  try {
    const chatId = `test-chat-${Date.now()}`;
    const testMessages = [
      { role: 'user', content: 'Hello, how are you?' },
      { role: 'assistant', content: 'I am doing well, thank you!' }
    ];

    // Test storing messages
    await storeChatMessages(chatId, testMessages);
    console.log('✅ Message storage successful');

    // Test querying similar messages
    const queryResult = await querySimilarMessages('how are you', 1);
    console.log('✅ Similar message query successful');
    console.log(`   Found ${queryResult.matches.length} matches\n`);

    // Test message deletion
    await deleteMessages(chatId);
    console.log('✅ Message deletion successful\n');
  } catch (error) {
    console.error('❌ Chat vector store failed:', error);
  }

  console.log('✨ Integration tests completed!');
}

// Run the tests
runIntegrationTests().catch(console.error); 