// Test script for Claude integration with Pinecone
import { ClaudeApi } from '../lib/api/claude';
import { searchKnowledgeBase } from '../lib/enhancedKnowledgeStorage';
import { config } from '../lib/config';

// Check if proxy server is running
const PROXY_URL = import.meta.env.VITE_PINECONE_PROXY_URL || 'http://localhost:3001/api/pinecone';

async function testClaudePineconeIntegration() {
  console.log('🧪 Starting Claude-Pinecone integration test');
  console.log('📊 Environment:');
  console.log('- Claude API Key available:', !!config.claude.apiKey);
  console.log('- Claude Model:', config.claude.model || 'claude-3-7-sonnet-20250219');
  console.log('- Pinecone API Key available:', !!config.pinecone.apiKey);
  console.log('- Pinecone Index:', config.pinecone.index);
  console.log('- Pinecone Proxy URL:', PROXY_URL);

  // Step 1: Initialize Claude API
  console.log('\n📋 Initializing Claude API...');
  if (!config.claude.apiKey) {
    console.error('❌ Claude API key not configured. Please check your environment variables.');
    return false;
  }

  const claudeApi = new ClaudeApi(
    config.claude.apiKey,
    config.claude.model || 'claude-3-7-sonnet-20250219'
  );
  console.log('✅ Claude API initialized with model:', config.claude.model || 'claude-3-7-sonnet-20250219');

  // Step 2: Search Pinecone for knowledge
  console.log('\n📋 Searching Pinecone for knowledge...');
  const testQuery = 'How to implement authentication in a web application?';
  console.log('🔍 Query:', testQuery);

  let relatedKnowledge = [];
  try {
    relatedKnowledge = await searchKnowledgeBase(testQuery, true);
    console.log(`✅ Found ${relatedKnowledge.length} relevant entries in Pinecone`);

    if (relatedKnowledge.length === 0) {
      console.log('⚠️ No knowledge found in Pinecone. Test will continue with a basic query.');
    } else {
      // Log the found entries
      relatedKnowledge.forEach((entry, index) => {
        console.log(`\n📄 Entry ${index + 1}:`);
        console.log(`   Title: ${entry.metadata.title}`);
        console.log(`   Type: ${entry.metadata.type}`);
        console.log(`   Tags: ${entry.metadata.tags.join(', ')}`);
        console.log(`   Content preview: ${entry.content.substring(0, 100)}...`);
      });
    }
  } catch (error) {
    console.error('❌ Error searching Pinecone:', error);
    console.log('⚠️ Continuing test with empty knowledge...');
  }

  // Step 3: Format knowledge for Claude
  console.log('\n📋 Formatting knowledge for Claude...');
  let enhancedPrompt = testQuery;

  if (relatedKnowledge.length > 0) {
    // Format the knowledge to include in the prompt
    let knowledgeContext = "\n\n<knowledge_base>\n";

    relatedKnowledge.forEach((entry, index) => {
      knowledgeContext += `\n<entry id="${index + 1}">\n`;
      knowledgeContext += `<title>${entry.metadata.title}</title>\n`;
      knowledgeContext += `<content>${entry.content}</content>\n`;
      knowledgeContext += `</entry>\n`;
    });

    knowledgeContext += "\n</knowledge_base>\n\nI've provided information from my knowledge base above. Please use this information to help answer the user's question. If the information doesn't fully address the question, please say so and answer to the best of your ability.\n\nUser's question: ";

    // Add the knowledge context to the user's message
    enhancedPrompt = knowledgeContext + testQuery;
    console.log('✅ Enhanced prompt created with knowledge context');
    console.log('📝 Preview:', enhancedPrompt.substring(0, 200) + '...');
  } else {
    console.log('⚠️ Using basic prompt without knowledge context');
  }

  // Step 4: Send to Claude and get response
  console.log('\n📋 Sending to Claude...');
  try {
    const messages = [
      {
        role: 'user',
        content: enhancedPrompt
      }
    ];

    console.log('🔍 Sending message to Claude...');
    let fullResponse = '';

    await claudeApi.streamChat(
      { messages },
      (chunk) => {
        fullResponse += chunk;
        // Print progress dots
        process.stdout.write('.');
      },
      (error) => {
        console.error('\n❌ Stream error:', error);
      }
    );

    console.log('\n\n✅ Claude response received:');
    console.log('\n------- CLAUDE RESPONSE -------');
    console.log(fullResponse);
    console.log('-------------------------------');

    // Check if the response seems to use the knowledge
    const usedKnowledge = relatedKnowledge.length > 0 &&
      relatedKnowledge.some(entry =>
        fullResponse.toLowerCase().includes(entry.metadata.title.toLowerCase()) ||
        entry.metadata.tags.some(tag => fullResponse.toLowerCase().includes(tag.toLowerCase()))
      );

    console.log('\n📊 Analysis:');
    console.log('   Response length:', fullResponse.length, 'characters');
    console.log('   Appears to use knowledge:', usedKnowledge ? 'Yes ✅' : 'No ⚠️');

    return true;
  } catch (error) {
    console.error('❌ Error getting Claude response:', error);
    return false;
  }
}

// Run the test
testClaudePineconeIntegration()
  .then(success => {
    console.log('\n🧪 Test completed:', success ? 'SUCCESS ✅' : 'FAILED ❌');
  })
  .catch(error => {
    console.error('\n🧪 Test error:', error);
    console.log('FAILED ❌');
  });
