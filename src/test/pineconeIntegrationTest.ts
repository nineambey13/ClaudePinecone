import { Message } from '@/contexts/ChatContext';
import { storeChatMessage, storeChatMessages, querySimilarMessages, deleteMessages, deleteMessagesByChat } from '../lib/chatVectorStore';

async function testPineconeIntegration() {
  try {
    console.log('🚀 Starting Pinecone integration test...\n');

    // Test data
    const chatId = 'test-chat-' + Date.now();
    const message1: Message = {
      id: 'msg1',
      content: 'This is a test message about artificial intelligence.',
      role: 'user',
      timestamp: new Date()
    };
    const message2: Message = {
      id: 'msg2',
      content: 'AI has many applications in modern technology.',
      role: 'assistant',
      timestamp: new Date()
    };
    const message3: Message = {
      id: 'msg3',
      content: 'Machine learning is a subset of artificial intelligence.',
      role: 'user',
      timestamp: new Date()
    };

    // Test 1: Store single message
    console.log('🧪 Testing single message storage...');
    await storeChatMessage(message1, chatId);
    console.log('✓ Stored single message\n');

    // Test 2: Query similar messages
    console.log('🧪 Testing message query...');
    const queryResults = await querySimilarMessages('Tell me about AI', 5, { chatId });
    console.log(`✓ Found ${queryResults.matches.length} similar messages`);
    console.log('Top match:', queryResults.matches[0]?.metadata?.text || 'No matches');
    console.log('Score:', queryResults.matches[0]?.score || 'N/A', '\n');

    // Test 3: Store multiple messages
    console.log('🧪 Testing batch message storage...');
    await storeChatMessages([message2, message3], chatId);
    console.log('✓ Stored batch messages\n');

    // Test 4: Query with filter by role
    console.log('🧪 Testing filtered query...');
    const userMessages = await querySimilarMessages('AI', 5, { chatId, role: 'user' });
    console.log(`✓ Found ${userMessages.matches.length} user messages\n`);

    // Test 5: Delete specific message
    console.log('🧪 Testing message deletion...');
    await deleteMessages([message1.id]);
    console.log('✓ Deleted specific message\n');

    // Test 6: Delete all chat messages
    console.log('🧪 Testing chat cleanup...');
    await deleteMessagesByChat(chatId);
    console.log('✓ Cleaned up test chat messages');

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
console.log('📝 Pinecone Integration Test');
console.log('This test will verify the integration between embeddings and Pinecone\n');

testPineconeIntegration().then(success => {
  if (success) {
    console.log('\n✅ All Pinecone integration tests completed successfully!');
  } else {
    console.log('\n❌ Some tests failed!');
  }
}); 