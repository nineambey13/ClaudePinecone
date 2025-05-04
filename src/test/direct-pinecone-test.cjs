// Direct Pinecone API test without using the server
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Function to load API key from .env file
function loadApiKey() {
  try {
    // Get the project root directory
    const projectRoot = process.cwd();
    console.log('Project root directory:', projectRoot);

    // Try to load from src/server/.env
    const serverEnvPath = path.resolve(projectRoot, 'src/server/.env');
    if (fs.existsSync(serverEnvPath)) {
      console.log('Found .env file at:', serverEnvPath);
      const envContent = fs.readFileSync(serverEnvPath, 'utf8');
      const match = envContent.match(/PINECONE_API_KEY=([^\r\n]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Try to load from src/pages/.env
    const pagesEnvPath = path.resolve(projectRoot, 'src/pages/.env');
    if (fs.existsSync(pagesEnvPath)) {
      console.log('Found .env file at:', pagesEnvPath);
      const envContent = fs.readFileSync(pagesEnvPath, 'utf8');
      const match = envContent.match(/PINECONE_API_KEY=([^\r\n]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Try to load from root .env
    const rootEnvPath = path.resolve(projectRoot, '.env');
    if (fs.existsSync(rootEnvPath)) {
      console.log('Found .env file at:', rootEnvPath);
      const envContent = fs.readFileSync(rootEnvPath, 'utf8');
      const match = envContent.match(/VITE_PINECONE_API_KEY=([^\r\n]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }

    console.error('Could not find API key in any .env file');
    return null;
  } catch (error) {
    console.error('Error loading API key:', error);
    return null;
  }
}

async function testPineconeDirectly() {
  console.log('Testing Pinecone API directly');
  console.log('Current working directory:', process.cwd());

  // Load API key
  const apiKey = loadApiKey();
  if (!apiKey) {
    console.error('No API key found. Cannot proceed with test.');
    return;
  }

  console.log('API key loaded:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5));

  // Create a test vector (384 dimensions with random values)
  const testVector = Array(384).fill(0).map(() => Math.random());

  // The exact URL for the Pinecone API
  // Use the base URL without the /vectors/query path
  const baseUrl = 'https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io';
  const url = `${baseUrl}/query`;

  try {
    console.log('Sending request to Pinecone API...');
    console.log('URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vector: testVector,
        topK: 10,
        includeMetadata: true,
        includeValues: true
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
      console.log('Test successful!');
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);

      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        // Not JSON
      }

      console.error('Test failed!');
    }
  } catch (error) {
    console.error('Error during test:', error);
    console.error('Test failed!');
  }
}

// Run the test
testPineconeDirectly();
