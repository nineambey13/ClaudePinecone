// Simple test script to verify Pinecone API connection
require('dotenv').config();
const fetch = require('node-fetch');

// Get API key from environment
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

// Log API key (partially masked)
if (PINECONE_API_KEY) {
  const maskedKey = `${PINECONE_API_KEY.substring(0, 5)}...${PINECONE_API_KEY.substring(PINECONE_API_KEY.length - 5)}`;
  console.log(`Pinecone API key loaded: ${maskedKey}`);
} else {
  console.error('WARNING: Pinecone API key not found in environment variables');
  process.exit(1);
}

// Test function
async function testPineconeConnection() {
  console.log('Testing Pinecone API connection...');
  
  // The exact URL for the Pinecone API
  const url = 'https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io';
  
  try {
    // First, try a simple GET request to the base URL
    console.log(`Testing GET request to: ${url}`);
    const getResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Api-Key': PINECONE_API_KEY
      }
    });
    
    console.log('GET Response status:', getResponse.status);
    console.log('GET Response headers:', getResponse.headers.raw());
    
    const getText = await getResponse.text();
    console.log('GET Response text:', getText);
    
    // Now try a POST request to the query endpoint
    console.log(`\nTesting POST request to: ${url}/vectors/query`);
    
    // Create a simple test vector (384 dimensions with random values)
    const testVector = Array(384).fill(0).map(() => Math.random());
    
    const postResponse = await fetch(`${url}/vectors/query`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vector: testVector,
        topK: 1,
        includeMetadata: true
      })
    });
    
    console.log('POST Response status:', postResponse.status);
    console.log('POST Response headers:', postResponse.headers.raw());
    
    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('POST Response data:', JSON.stringify(postData, null, 2));
    } else {
      const postText = await postResponse.text();
      console.log('POST Response text:', postText);
    }
    
  } catch (error) {
    console.error('Error testing Pinecone connection:', error);
  }
}

// Run the test
testPineconeConnection()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err));
