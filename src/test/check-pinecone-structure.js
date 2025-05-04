// Script to check the structure of data in Pinecone
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

// Function to analyze the structure of Pinecone data
async function analyzePineconeStructure() {
  console.log('Analyzing Pinecone data structure...');
  
  // Load API key
  const apiKey = loadApiKey();
  if (!apiKey) {
    console.error('No API key found. Cannot proceed with analysis.');
    return;
  }
  
  console.log('API key loaded:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5));
  
  // Create a test vector (384 dimensions with random values)
  const testVector = Array(384).fill(0).map(() => Math.random());
  
  // The exact URL for the Pinecone API
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
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data received');
      
      if (!data.matches || data.matches.length === 0) {
        console.log('No matches found in Pinecone');
        return;
      }
      
      console.log(`Found ${data.matches.length} matches`);
      
      // Analyze the structure of the first match
      const firstMatch = data.matches[0];
      console.log('\nAnalyzing structure of first match:');
      console.log('Match ID:', firstMatch.id);
      console.log('Match score:', firstMatch.score);
      console.log('Has values array:', !!firstMatch.values);
      console.log('Values array length:', firstMatch.values?.length);
      
      // Analyze metadata
      console.log('\nMetadata structure:');
      if (!firstMatch.metadata) {
        console.log('No metadata found!');
      } else {
        console.log('Metadata keys:', Object.keys(firstMatch.metadata));
        
        // Check for content field
        if ('content' in firstMatch.metadata) {
          console.log('Content field found in metadata');
          console.log('Content type:', typeof firstMatch.metadata.content);
          console.log('Content length:', firstMatch.metadata.content.length);
          console.log('Content preview:', firstMatch.metadata.content.substring(0, 100) + '...');
        } else {
          console.log('No content field in metadata!');
        }
        
        // Check for text field
        if ('text' in firstMatch.metadata) {
          console.log('Text field found in metadata');
          console.log('Text type:', typeof firstMatch.metadata.text);
          console.log('Text length:', firstMatch.metadata.text.length);
          console.log('Text preview:', firstMatch.metadata.text.substring(0, 100) + '...');
        }
        
        // Check for document field
        if ('document' in firstMatch.metadata) {
          console.log('Document field found in metadata');
          console.log('Document type:', typeof firstMatch.metadata.document);
          console.log('Document length:', firstMatch.metadata.document.length);
          console.log('Document preview:', firstMatch.metadata.document.substring(0, 100) + '...');
        }
        
        // Check for title field
        if ('title' in firstMatch.metadata) {
          console.log('Title field found in metadata');
          console.log('Title:', firstMatch.metadata.title);
        } else {
          console.log('No title field in metadata!');
        }
        
        // Check for tags field
        if ('tags' in firstMatch.metadata) {
          console.log('Tags field found in metadata');
          console.log('Tags:', firstMatch.metadata.tags);
        }
      }
      
      // Check if content is directly in the match object
      if ('content' in firstMatch) {
        console.log('\nContent field found directly in match object');
        console.log('Content type:', typeof firstMatch.content);
        console.log('Content length:', firstMatch.content.length);
        console.log('Content preview:', firstMatch.content.substring(0, 100) + '...');
      }
      
      // Save the full structure to a file for further analysis
      const outputPath = path.resolve(process.cwd(), 'pinecone-structure.json');
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
      console.log(`\nFull response saved to ${outputPath}`);
      
      // Print summary of all matches
      console.log('\nSummary of all matches:');
      data.matches.forEach((match, index) => {
        console.log(`\nMatch ${index + 1}:`);
        console.log(`ID: ${match.id}`);
        console.log(`Score: ${match.score}`);
        console.log(`Has metadata: ${!!match.metadata}`);
        if (match.metadata) {
          console.log(`Metadata keys: ${Object.keys(match.metadata).join(', ')}`);
          console.log(`Has content: ${'content' in match.metadata}`);
          console.log(`Has title: ${'title' in match.metadata}`);
          if ('title' in match.metadata) {
            console.log(`Title: ${match.metadata.title}`);
          }
        }
      });
      
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

// Run the analysis
analyzePineconeStructure();
