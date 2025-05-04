// Mock Pinecone data for when the proxy server is not available
// This allows the application to function even without the proxy server

export interface MockPineconeMatch {
  id: string;
  score: number;
  values: number[];
  metadata: {
    title: string;
    content: string;
    type: string;
    tags: string[];
    created: string;
    lastAccessed?: string;
    visibility: string;
    status: string;
    accessCount: number;
    version: number;
  };
}

export interface MockPineconeResponse {
  matches: MockPineconeMatch[];
}

// Sample mock data
export const mockPineconeData: MockPineconeResponse = {
  matches: [
    {
      id: 'mock-entry-1',
      score: 0.95,
      values: Array(384).fill(0), // Mock embedding vector
      metadata: {
        title: 'Project Overview',
        content: 'This project integrates Claude with Pinecone to provide enhanced knowledge retrieval capabilities. The integration allows Claude to search through stored knowledge and provide more accurate and contextual responses.',
        type: 'knowledge',
        tags: ['claude', 'pinecone', 'integration'],
        created: new Date().toISOString(),
        visibility: 'private',
        status: 'published',
        accessCount: 1,
        version: 1
      }
    },
    {
      id: 'mock-entry-2',
      score: 0.85,
      values: Array(384).fill(0), // Mock embedding vector
      metadata: {
        title: 'Pinecone Integration Guide',
        content: 'To use Pinecone with Claude, you need to set up a proxy server to avoid CORS issues. The proxy server acts as an intermediary between your browser and the Pinecone API.',
        type: 'knowledge',
        tags: ['pinecone', 'guide', 'cors'],
        created: new Date().toISOString(),
        visibility: 'private',
        status: 'published',
        accessCount: 1,
        version: 1
      }
    },
    {
      id: 'mock-entry-3',
      score: 0.75,
      values: Array(384).fill(0), // Mock embedding vector
      metadata: {
        title: 'Troubleshooting CORS Issues',
        content: 'CORS (Cross-Origin Resource Sharing) issues occur when your browser tries to make direct API calls to domains that don\'t explicitly allow it. To solve this, you need to use a proxy server or set up proper CORS headers on the server.',
        type: 'knowledge',
        tags: ['cors', 'troubleshooting', 'api'],
        created: new Date().toISOString(),
        visibility: 'private',
        status: 'published',
        accessCount: 1,
        version: 1
      }
    }
  ]
};

// Function to get mock data
export const getMockPineconeData = (query: string): MockPineconeResponse => {
  console.log('🔍 Using mock Pinecone data for query:', query);
  
  // Filter matches based on the query (simple text matching)
  const filteredMatches = mockPineconeData.matches.filter(match => {
    const lowerQuery = query.toLowerCase();
    return (
      match.metadata.title.toLowerCase().includes(lowerQuery) ||
      match.metadata.content.toLowerCase().includes(lowerQuery) ||
      match.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  });
  
  return {
    matches: filteredMatches.length > 0 ? filteredMatches : mockPineconeData.matches
  };
};
