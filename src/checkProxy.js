// Simple script to check if the proxy server is running
const fetch = require('node-fetch');

const PROXY_URL = process.env.VITE_PINECONE_PROXY_URL || 'http://localhost:3001/api/pinecone';

async function checkProxy() {
  try {
    console.log(`Checking proxy server at: ${PROXY_URL.replace('/api/pinecone', '')}/health`);
    
    const response = await fetch(`${PROXY_URL.replace('/api/pinecone', '')}/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Proxy server is running:', data);
      return true;
    } else {
      console.error(`Proxy server returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Error connecting to proxy server:', error.message);
    console.log('');
    console.log('Please make sure the proxy server is running:');
    console.log('1. Navigate to src/server');
    console.log('2. Run: npm install (if you haven\'t already)');
    console.log('3. Run: npm start');
    console.log('');
    console.log('Then try again.');
    return false;
  }
}

checkProxy();

module.exports = { checkProxy };
