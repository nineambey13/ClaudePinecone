import React, { useState, useRef } from 'react';
import { processFileForClaude, createFileDescription } from '../lib/fileHandling';

interface FileUploadProps {
  onFileProcessed: (fileData: {
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
  }) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, disabled = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsProcessing(true);
    setError(null);

    try {
      console.log(`Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);
      
      // Process the file
      const processedFile = await processFileForClaude(file);
      
      // Log the processing results
      console.log(`File processed: ${processedFile.metadata.name}`);
      console.log(`Included in prompt: ${processedFile.includeInPrompt}`);
      console.log(`Compressed: ${processedFile.metadata.isCompressed}`);
      if (processedFile.metadata.isCompressed) {
        console.log(`Original size: ${processedFile.metadata.originalSize} bytes`);
        console.log(`Compressed size: ${processedFile.metadata.size} bytes`);
        console.log(`Compression ratio: ${(processedFile.metadata.size! / processedFile.metadata.originalSize!) * 100}%`);
      }
      
      // Pass the processed file to the parent component
      onFileProcessed(processedFile);
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Error processing file. Please try again with a different file.');
    } finally {
      setIsProcessing(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,text/*,application/pdf,application/json,application/xml,.md,.csv"
      />
      <button
        onClick={handleButtonClick}
        disabled={disabled || isProcessing}
        className={`file-upload-button ${isProcessing ? 'processing' : ''}`}
      >
        {isProcessing ? 'Processing...' : 'Upload File'}
      </button>
      {error && <div className="file-upload-error">{error}</div>}
    </div>
  );
};

export default FileUpload;
