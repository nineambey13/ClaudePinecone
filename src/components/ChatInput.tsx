import React, { useState, useRef, useEffect } from 'react';
import AutoExpandingTextarea from './AutoExpandingTextarea';
import FileUpload from './FileUpload';
import FilePreview from './FilePreview';
import { useChatContext } from '../contexts/ChatContext';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  className = ''
}) => {
  const [message, setMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const { isLoading } = useChatContext();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = () => {
    if (!message.trim() && !uploadedFile) return;

    let finalMessage = message;

    // If there's an uploaded file, add it to the message
    if (uploadedFile) {
      if (uploadedFile.includeInPrompt) {
        // For images and small files that can be included directly
        if (uploadedFile.metadata.type.startsWith('image/')) {
          finalMessage = `${message}\n\n![${uploadedFile.metadata.name}](${uploadedFile.data})`;
        } else {
          // For text files
          finalMessage = `${message}\n\nFile: ${uploadedFile.metadata.name}\n\`\`\`\n${uploadedFile.data}\n\`\`\``;
        }
      } else {
        // For files too large to include directly
        finalMessage = `${message}\n\n[File: ${uploadedFile.metadata.name} (${uploadedFile.metadata.type}) - ${Math.round(uploadedFile.metadata.size / 1024)} KB]`;
      }
    }

    onSendMessage(finalMessage);
    setMessage('');
    setUploadedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileProcessed = (fileData: any) => {
    setUploadedFile(fileData);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className={`chat-input-container ${className}`}>
      {uploadedFile && (
        <div className="file-upload-previews">
          <FilePreview file={uploadedFile} onRemove={handleRemoveFile} />
        </div>
      )}
      
      <div className="chat-input-wrapper">
        <AutoExpandingTextarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          minHeight={40}
          maxHeight={200}
          disabled={disabled || isLoading}
          className="chat-input"
        />
        
        <div className="chat-input-actions">
          <FileUpload 
            onFileProcessed={handleFileProcessed} 
            disabled={disabled || isLoading || !!uploadedFile}
          />
          
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={disabled || isLoading || (!message.trim() && !uploadedFile)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
