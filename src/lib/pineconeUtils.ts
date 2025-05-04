import { PineconeEntry } from '@/types/knowledge';
import { getEmbedding } from './claudeApi';
import { initPineconeClient } from './pineconeClient';

// Configuration
const PINECONE_API_KEY = import.meta.env.VITE_PINECONE_API_KEY;
const PINECONE_INDEX = import.meta.env.VITE_PINECONE_INDEX;

// Log configuration
console.log('🔍 Pinecone configuration:');
console.log('🔍 - API Key available:', !!PINECONE_API_KEY);
console.log('🔍 - Index name:', PINECONE_INDEX);

// Check if Pinecone config is available
export const isPineconeConfigured = (): boolean => {
  return !!(PINECONE_API_KEY && PINECONE_INDEX);
};

// Initialize the Pinecone client
export const initPinecone = async () => {
  return initPineconeClient();
};

// Upsert an entry to Pinecone
export const upsertToPinecone = async (entry: PineconeEntry): Promise<PineconeEntry> => {
  if (!isPineconeConfigured()) {
    console.warn('Pinecone is not configured. Using local storage instead.');
    return entry;
  }

  try {
    // Generate embedding for the entry if it doesn't have one
    if (!entry.embedding) {
      const content = `${entry.metadata.title}. ${entry.content}`;
      const embedding = await getEmbedding(content);
      entry.embedding = embedding;
    }

    // Initialize Pinecone client
    const pinecone = await initPinecone();
    if (!pinecone) return entry;

    // Prepare metadata - ensure dates are converted to strings
    const metadata = {
      title: entry.metadata.title,
      content: entry.content,
      type: entry.metadata.type,
      tags: entry.metadata.tags,
      created: entry.metadata.created.toISOString(),
      lastAccessed: entry.metadata.lastAccessed?.toISOString(),
      visibility: entry.metadata.visibility,
      status: entry.metadata.status,
      accessCount: entry.metadata.accessCount || 0,
      version: entry.metadata.version || 1,
    };

    // Upsert to Pinecone
    await pinecone.upsert([{
      id: entry.id,
      values: entry.embedding,
      metadata: metadata
    }]);

    console.log('Upserted to Pinecone:', entry.id);
    return entry;
  } catch (error) {
    console.error('Error upserting to Pinecone:', error);
    return entry;
  }
};

// Search Pinecone for similar entries
export const searchPinecone = async (query: string, topK: number = 10): Promise<PineconeEntry[]> => {
  if (!isPineconeConfigured()) {
    console.warn('Pinecone is not configured. Using local storage instead.');
    return [];
  }

  try {
    console.log('🔍 Generating embedding for query:', query);
    // Generate embedding for the query
    const embedding = await getEmbedding(query);
    console.log('✅ Embedding generated successfully, length:', embedding.length);

    // Validate embedding
    if (!embedding || !Array.isArray(embedding)) {
      console.error('❌ Invalid embedding: not an array');
      return [];
    }

    if (embedding.length !== 384) {
      console.error(`❌ Invalid embedding dimensions: ${embedding.length} (expected 384)`);
    }

    // Check if embedding contains valid numbers
    const isValidEmbedding = embedding.every(val => typeof val === 'number' && !isNaN(val));
    if (!isValidEmbedding) {
      console.error('❌ Embedding contains invalid values');
      return [];
    }

    console.log('✅ Embedding validation passed');

    // Initialize Pinecone client
    console.log('🔍 Initializing Pinecone client...');
    const pinecone = await initPinecone();
    if (!pinecone) {
      console.error('❌ Failed to initialize Pinecone client');
      return [];
    }
    console.log('✅ Pinecone client initialized successfully');

    // Create a timeout promise - increased to 20 seconds to allow more time for query
    const timeoutPromise = new Promise<{matches: []}>((resolve) => {
      setTimeout(() => {
        console.warn('⚠️ Pinecone query timed out after 20 seconds');
        // Resolve with empty results instead of rejecting to avoid error
        resolve({matches: []});
      }, 20000);
    });

    // Query Pinecone with timeout
    console.log('🔍 Querying Pinecone with topK:', topK);
    const queryPromise = pinecone.query(embedding, topK, true, query);

    // Race the query against the timeout
    const results = await Promise.race([queryPromise, timeoutPromise]);

    // Check if we got any matches
    if (!results.matches || results.matches.length === 0) {
      console.log('⚠️ No matches found in Pinecone');
      return [];
    }

    console.log('✅ Pinecone query completed successfully, matches:', results.matches.length);

    // Map Pinecone results to PineconeEntry objects
    // Add additional logging for debugging
    console.log('🔍 First match score:', results.matches[0]?.score);
    console.log('🔍 First match metadata:', JSON.stringify(results.matches[0]?.metadata, null, 2).substring(0, 200) + '...');

    // Map Pinecone results to PineconeEntry objects with enhanced error handling
    return results.matches.map((match: any) => {
      // Ensure metadata exists
      if (!match.metadata) {
        console.log(`Match ${match.id} has no metadata, creating default metadata`);
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
      }

      // Log metadata for debugging
      console.log(`Processing match ${match.id} with metadata:`,
        JSON.stringify({
          title: match.metadata?.title || '(missing)',
          content: match.metadata?.content ? `${match.metadata.content.substring(0, 50)}...` : '(missing)',
          tags: match.metadata?.tags || '(missing)'
        }, null, 2)
      );

      return {
        id: match.id,
        // Ensure content is a non-empty string
        // Check multiple possible locations for content
        content: (
          // First check metadata.text (specific to this Pinecone index)
          (typeof match.metadata?.text === 'string' && match.metadata.text.trim() !== '')
            ? match.metadata.text
          // Then check metadata.content
          : (typeof match.metadata?.content === 'string' && match.metadata.content.trim() !== '')
            ? match.metadata.content
          // Then check if content is directly in the match object
          : (typeof match.content === 'string' && match.content.trim() !== '')
            ? match.content
          // Then check if document field exists (some implementations use this)
          : (typeof match.metadata?.document === 'string' && match.metadata.document.trim() !== '')
            ? match.metadata.document
          // Finally, provide a default message
          : `No content available for entry ${match.id}`
        ),
        embedding: match.values,
        metadata: {
          // Ensure title is a non-empty string
          title: (
            // First check if title exists in metadata
            (typeof match.metadata?.title === 'string' && match.metadata.title.trim() !== '')
              ? match.metadata.title
            // If not, extract title from ID (format is often "Title.pdf-123")
            : (() => {
                const idParts = match.id.split('-');
                if (idParts.length > 1) {
                  // Remove file extension if present
                  return idParts[0].replace(/\.[^/.]+$/, "");
                }
                return match.id;
              })()
          ),
          type: match.metadata?.type as any || 'knowledge',
          // Ensure tags is an array
          tags: Array.isArray(match.metadata?.tags) ? match.metadata?.tags : ['knowledge'],
          // Ensure created is a valid date
          created: match.metadata?.created ? new Date(match.metadata.created as string) : new Date(),
          lastAccessed: match.metadata?.lastAccessed ? new Date(match.metadata.lastAccessed as string) : undefined,
          visibility: match.metadata?.visibility as any || 'private',
          status: match.metadata?.status as any || 'published',
          accessCount: Number(match.metadata?.accessCount) || 0,
          version: Number(match.metadata?.version) || 1,
        },
        relatedEntries: [],
      };
    });
  } catch (error) {
    console.error('❌ Error searching Pinecone:', error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    } else {
      console.error('❌ Unknown error type:', typeof error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
    }

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        console.error('❌ Authentication error - check your Pinecone API key');
      } else if (error.message.includes('not found') || error.message.includes('404')) {
        console.error('❌ Index not found - check your Pinecone index name');
      } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
        console.error('❌ Connection error - check your network or Pinecone environment');
      }
    }

    return [];
  }
};

// Delete an entry from Pinecone
export const deleteFromPinecone = async (id: string): Promise<boolean> => {
  if (!isPineconeConfigured()) {
    console.warn('Pinecone is not configured. Using local storage instead.');
    return true;
  }

  try {
    // Initialize Pinecone client
    const pinecone = await initPinecone();
    if (!pinecone) return false;

    // Delete from Pinecone
    await pinecone.delete([id]);

    console.log('Deleted from Pinecone:', id);
    return true;
  } catch (error) {
    console.error('Error deleting from Pinecone:', error);
    return false;
  }
};