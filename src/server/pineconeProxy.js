// Server-side proxy for Pinecone API calls
// This file should be deployed to a server environment, not run in the browser

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const router = express.Router();

// Load environment variables directly in this file as well
dotenv.config();

// Environment variables
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT || 'us-east-1';

// Log API key status (partially hidden for security)
if (PINECONE_API_KEY) {
  const maskedKey = `${PINECONE_API_KEY.substring(0, 5)}...${PINECONE_API_KEY.substring(PINECONE_API_KEY.length - 5)}`;
  console.log(`Pinecone API key loaded: ${maskedKey}`);
  console.log(`Pinecone API key length: ${PINECONE_API_KEY.length}`);
  console.log(`Pinecone environment: ${PINECONE_ENVIRONMENT}`);
  console.log(`Current working directory: ${process.cwd()}`);
  console.log(`Environment variables: ${JSON.stringify(process.env.NODE_ENV || 'not set')}`);
} else {
  console.error('WARNING: Pinecone API key not found in environment variables');
  console.error('Make sure you have a .env file in the src/server directory with PINECONE_API_KEY=your_api_key');
  console.error(`Current working directory: ${process.cwd()}`);
  console.error(`Environment variables loaded: ${Object.keys(process.env).length}`);
  console.error(`Dotenv path: ${require.resolve('dotenv')}`);
}

// Enable CORS for all routes
router.use(cors());

// Middleware to check if Pinecone is configured
const checkPineconeConfig = (req, res, next) => {
  console.log('checkPineconeConfig middleware called');
  console.log('req.pineconeApiKey:', req.pineconeApiKey ? `${req.pineconeApiKey.substring(0, 5)}...` : 'not set');
  console.log('PINECONE_API_KEY:', PINECONE_API_KEY ? `${PINECONE_API_KEY.substring(0, 5)}...` : 'not set');
  console.log('router.apiKey:', router.apiKey ? `${router.apiKey.substring(0, 5)}...` : 'not set');

  // Try to get the API key from multiple sources
  let apiKey = req.pineconeApiKey || PINECONE_API_KEY || router.apiKey;

  // If still not found, try to load from environment directly
  if (!apiKey) {
    console.log('API key not found in expected locations, trying environment directly');
    apiKey = process.env.PINECONE_API_KEY;
    console.log('Direct from process.env:', apiKey ? `${apiKey.substring(0, 5)}...` : 'not found');
  }

  // If still not found, try to load from .env file directly
  if (!apiKey) {
    console.log('API key not found in environment, trying to load from .env file directly');
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(process.cwd(), 'src/server/.env');
      console.log('Looking for .env file at:', envPath);

      if (fs.existsSync(envPath)) {
        console.log('.env file exists');
        const envContent = fs.readFileSync(envPath, 'utf8');
        console.log('.env file content length:', envContent.length);

        const match = envContent.match(/PINECONE_API_KEY=([^\r\n]+)/);
        if (match && match[1]) {
          apiKey = match[1];
          console.log('Found API key in .env file:', apiKey.substring(0, 5) + '...');
        } else {
          console.log('API key not found in .env file content');
        }
      } else {
        console.log('.env file does not exist at:', envPath);
      }
    } catch (e) {
      console.error('Error reading .env file:', e);
    }
  }

  if (!apiKey) {
    console.error('No Pinecone API key found in any location');
    return res.status(500).json({ error: 'Pinecone API key not configured' });
  }

  // Store the API key in the request for later use
  req.pineconeApiKey = apiKey;
  console.log('Using Pinecone API key:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5));
  next();
};

// Query endpoint
router.post('/query', checkPineconeConfig, async (req, res) => {
  try {
    const { indexName, vector, topK = 5, includeMetadata = true, includeValues = true } = req.body;

    console.log('Request body:', req.body);

    if (!indexName) {
      console.error('Index name is missing from request body');
      return res.status(400).json({ error: 'Index name is required' });
    }

    console.log('Using index name:', indexName);

    if (!vector || !Array.isArray(vector)) {
      console.error('Vector is not an array:', vector);
      return res.status(400).json({ error: 'Vector must be an array of numbers' });
    }

    // Check vector dimensions
    console.log(`Vector dimensions: ${vector.length}`);

    // Check if vector contains valid numbers
    const isValidVector = vector.every(val => typeof val === 'number' && !isNaN(val));
    if (!isValidVector) {
      console.error('Vector contains invalid values');
      return res.status(400).json({ error: 'Vector must contain only valid numbers' });
    }

    // Construct the Pinecone API URL
    let url;

    // ALWAYS use the hardcoded URL for clarity-opensource index
    // The exact URL is: https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io
    console.log('Using hardcoded URL for Pinecone');

    // Make sure we're using the exact URL format
    // The correct URL is just the base URL without the /vectors/query part
    url = 'https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io';

    console.log('Using exact URL for Pinecone:', url);

    // Double check the URL
    console.log('Final URL:', url);

    console.log(`Proxying query to Pinecone: ${url}`);

    let response;

    try {
      // Make sure we have the API key
      if (!req.pineconeApiKey) {
        console.error('No Pinecone API key found in request');
        console.error('req.pineconeApiKey:', req.pineconeApiKey);
        console.error('PINECONE_API_KEY:', PINECONE_API_KEY);
        console.error('router.apiKey:', router.apiKey);

        // Try to get the API key from environment again
        req.pineconeApiKey = PINECONE_API_KEY || router.apiKey || process.env.PINECONE_API_KEY;

        if (!req.pineconeApiKey) {
          return res.status(500).json({ error: 'Pinecone API key not configured' });
        }
      }

      console.log('Sending request to Pinecone with API key:', req.pineconeApiKey.substring(0, 5) + '...');

      // Use the exact URL for the Pinecone API
      // The correct URL format is the base URL + /query (NOT /vectors/query)
      const baseUrl = 'https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io';
      const queryUrl = `${baseUrl}/query`;
      console.log('Using exact query URL:', queryUrl);

      // Prepare the request body
      const requestBody = {
        vector,
        topK,
        includeMetadata,
        includeValues,
      };

      // Log the request body (but not the full vector)
      console.log('Request body:', {
        vector: `[Array of ${vector.length} values]`,
        topK,
        includeMetadata,
        includeValues,
      });

      // Validate the vector
      if (!vector || !Array.isArray(vector) || vector.length === 0) {
        console.error('Invalid vector in request body');
        return res.status(400).json({ error: 'Invalid vector in request body' });
      }

      // Send the request
      console.log('Sending request to Pinecone API with API key:', req.pineconeApiKey.substring(0, 5) + '...');
      console.log('Request URL:', queryUrl);
      console.log('Request body:', {
        ...requestBody,
        vector: `[Array of ${vector.length} values]`
      });

      try {
        response = await fetch(queryUrl, {
          method: 'POST',
          headers: {
            'Api-Key': req.pineconeApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('Pinecone API response status:', response.status);
        console.log('Pinecone API response headers:', response.headers.raw());

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Pinecone API error (${response.status}): ${errorText}`);

          // Try to parse the error as JSON for more details
          try {
            const errorJson = JSON.parse(errorText);
            console.error('Parsed error details:', errorJson);
          } catch (e) {
            // Not JSON, just use the text
          }

          return res.status(response.status).json({
            error: `Pinecone API error: ${response.statusText}`,
            details: errorText
          });
        }
      } catch (fetchError) {
        console.error('Fetch error when calling Pinecone API:', fetchError);
        return res.status(500).json({
          error: `Fetch error: ${fetchError.message}`,
          details: fetchError.stack
        });
      }

      // Check if the response has content
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);

      // Check if the response is empty
      const contentLength = response.headers.get('content-length');
      console.log('Response content length:', contentLength);

      if (contentType && contentType.includes('application/json')) {
        let data;
        try {
          data = await response.json();
          console.log(`Pinecone query successful, matches: ${data.matches?.length || 0}`);

          // Log the raw response for debugging
          console.log('Raw Pinecone response (first match):',
            data.matches && data.matches.length > 0
              ? JSON.stringify(data.matches[0], null, 2)
              : 'No matches');

          // Log the response data for debugging
          if (data.matches && data.matches.length > 0) {
            console.log('First match metadata:', JSON.stringify(data.matches[0].metadata || {}, null, 2));

            // Ensure all matches have proper metadata
            data.matches = data.matches.map(match => {
              // If metadata is missing or empty, add default metadata
              if (!match.metadata || Object.keys(match.metadata).length === 0) {
                console.log(`Adding default metadata for match ${match.id}`);
                match.metadata = {
                  title: match.id || 'Untitled Entry',
                  content: 'No content available',
                  type: 'knowledge',
                  tags: ['pinecone', 'knowledge'],
                  created: new Date().toISOString(),
                  visibility: 'private',
                  status: 'published',
                  accessCount: 0,
                  version: 1
                };
              } else {
                // Extract title from ID if not present
                if (!match.metadata.title) {
                  console.log(`Extracting title from ID for match ${match.id}`);
                  // Extract title from ID (format is often "Title.pdf-123")
                  const idParts = match.id.split('-');
                  if (idParts.length > 1) {
                    // Remove file extension if present
                    const titlePart = idParts[0].replace(/\.[^/.]+$/, "");
                    match.metadata.title = titlePart;
                  } else {
                    match.metadata.title = match.id;
                  }
                }
              }

              // Ensure content field exists - check multiple possible locations
              // For this specific Pinecone index, we know content is in metadata.text
              if (match.metadata.text && typeof match.metadata.text === 'string') {
                console.log(`Found content in metadata.text for ${match.id}`);
                match.metadata.content = match.metadata.text;
              }
              // Check if content field already exists
              else if (match.metadata.content && typeof match.metadata.content === 'string' && match.metadata.content.trim() !== '') {
                console.log(`Content already exists in metadata.content for ${match.id}`);
              }
              // Check if content is directly in the match object
              else if (match.content && typeof match.content === 'string' && match.content.trim() !== '') {
                console.log(`Found content directly in match object for ${match.id}`);
                match.metadata.content = match.content;
              }
              // Check if document field exists (some implementations use this)
              else if (match.metadata.document && typeof match.metadata.document === 'string' && match.metadata.document.trim() !== '') {
                console.log(`Found content in metadata.document for ${match.id}`);
                match.metadata.content = match.metadata.document;
              }
              // If still no content, add default
              else {
                console.log(`No content found in any field for match ${match.id}, using default`);
                match.metadata.content = 'No content available';
              }

              // Ensure title field exists
              if (!match.metadata.title) {
                console.log(`Adding default title for match ${match.id}`);
                match.metadata.title = match.id || 'Untitled Entry';
              }

              return match;
            });
          }

          return res.json(data);
        } catch (jsonError) {
          console.error('Error parsing JSON response from Pinecone:', jsonError);
          console.error('Response status:', response.status);
          const responseText = await response.text();
          console.error('Response text:', responseText || '(empty response)');
          return res.status(500).json({
            error: `Error parsing Pinecone response: ${jsonError.message}`,
            details: 'The Pinecone API returned an invalid JSON response'
          });
        }
      } else {
        // Handle non-JSON response
        const responseText = await response.text();
        console.error('Non-JSON response from Pinecone:', responseText || '(empty response)');
        return res.status(500).json({
          error: 'Invalid response from Pinecone API',
          details: `Expected JSON but got ${contentType || 'unknown content type'}`
        });
      }

    } catch (fetchError) {
      console.error('Fetch error when calling Pinecone API:', fetchError);
      return res.status(500).json({
        error: `Fetch error: ${fetchError.message}`,
        details: fetchError.stack
      });
    }
  } catch (error) {
    console.error('Error in Pinecone proxy query:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Upsert endpoint
router.post('/upsert', checkPineconeConfig, async (req, res) => {
  try {
    const { indexName, vectors } = req.body;

    if (!indexName) {
      return res.status(400).json({ error: 'Index name is required' });
    }

    if (!vectors || !Array.isArray(vectors)) {
      return res.status(400).json({ error: 'Vectors must be an array' });
    }

    // Construct the Pinecone API URL
    let url;

    // ALWAYS use the hardcoded URL for clarity-opensource index
    // The exact URL is: https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io
    console.log('Using hardcoded URL for Pinecone');

    // Make sure we're using the exact URL format
    // The correct URL is just the base URL without the /vectors/upsert part
    url = 'https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io';

    console.log('Using exact URL for Pinecone:', url);

    // Double check the URL
    console.log('Final URL:', url);

    console.log(`Proxying upsert to Pinecone: ${url}`);

    // Use the exact URL for the Pinecone API
    // The correct URL format is the base URL + /upsert (NOT /vectors/upsert)
    const baseUrl = 'https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io';
    const upsertUrl = `${baseUrl}/upsert`;
    console.log('Using exact upsert URL:', upsertUrl);

    const response = await fetch(upsertUrl, {
      method: 'POST',
      headers: {
        'Api-Key': req.pineconeApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pinecone API error (${response.status}): ${errorText}`);
      return res.status(response.status).json({
        error: `Pinecone API error: ${response.statusText}`,
        details: errorText
      });
    }

    let data;
    try {
      data = await response.json();
      console.log('Pinecone upsert successful');
      return res.json(data);
    } catch (jsonError) {
      console.error('Error parsing JSON response from Pinecone:', jsonError);
      console.error('Response status:', response.status);
      console.error('Response text:', await response.text());
      return res.status(500).json({
        error: `Error parsing Pinecone response: ${jsonError.message}`,
        details: 'The Pinecone API returned an invalid JSON response'
      });
    }
  } catch (error) {
    console.error('Error in Pinecone proxy upsert:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Delete endpoint
router.post('/delete', checkPineconeConfig, async (req, res) => {
  try {
    const { indexName, ids } = req.body;

    if (!indexName) {
      return res.status(400).json({ error: 'Index name is required' });
    }

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'IDs must be an array' });
    }

    // Construct the Pinecone API URL
    let url;

    // ALWAYS use the hardcoded URL for clarity-opensource index
    // The exact URL is: https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io
    console.log('Using hardcoded URL for Pinecone');

    // Make sure we're using the exact URL format
    // The correct URL is just the base URL without the /vectors/delete part
    url = 'https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io';

    console.log('Using exact URL for Pinecone:', url);

    // Double check the URL
    console.log('Final URL:', url);

    console.log(`Proxying delete to Pinecone: ${url}`);

    // Use the exact URL for the Pinecone API
    // The correct URL format is the base URL + /delete (NOT /vectors/delete)
    const baseUrl = 'https://clarity-opensource-pdxguy4.svc.aped-4627-b74a.pinecone.io';
    const deleteUrl = `${baseUrl}/delete`;
    console.log('Using exact delete URL:', deleteUrl);

    const response = await fetch(deleteUrl, {
      method: 'POST',
      headers: {
        'Api-Key': req.pineconeApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pinecone API error (${response.status}): ${errorText}`);
      return res.status(response.status).json({
        error: `Pinecone API error: ${response.statusText}`,
        details: errorText
      });
    }

    let data;
    try {
      data = await response.json();
      console.log('Pinecone delete successful');
      return res.json(data);
    } catch (jsonError) {
      console.error('Error parsing JSON response from Pinecone:', jsonError);
      console.error('Response status:', response.status);
      console.error('Response text:', await response.text());
      return res.status(500).json({
        error: `Error parsing Pinecone response: ${jsonError.message}`,
        details: 'The Pinecone API returned an invalid JSON response'
      });
    }
  } catch (error) {
    console.error('Error in Pinecone proxy delete:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
