import { generateEmbedding, generateEmbeddings } from './embeddings';
import { upsertVectors, querySimilar, deleteVectors, QueryResponse, VectorData } from './pinecone';
import { Message } from '@/contexts/ChatContext';

// Interface for chat message vector data
export interface ChatMessageVector extends VectorData {
  metadata: {
    text: string;
    timestamp: number;
    chatId: string;
    role: 'user' | 'assistant';
    messageId: string;
    conversationContext?: string;
    projectId?: string;
    tags?: string[];
  };
}

// Store a single chat message with enhanced context
export async function storeChatMessage(message: Message, chatId: string, projectId?: string, conversationContext?: string) {
  const embedding = await generateEmbedding(message.content);
  const vector: ChatMessageVector = {
    id: message.id,
    values: embedding,
    metadata: {
      text: message.content,
      timestamp: message.timestamp.getTime(),
      chatId,
      role: message.role,
      messageId: message.id,
      conversationContext,
      projectId,
      tags: extractTags(message.content)
    }
  };
  await upsertVectors([vector]);
}

// Store multiple chat messages with context
export async function storeChatMessages(messages: Message[], chatId: string, projectId?: string) {
  const vectors: ChatMessageVector[] = [];
  let currentContext = '';
  
  for (const message of messages) {
    // Build conversation context from previous messages
    currentContext = buildConversationContext(messages.slice(0, messages.indexOf(message)), currentContext);
    
    const embedding = await generateEmbedding(message.content);
    vectors.push({
      id: message.id,
      values: embedding,
      metadata: {
        text: message.content,
        timestamp: message.timestamp.getTime(),
        chatId,
        role: message.role,
        messageId: message.id,
        conversationContext: currentContext,
        projectId,
        tags: extractTags(message.content)
      }
    });
  }
  
  await upsertVectors(vectors);
}

// Query similar messages with enhanced context awareness
export async function querySimilarMessages(
  query: string,
  topK: number = 5,
  filter?: Record<string, any>,
  includeContext: boolean = true
): Promise<QueryResponse> {
  const queryEmbedding = await generateEmbedding(query);
  const results = await querySimilar(queryEmbedding, topK, filter);
  
  if (includeContext) {
    // Enhance results with conversation context
    results.matches = await Promise.all(
      results.matches.map(async (match) => {
        if (match.metadata?.conversationContext) {
          const contextEmbedding = await generateEmbedding(match.metadata.conversationContext);
          // Adjust score based on context similarity
          const contextScore = cosineSimilarity(queryEmbedding, contextEmbedding);
          match.score = (match.score || 0) * 0.7 + contextScore * 0.3;
        }
        return match;
      })
    );
    
    // Re-sort results based on enhanced scores
    results.matches.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
  
  return results;
}

// Helper function to build conversation context
function buildConversationContext(messages: Message[], currentContext: string): string {
  const recentMessages = messages.slice(-3); // Get last 3 messages for context
  const contextMessages = recentMessages.map(msg => 
    `${msg.role}: ${msg.content}`
  ).join('\n');
  
  return currentContext 
    ? `${currentContext}\n${contextMessages}`
    : contextMessages;
}

// Helper function to extract tags from message content
function extractTags(content: string): string[] {
  const tags: string[] = [];
  // Extract hashtags
  const hashtags = content.match(/#\w+/g) || [];
  tags.push(...hashtags.map(tag => tag.slice(1)));
  
  // Extract project references
  const projectRefs = content.match(/@\w+/g) || [];
  tags.push(...projectRefs.map(ref => ref.slice(1)));
  
  return tags;
}

// Helper function to calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Delete messages by chat ID
export async function deleteMessagesByChat(chatId: string) {
  await deleteVectors([chatId]);
}

// Delete specific messages
export async function deleteMessages(messageIds: string[]) {
  await deleteVectors(messageIds);
} 