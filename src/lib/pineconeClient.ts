// Browser-compatible Pinecone client
// This is a simplified wrapper around the Pinecone API for browser use

import { getMockPineconeData } from './mockPineconeData';

// Configuration
const PINECONE_API_KEY = import.meta.env.VITE_PINECONE_API_KEY;
const PINECONE_INDEX = import.meta.env.VITE_PINECONE_INDEX;
const PINECONE_ENVIRONMENT = import.meta.env.VITE_PINECONE_ENVIRONMENT;

// Proxy URL - if this is set, we'll use it instead of direct Pinecone access
// This helps avoid CORS issues in the browser
const PROXY_URL = import.meta.env.VITE_PINECONE_PROXY_URL;
console.log('🔍 Pinecone proxy URL:', PROXY_URL || 'Not set - direct API access will be used');

// Check if Pinecone config is available
export const isPineconeConfigured = (): boolean => {
  return !!(PINECONE_API_KEY && PINECONE_INDEX);
};

// Simple browser-compatible Pinecone client
export class PineconeClient {
  private apiKey: string;
  private indexName: string;
  private baseUrl: string;

  constructor(_indexName: string) {
    this.apiKey = PINECONE_API_KEY as string;
    // Always use clarity-opensource as the index name
    this.indexName = 'clarity-opensource';

    // Always use the exact Pinecone host URL for clarity-opensource
    // The correct URL is: https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io

    // Add more detailed logging for debugging
    console.log(`🔍 Setting up Pinecone client for index: clarity-opensource`);

    // Always use the hardcoded URL without the /vectors part
    this.baseUrl = 'https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io';
    console.log(`🔍 Using hardcoded URL: ${this.baseUrl}`);

    console.log(`🔍 Using Pinecone URL: ${this.baseUrl}`);
    console.log(`🔍 Initialized Pinecone client with baseUrl: ${this.baseUrl}`);
  }

  // Query the Pinecone index
  async query(vector: number[], topK: number = 10, includeMetadata: boolean = true, queryText: string = '') {
    try {
      console.log(`🔍 Querying Pinecone index: ${this.indexName}`);
      console.log(`🔍 Query parameters: topK=${topK}, includeMetadata=${includeMetadata}`);

      // Check vector dimensions
      if (vector && Array.isArray(vector)) {
        console.log(`🔍 Vector dimensions: ${vector.length}`);

        // Check if vector contains valid numbers
        const isValidVector = vector.every(val => typeof val === 'number' && !isNaN(val));
        if (!isValidVector) {
          console.error('❌ Vector contains invalid values');
        }
      } else {
        console.error('❌ Vector is not an array or is undefined');
      }

      // Check if we're in development mode
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      // Use mock data in development mode if proxy is not available
      if (isDevelopment && (!PROXY_URL || PROXY_URL === '')) {
        console.log('⚠️ No proxy URL set. Using mock data instead.');
        console.log('⚠️ To use real Pinecone data, set up the proxy server and add VITE_PINECONE_PROXY_URL to your .env file');

        // Return mock data
        return getMockPineconeData(queryText);
      }

      let response: Response;

      // If a proxy URL is available, use it to avoid CORS issues
      if (PROXY_URL) {
        console.log(`🔍 Using proxy for Pinecone query: ${PROXY_URL}`);
        console.log(`🔍 PROXY_URL type: ${typeof PROXY_URL}`);
        console.log(`🔍 PROXY_URL value: "${PROXY_URL}"`);

        try {
          // First check if the proxy server is running
          console.log(`🔍 Checking proxy server health at: ${PROXY_URL.replace('/api/pinecone', '')}/health`);
          const healthCheck = await fetch(`${PROXY_URL.replace('/api/pinecone', '')}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          if (!healthCheck.ok) {
            console.error(`❌ Proxy server health check failed with status: ${healthCheck.status}`);
            throw new Error('Proxy server health check failed');
          }

          console.log('✅ Proxy server is running');

          const proxyEndpoint = `${PROXY_URL}/query`;
          console.log(`🔍 Full proxy endpoint: ${proxyEndpoint}`);

          // Log the request body for debugging (without the full vector)
          const requestBody = {
            indexName: 'clarity-opensource',
            vector,
            topK,
            includeMetadata,
            includeValues: true,
          };

          console.log(`🔍 Request body: ${JSON.stringify({
            ...requestBody,
            vector: `[Array with ${vector.length} elements]`
          })}`);

          response = await fetch(proxyEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          console.log(`🔍 Proxy response status: ${response.status}`);
        } catch (proxyError) {
          console.error('❌ Error connecting to proxy server:', proxyError);

          if (proxyError instanceof Error) {
            console.error('❌ Error message:', proxyError.message);
            console.error('❌ Error stack:', proxyError.stack);
          }

          console.log('⚠️ Falling back to mock data');

          // Return mock data as fallback
          return getMockPineconeData(queryText);
        }
      } else {
        // Direct Pinecone API access (will likely fail in browser due to CORS)
        console.log(`🔍 Directly querying Pinecone API: ${this.baseUrl}/query`);
        console.log('⚠️ This will likely fail due to CORS restrictions');

        try {
          // The correct URL format is the base URL + /query (NOT /vectors/query)
          response = await fetch(`${this.baseUrl}/query`, {
            method: 'POST',
            headers: {
              'Api-Key': this.apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              vector,
              topK,
              includeMetadata,
              includeValues: true,
            }),
          });
        } catch (directError) {
          console.error('❌ Direct Pinecone API access failed:', directError);
          console.log('⚠️ Falling back to mock data');

          // Return mock data as fallback
          return getMockPineconeData(queryText);
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Pinecone API error (${response.status}):`, errorText);

        // Log the request details
        if (PROXY_URL) {
          console.error(`❌ Request URL: ${PROXY_URL}/query`);
          console.error(`❌ Request headers:`, { 'Content-Type': 'application/json' });
          console.error(`❌ Request body:`, {
            indexName: 'clarity-opensource',
            vector: `[Array of ${vector.length} values]`,
            topK,
            includeMetadata,
            includeValues: true
          });
        } else {
          console.error(`❌ Request URL: ${this.baseUrl}/query`);
          console.error(`❌ Request headers:`, { 'Api-Key': '***', 'Content-Type': 'application/json' });
          console.error(`❌ Request body:`, { vector: `[Array of ${vector.length} values]`, topK, includeMetadata, includeValues: true });
        }

        // Try to parse the error text as JSON for more details
        try {
          const errorJson = JSON.parse(errorText);
          console.error('❌ Parsed error details:', errorJson);
        } catch (e) {
          // Not JSON, just use the text
        }

        throw new Error(`Pinecone API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ Pinecone query successful, matches: ${data.matches?.length || 0}`);

      return data;
    } catch (error) {
      console.error('❌ Error querying Pinecone:', error);

      // More detailed error logging
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);

        // Check for specific error types
        if (error.message.includes('Failed to fetch')) {
          console.error('❌ Network error - check your Pinecone URL and network connection');
          console.error('❌ Attempted URL:', `${this.baseUrl}/query`);
        } else if (error.message.includes('authentication') || error.message.includes('401')) {
          console.error('❌ Authentication error - check your Pinecone API key');
        } else if (error.message.includes('not found') || error.message.includes('404')) {
          console.error('❌ Index not found - check your Pinecone index name');
        }
      }

      throw error;
    }
  }

  // Upsert vectors to the Pinecone index
  async upsert(vectors: Array<{id: string, values: number[], metadata: any}>) {
    try {
      console.log(`🔍 Upserting ${vectors.length} vectors to Pinecone index: ${this.indexName}`);

      let response: Response;

      // If a proxy URL is available, use it to avoid CORS issues
      if (PROXY_URL) {
        console.log(`🔍 Using proxy for Pinecone upsert: ${PROXY_URL}`);

        response = await fetch(`${PROXY_URL}/upsert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Always use clarity-opensource as the index name
            indexName: 'clarity-opensource',
            vectors,
          }),
        });
      } else {
        // Direct Pinecone API access (will likely fail in browser due to CORS)
        console.log(`🔍 Directly upserting to Pinecone API: ${this.baseUrl}/upsert`);

        // The correct URL format is the base URL + /upsert (NOT /vectors/upsert)
        response = await fetch(`${this.baseUrl}/upsert`, {
          method: 'POST',
          headers: {
            'Api-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vectors,
          }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Pinecone API error (${response.status}):`, errorText);
        console.error(`❌ Request URL: ${this.baseUrl}/upsert`);
        console.error(`❌ Request headers:`, { 'Api-Key': '***', 'Content-Type': 'application/json' });
        console.error(`❌ Request body:`, { vectors: '[...]' });
        throw new Error(`Pinecone API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Pinecone upsert successful');

      return data;
    } catch (error) {
      console.error('❌ Error upserting to Pinecone:', error);

      // More detailed error logging
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);

        // Check for specific error types
        if (error.message.includes('Failed to fetch')) {
          console.error('❌ Network error - check your Pinecone URL and network connection');
          console.error('❌ Attempted URL:', `${this.baseUrl}/upsert`);
        } else if (error.message.includes('authentication') || error.message.includes('401')) {
          console.error('❌ Authentication error - check your Pinecone API key');
        } else if (error.message.includes('not found') || error.message.includes('404')) {
          console.error('❌ Index not found - check your Pinecone index name');
        }
      }

      throw error;
    }
  }

  // Delete vectors from the Pinecone index
  async delete(ids: string[]) {
    try {
      console.log(`🔍 Deleting ${ids.length} vectors from Pinecone index: ${this.indexName}`);

      let response: Response;

      // If a proxy URL is available, use it to avoid CORS issues
      if (PROXY_URL) {
        console.log(`🔍 Using proxy for Pinecone delete: ${PROXY_URL}`);

        response = await fetch(`${PROXY_URL}/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Always use clarity-opensource as the index name
            indexName: 'clarity-opensource',
            ids,
          }),
        });
      } else {
        // Direct Pinecone API access (will likely fail in browser due to CORS)
        console.log(`🔍 Directly deleting from Pinecone API: ${this.baseUrl}/delete`);

        // The correct URL format is the base URL + /delete (NOT /vectors/delete)
        response = await fetch(`${this.baseUrl}/delete`, {
          method: 'POST',
          headers: {
            'Api-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ids,
          }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Pinecone API error (${response.status}):`, errorText);
        console.error(`❌ Request URL: ${this.baseUrl}/delete`);
        console.error(`❌ Request headers:`, { 'Api-Key': '***', 'Content-Type': 'application/json' });
        console.error(`❌ Request body:`, { ids: '[...]' });
        throw new Error(`Pinecone API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Pinecone delete successful');

      return data;
    } catch (error) {
      console.error('❌ Error deleting from Pinecone:', error);

      // More detailed error logging
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);

        // Check for specific error types
        if (error.message.includes('Failed to fetch')) {
          console.error('❌ Network error - check your Pinecone URL and network connection');
          console.error('❌ Attempted URL:', `${this.baseUrl}/delete`);
        } else if (error.message.includes('authentication') || error.message.includes('401')) {
          console.error('❌ Authentication error - check your Pinecone API key');
        } else if (error.message.includes('not found') || error.message.includes('404')) {
          console.error('❌ Index not found - check your Pinecone index name');
        }
      }

      throw error;
    }
  }
}

// Initialize a Pinecone client
export const initPineconeClient = (): PineconeClient | null => {
  if (!isPineconeConfigured()) {
    console.warn('Pinecone is not configured. Using local storage instead.');
    return null;
  }

  try {
    console.log('🔍 Creating Pinecone client');
    console.log('🔍 API Key available:', !!PINECONE_API_KEY);
    console.log('🔍 Index name:', PINECONE_INDEX);
    console.log('🔍 Environment:', PINECONE_ENVIRONMENT || 'default');

    // Always use clarity-opensource as the index name
    return new PineconeClient('clarity-opensource');
  } catch (error) {
    console.error('❌ Error initializing Pinecone client:', error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);

      // Check for specific error types
      if (error.message.includes('PINECONE_API_KEY')) {
        console.error('❌ API Key error - check your PINECONE_API_KEY environment variable');
      } else if (error.message.includes('PINECONE_INDEX')) {
        console.error('❌ Index error - check your PINECONE_INDEX environment variable');
      } else if (error.message.includes('global is not defined')) {
        console.error('❌ Browser compatibility error - the Pinecone SDK is not compatible with browser environments');
        console.error('❌ This is a known issue with the Pinecone SDK. Our custom client should handle this.');
      } else if (error.message.includes('invalid properties: environment')) {
        console.error('❌ SDK version error - the Pinecone SDK no longer accepts the environment parameter');
        console.error('❌ This is a breaking change in the Pinecone SDK. Our custom client should handle this.');
      }
    }

    return null;
  }
};
