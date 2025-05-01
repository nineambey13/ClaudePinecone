import { PineconeEntry } from '@/types/knowledge';
import { v4 as uuidv4 } from 'uuid';
import { getEmbedding } from './claudeApi';
import { Pinecone } from '@pinecone-database/pinecone';

// Configuration
const PINECONE_API_KEY = import.meta.env.VITE_PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = import.meta.env.VITE_PINECONE_ENVIRONMENT;
const PINECONE_INDEX = import.meta.env.VITE_PINECONE_INDEX;

// Check if Pinecone config is available
export const isPineconeConfigured = (): boolean => {
  return !!(PINECONE_API_KEY && PINECONE_ENVIRONMENT && PINECONE_INDEX);
};

// Initialize the Pinecone client
export const initPinecone = async () => {
  if (!isPineconeConfigured()) {
    console.warn('Pinecone is not configured. Using local storage instead.');
    return null;
  }

  try {
    const pinecone = new Pinecone({ 
      apiKey: PINECONE_API_KEY as string,
      environment: PINECONE_ENVIRONMENT as string
    });
    
    console.log('Pinecone initialized');
    return pinecone;
  } catch (error) {
    console.error('Error initializing Pinecone:', error);
    return null;
  }
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
    
    // Get the index
    const index = pinecone.index(PINECONE_INDEX as string);
    
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
    await index.upsert([{
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
export const searchPinecone = async (query: string, topK: number = 5): Promise<PineconeEntry[]> => {
  if (!isPineconeConfigured()) {
    console.warn('Pinecone is not configured. Using local storage instead.');
    return [];
  }

  try {
    // Generate embedding for the query
    const embedding = await getEmbedding(query);
    
    // Initialize Pinecone client
    const pinecone = await initPinecone();
    if (!pinecone) return [];
    
    // Get the index
    const index = pinecone.index(PINECONE_INDEX as string);
    
    // Query Pinecone
    const results = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      includeValues: true,
    });
    
    // Map Pinecone results to PineconeEntry objects
    return results.matches.map(match => ({
      id: match.id,
      content: match.metadata?.content as string || '',
      embedding: match.values,
      metadata: {
        title: match.metadata?.title as string || '',
        type: match.metadata?.type as any || 'knowledge',
        tags: Array.isArray(match.metadata?.tags) ? match.metadata?.tags : [],
        created: new Date(match.metadata?.created as string),
        lastAccessed: match.metadata?.lastAccessed ? new Date(match.metadata.lastAccessed as string) : undefined,
        visibility: match.metadata?.visibility as any || 'private',
        status: match.metadata?.status as any || 'published',
        accessCount: Number(match.metadata?.accessCount) || 0,
        version: Number(match.metadata?.version) || 1,
      },
      relatedEntries: [],
    }));
  } catch (error) {
    console.error('Error searching Pinecone:', error);
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
    
    // Get the index
    const index = pinecone.index(PINECONE_INDEX as string);
    
    // Delete from Pinecone
    await index.deleteOne(id);
    
    console.log('Deleted from Pinecone:', id);
    return true;
  } catch (error) {
    console.error('Error deleting from Pinecone:', error);
    return false;
  }
}; 