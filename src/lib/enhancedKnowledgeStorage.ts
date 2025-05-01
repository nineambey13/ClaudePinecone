import { PineconeEntry, DecisionLog, FeatureSpec } from '@/types/knowledge';
import { v4 as uuidv4 } from 'uuid';
import { 
  getKnowledgeEntries, 
  saveKnowledgeEntry as saveToLocalStorage,
  deleteKnowledgeEntry as deleteFromLocalStorage,
  getDecisionLogs,
  saveDecisionLog,
  deleteDecisionLog,
  getFeatureSpecs,
  saveFeatureSpec,
  deleteFeatureSpec
} from './knowledgeStorage';
import { 
  isPineconeConfigured, 
  upsertToPinecone, 
  searchPinecone, 
  deleteFromPinecone 
} from './pineconeUtils';
import { isClaudeConfigured, extractConcepts, generateSummary, isEmbeddingConfigured } from './claudeApi';

// Enhanced Knowledge Entry storage with Pinecone integration
export const saveKnowledgeEntry = async (entry: Partial<PineconeEntry>): Promise<PineconeEntry> => {
  try {
    // Save to local storage first
    const savedEntry = saveToLocalStorage(entry);
    
    // Enhance entry with AI features if Claude API is available
    if (isClaudeConfigured() && savedEntry.content && (!savedEntry.metadata.tags || savedEntry.metadata.tags.length === 0)) {
      try {
        const extractedConcepts = await extractConcepts(savedEntry.content);
        if (extractedConcepts && extractedConcepts.length > 0) {
          savedEntry.metadata.tags = extractedConcepts.slice(0, 5);
          // Update local storage with new tags
          saveToLocalStorage(savedEntry);
        }
      } catch (aiError) {
        console.warn('Error enhancing entry with AI features:', aiError);
      }
    }
    
    // If Pinecone and embedding API are configured, also save there
    if (isPineconeConfigured() && isEmbeddingConfigured()) {
      try {
        const updatedEntry = await upsertToPinecone(savedEntry);
        console.log('Entry saved to Pinecone:', updatedEntry.id);
        return updatedEntry;
      } catch (pineconeError) {
        console.error('Error saving to Pinecone:', pineconeError);
      }
    }
    
    return savedEntry;
  } catch (error) {
    console.error('Error saving knowledge entry:', error);
    throw error;
  }
};

export const deleteKnowledgeEntry = async (id: string): Promise<void> => {
  try {
    // Delete from local storage
    deleteFromLocalStorage(id);
    
    // If Pinecone is configured, also delete there
    if (isPineconeConfigured()) {
      try {
        await deleteFromPinecone(id);
        console.log('Entry deleted from Pinecone:', id);
      } catch (pineconeError) {
        console.error('Error deleting from Pinecone:', pineconeError);
      }
    }
  } catch (error) {
    console.error('Error deleting knowledge entry:', error);
    throw error;
  }
};

export const searchKnowledgeBase = async (query: string, useVectorSearch: boolean = true): Promise<PineconeEntry[]> => {
  try {
    // Check if we can use vector search (Pinecone and embedding API configured)
    const canUseVectorSearch = isPineconeConfigured() && isEmbeddingConfigured();
    
    if (useVectorSearch && canUseVectorSearch) {
      try {
        console.log('Performing vector search with Pinecone...');
        const results = await searchPinecone(query);
        
        // If we got results from Pinecone, return them
        if (results && results.length > 0) {
          return results;
        }
      } catch (pineconeError) {
        console.error('Error searching Pinecone:', pineconeError);
      }
    }
    
    console.log('Falling back to local text search...');
    // Fallback to local text search
    const entries = getKnowledgeEntries();
    const lowerQuery = query.toLowerCase();
    
    const results = entries.filter(entry => 
      entry.metadata.title.toLowerCase().includes(lowerQuery) ||
      entry.content.toLowerCase().includes(lowerQuery) ||
      entry.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
    
    return results;
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return [];
  }
};

// Method to generate search results summaries
export const generateResultsSummary = async (query: string, results: PineconeEntry[]): Promise<string> => {
  if (results.length === 0) {
    return "No results found.";
  }
  
  if (!isClaudeConfigured()) {
    return `Found ${results.length} results for "${query}".`;
  }
  
  try {
    const resultsText = results.map((entry, index) => 
      `${index + 1}. ${entry.metadata.title}: ${entry.content.substring(0, 100)}...`
    ).join('\n\n');
    
    const summaryPrompt = `
      I searched for "${query}" and found ${results.length} results:
      
      ${resultsText}
      
      Please summarize these results in relation to my search query in 1-2 sentences.
    `;
    
    return await generateSummary(summaryPrompt);
  } catch (error) {
    console.error('Error generating results summary:', error);
    return `Found ${results.length} results for "${query}".`;
  }
}; 