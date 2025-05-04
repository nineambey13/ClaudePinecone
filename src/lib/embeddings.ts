import { pipeline, env } from '@xenova/transformers';

// Disable local model loading warning
env.allowLocalModels = false;

// Types for embedding cache and progress tracking
type CacheEntry = {
  embedding: number[];
  timestamp: number;
};

type BatchProgress = {
  total: number;
  completed: number;
  failed: number;
};

// LRU Cache for embeddings with a 1-hour TTL
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_CACHE_SIZE = 1000;
const embeddingCache = new Map<string, CacheEntry>();

// Cache for the embedding model to avoid reloading
let embeddingModel: any = null;

// Initialize the embedding model
async function getEmbeddingModel() {
  if (!embeddingModel) {
    console.log('Loading embedding model...');
    embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model loaded successfully');
  }
  return embeddingModel;
}

// Clean old entries from the cache
function cleanCache() {
  const now = Date.now();
  for (const [key, value] of embeddingCache) {
    if (now - value.timestamp > CACHE_TTL) {
      embeddingCache.delete(key);
    }
  }

  // If still over size limit, remove oldest entries
  if (embeddingCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(embeddingCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    for (const [key] of toRemove) {
      embeddingCache.delete(key);
    }
  }
}

// Validate embedding dimensions and normalize if needed
function validateAndNormalizeEmbedding(embedding: number[]): number[] {
  if (!Array.isArray(embedding)) {
    throw new Error('Invalid embedding: not an array');
  }

  if (embedding.some(val => typeof val !== 'number' || isNaN(val))) {
    throw new Error('Invalid embedding: contains non-numeric values');
  }

  // Verify the embedding dimensions match your Pinecone index
  if (embedding.length !== 384) {
    console.warn(`Warning: Generated embedding has ${embedding.length} dimensions, adjusting to 384 dimensions.`);
    if (embedding.length > 384) {
      return embedding.slice(0, 384);
    } else {
      return [...embedding, ...new Array(384 - embedding.length).fill(0)];
    }
  }

  return embedding;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Check cache first
    const cacheKey = text.trim();
    const cached = embeddingCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Using cached embedding');
      return cached.embedding;
    }

    console.log(`Generating embedding for text: "${text.substring(0, 50)}..."`);

    // Add a timeout to prevent hanging - increased to 15 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        console.warn('⚠️ Embedding generation timed out after 15 seconds');
        reject(new Error('Embedding generation timed out after 15 seconds'));
      }, 15000);
    });

    console.log('🔍 Getting embedding model...');
    const model = await getEmbeddingModel();
    console.log('🔍 Generating embedding with model...');

    // Preprocess text - trim and clean
    const cleanedText = text.trim().replace(/\s+/g, ' ');
    const embeddingPromise = model(cleanedText, { pooling: 'mean', normalize: true });

    // Race the embedding generation against the timeout
    const output = await Promise.race([embeddingPromise, timeoutPromise]);

    const rawEmbedding = Array.from(output.data);
    const embedding = validateAndNormalizeEmbedding(
      rawEmbedding.map(val => Number(val))
    );

    // Cache the result
    embeddingCache.set(cacheKey, {
      embedding,
      timestamp: Date.now()
    });
    cleanCache();

    console.log('Embedding generated successfully, dimensions:', embedding.length);
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Return a fallback embedding instead of throwing
    console.warn('Using fallback random embedding');
    return Array.from({ length: 384 }, () => Math.random() * 2 - 1);
  }
}

export async function generateEmbeddings(
  texts: string[],
  onProgress?: (progress: BatchProgress) => void
): Promise<number[][]> {
  const progress: BatchProgress = {
    total: texts.length,
    completed: 0,
    failed: 0
  };

  try {
    const batchSize = 5;
    const embeddings: number[][] = [];
    const maxRetries = 3;

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(async (text) => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            const embedding = await generateEmbedding(text);
            progress.completed++;
            onProgress?.(progress);
            return embedding;
          } catch (error) {
            if (attempt === maxRetries - 1) {
              progress.failed++;
              onProgress?.(progress);
              throw error;
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          }
        }
      });

      const batchResults = await Promise.all(batchPromises);
      embeddings.push(...batchResults.filter(Boolean) as number[][]);
    }

    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}