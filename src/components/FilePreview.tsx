import React from 'react';

interface FilePreviewProps {
  file: {
    metadata: {
      name: string;
      type: string;
      size: number;
      url?: string;
      isCompressed?: boolean;
      originalSize?: number;
    };
    includeInPrompt: boolean;
  };
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const { metadata } = file;
  const isImage = metadata.type.startsWith('image/');
  
  // Format file size
  const formatSize = (size: number): string => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  return (
    <div className="file-preview">
      <div className="file-preview-content">
        {isImage && metadata.url ? (
          <div className="file-preview-image-container">
            <img 
              src={metadata.url} 
              alt={metadata.name} 
              className="file-preview-image" 
            />
          </div>
        ) : (
          <div className="file-preview-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
      
      <div className="file-preview-info">
        <div className="file-preview-name" title={metadata.name}>
          {metadata.name}
        </div>
        <div className="file-preview-details">
          <span className="file-preview-size">
            {formatSize(metadata.size)}
            {metadata.isCompressed && metadata.originalSize && (
              <span className="file-preview-compressed">
                {` (compressed from ${formatSize(metadata.originalSize)})`}
              </span>
            )}
          </span>
          {!file.includeInPrompt && (
            <span className="file-preview-warning">
              Too large to include directly
            </span>
          )}
        </div>
      </div>
      
      <button 
        className="file-preview-remove" 
        onClick={onRemove}
        aria-label="Remove file"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

export default FilePreview;
