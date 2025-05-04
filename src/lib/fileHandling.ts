// File handling utilities for Claude integration
import { compressImage } from './imageProcessing';

// Maximum size for files to be sent directly to Claude (in bytes)
// Claude has a context window of approximately 200K tokens
// A rough estimate is that 1 byte = 0.25-0.5 tokens for binary data
// So we'll set a conservative limit of 100KB for direct inclusion
const MAX_DIRECT_FILE_SIZE = 100 * 1024; // 100KB

// Maximum image dimensions for preview
const MAX_IMAGE_DIMENSION = 800; // pixels

/**
 * Processes a file for Claude, handling different file types appropriately
 * @param file The file to process
 * @returns An object with the processed file data and metadata
 */
export async function processFileForClaude(file: File): Promise<{
  data: string;
  metadata: {
    name: string;
    type: string;
    size: number;
    isCompressed: boolean;
    originalSize?: number;
    url?: string;
  };
  includeInPrompt: boolean;
}> {
  const isImage = file.type.startsWith('image/');
  const isText = file.type.startsWith('text/') || 
                 file.type === 'application/json' || 
                 file.type === 'application/xml' ||
                 file.name.endsWith('.md') ||
                 file.name.endsWith('.csv');
  
  // Create a URL for the file for preview purposes
  const url = URL.createObjectURL(file);
  
  // For small text files, we can include them directly
  if (isText && file.size <= MAX_DIRECT_FILE_SIZE) {
    const text = await file.text();
    return {
      data: text,
      metadata: {
        name: file.name,
        type: file.type,
        size: file.size,
        isCompressed: false,
        url
      },
      includeInPrompt: true
    };
  }
  
  // For images, we can compress them if needed
  if (isImage) {
    try {
      // If the image is already small enough, just convert to base64
      if (file.size <= MAX_DIRECT_FILE_SIZE) {
        const base64 = await fileToBase64(file);
        return {
          data: base64,
          metadata: {
            name: file.name,
            type: file.type,
            size: file.size,
            isCompressed: false,
            url
          },
          includeInPrompt: true
        };
      }
      
      // Otherwise, compress the image
      const compressedImageBlob = await compressImage(file, MAX_IMAGE_DIMENSION);
      const base64 = await fileToBase64(compressedImageBlob);
      
      // If the compressed image is still too large, don't include it directly
      const includeInPrompt = compressedImageBlob.size <= MAX_DIRECT_FILE_SIZE;
      
      return {
        data: base64,
        metadata: {
          name: file.name,
          type: file.type,
          size: compressedImageBlob.size,
          isCompressed: true,
          originalSize: file.size,
          url
        },
        includeInPrompt
      };
    } catch (error) {
      console.error('Error processing image:', error);
      // Fall back to not including the image directly
    }
  }
  
  // For other file types or if processing failed, just provide metadata
  return {
    data: '',
    metadata: {
      name: file.name,
      type: file.type,
      size: file.size,
      isCompressed: false,
      url
    },
    includeInPrompt: false
  };
}

/**
 * Converts a file to a base64 string
 * @param file The file to convert
 * @returns A Promise that resolves to the base64 string
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader did not return a string'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a description of a file for Claude when the file is too large to include directly
 * @param file The file metadata
 * @returns A string description of the file
 */
export function createFileDescription(file: {
  name: string;
  type: string;
  size: number;
}): string {
  const sizeInKB = Math.round(file.size / 1024);
  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  
  let description = `[File: ${file.name}`;
  
  if (file.type) {
    description += ` (${file.type})`;
  }
  
  if (sizeInKB < 1000) {
    description += ` - ${sizeInKB} KB`;
  } else {
    description += ` - ${sizeInMB} MB`;
  }
  
  description += ']\n';
  description += 'This file is too large to include directly in the conversation. ';
  description += 'I can see that you\'ve uploaded it, but I can only access its metadata.';
  
  return description;
}
