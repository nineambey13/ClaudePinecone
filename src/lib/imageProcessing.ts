/**
 * Utility functions for image processing
 */

/**
 * Compresses an image file by resizing it and reducing quality
 * @param imageFile The image file to compress
 * @param maxDimension Maximum width or height in pixels
 * @param quality JPEG quality (0-1)
 * @returns A Promise that resolves to a Blob containing the compressed image
 */
export async function compressImage(
  imageFile: File,
  maxDimension: number = 800,
  quality: number = 0.7
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create an image element to load the file
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
      
      // Create a canvas to draw the resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw the image on the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Load the image from the file
    img.src = URL.createObjectURL(imageFile);
  });
}

/**
 * Checks if an image needs compression based on dimensions and file size
 * @param imageFile The image file to check
 * @param maxDimension Maximum width or height in pixels
 * @param maxSizeBytes Maximum file size in bytes
 * @returns A Promise that resolves to a boolean indicating if compression is needed
 */
export async function needsCompression(
  imageFile: File,
  maxDimension: number = 800,
  maxSizeBytes: number = 100 * 1024 // 100KB
): Promise<boolean> {
  // If file size is already small enough, no need to compress
  if (imageFile.size <= maxSizeBytes) {
    return false;
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Check if dimensions exceed the maximum
      const needsResize = img.width > maxDimension || img.height > maxDimension;
      
      // Always compress if file size exceeds the maximum
      resolve(needsResize || imageFile.size > maxSizeBytes);
      
      // Clean up
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      // If we can't load the image, assume it needs compression
      resolve(true);
      URL.revokeObjectURL(img.src);
    };
    
    img.src = URL.createObjectURL(imageFile);
  });
}
