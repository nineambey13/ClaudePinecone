import { Pinecone, RecordMetadata, PineconeRecord, ScoredPineconeRecord } from '@pinecone-database/pinecone';
import { config } from './config';

if (!config.pinecone.apiKey) {
  throw new Error('Missing Pinecone API key');
}

if (!config.pinecone.environment) {
  throw new Error('Missing Pinecone environment');
}

if (!config.pinecone.index) {
  throw new Error('Missing Pinecone index name');
}

console.log('Initializing Pinecone client with:', {
  environment: config.pinecone.environment,
  index: config.pinecone.index,
  hasApiKey: !!config.pinecone.apiKey
});

// Initialize the Pinecone client
const pinecone = new Pinecone({
  apiKey: config.pinecone.apiKey,
});

// Get the index instance
const index = pinecone.index(config.pinecone.index);

// Interface for vector data
export interface VectorData {
  id: string;
  values: number[];
  metadata?: {
    text?: string;
    timestamp?: number;
    chatId?: string;
    role?: 'user' | 'assistant';
    [key: string]: any;
  };
}

// Interface for query results
export interface QueryResponse {
  matches: Array<{
    id: string;
    score: number;
    values?: number[];
    metadata?: {
      text?: string;
      timestamp?: number;
      chatId?: string;
      role?: 'user' | 'assistant';
      [key: string]: any;
    };
  }>;
}

// Function to upsert vectors
export async function upsertVectors(vectors: VectorData[]) {
  try {
    const records: PineconeRecord<RecordMetadata>[] = vectors.map(vector => ({
      id: vector.id,
      values: vector.values,
      metadata: vector.metadata,
    }));

    const response = await index.upsert(records);
    return response;
  } catch (error) {
    console.error('Error upserting vectors:', error);
    throw error;
  }
}

// Function to query similar vectors
export async function querySimilar(
  queryVector: number[],
  topK: number = 5,
  filter?: Record<string, any>
): Promise<QueryResponse> {
  try {
    const response = await index.query({
      vector: queryVector,
      topK,
      filter,
      includeMetadata: true,
    });

    // Transform the response to match our QueryResponse interface
    return {
      matches: response.matches.map((match: ScoredPineconeRecord) => ({
        id: match.id,
        score: match.score || 0,
        values: match.values,
        metadata: match.metadata,
      })),
    };
  } catch (error) {
    console.error('Error querying vectors:', error);
    throw error;
  }
}

// Function to delete vectors
export async function deleteVectors(ids: string[]) {
  try {
    const response = await index.deleteMany(ids);
    return response;
  } catch (error) {
    console.error('Error deleting vectors:', error);
    throw error;
  }
}

// Function to delete vectors by filter
export async function deleteVectorsByFilter(filter: Record<string, any>) {
  try {
    const response = await index.deleteMany({
      filter
    });
    return response;
  } catch (error) {
    console.error('Error deleting vectors by filter:', error);
    throw error;
  }
}

// Function to fetch vectors by IDs
export async function fetchVectors(ids: string[]) {
  try {
    const response = await index.fetch(ids);
    return response;
  } catch (error) {
    console.error('Error fetching vectors:', error);
    throw error;
  }
} 