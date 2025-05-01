import React, { useState, useEffect } from 'react';
import { X, BookOpen, Brain, Code, CheckCircle, Zap, Users, Search, Database } from 'lucide-react';
import { ContentType, VisibilityType, EntryStatus, PineconeEntry } from '@/types/knowledge';
import { cn } from '@/lib/utils';

interface KnowledgeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<PineconeEntry>) => void;
  editEntry?: PineconeEntry | null;
}

export const KnowledgeEntryModal: React.FC<KnowledgeEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editEntry = null,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<ContentType>('knowledge');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState<VisibilityType>('private');

  // Reset form when modal opens or editEntry changes
  useEffect(() => {
    if (isOpen) {
      if (editEntry) {
        setTitle(editEntry.metadata.title);
        setContent(editEntry.content);
        setType(editEntry.metadata.type);
        setTags(editEntry.metadata.tags);
        setVisibility(editEntry.metadata.visibility);
      } else {
        setTitle('');
        setContent('');
        setType('knowledge');
        setTags([]);
        setTagInput('');
        setVisibility('private');
      }
    }
  }, [isOpen, editEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: Partial<PineconeEntry> = {
      id: editEntry?.id,
      content,
      metadata: {
        title,
        type,
        tags,
        created: editEntry?.metadata.created || new Date(),
        visibility,
        status: editEntry?.metadata.status || 'published',
        lastAccessed: editEntry?.metadata.lastAccessed,
        accessCount: editEntry?.metadata.accessCount,
        version: editEntry?.metadata.version ? editEntry.metadata.version + 1 : 1,
      }
    };
    
    onSave(entry);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const getTypeIcon = (contentType: ContentType) => {
    switch (contentType) {
      case 'code':
        return <Code size={18} />;
      case 'decision':
        return <CheckCircle size={18} />;
      case 'feature':
        return <Zap size={18} />;
      case 'knowledge':
        return <Brain size={18} />;
      case 'documentation':
        return <BookOpen size={18} />;
      case 'meeting':
        return <Users size={18} />;
      case 'question':
        return <Search size={18} />;
      default:
        return <Database size={18} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">
            {editEntry ? 'Edit Knowledge Entry' : 'Create Knowledge Entry'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Entry title"
              required
            />
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Knowledge content"
              required
            />
          </div>

          {/* Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['knowledge', 'code', 'decision', 'feature', 'documentation', 'meeting', 'question'].map((contentType) => (
                <button
                  key={contentType}
                  type="button"
                  className={cn(
                    "flex items-center gap-2 p-2 border rounded-md",
                    type === contentType 
                      ? "border-blue-500 bg-blue-50 text-blue-700" 
                      : "border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() => setType(contentType as ContentType)}
                >
                  {getTypeIcon(contentType as ContentType)}
                  <span className="text-sm capitalize">
                    {contentType}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <div 
                  key={tag} 
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm flex items-center"
                >
                  {tag}
                  <button 
                    type="button" 
                    className="ml-1 text-gray-500 hover:text-gray-700"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Add tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-gray-100 px-3 rounded-r-md border border-l-0 border-gray-300"
              >
                Add
              </button>
            </div>
          </div>

          {/* Visibility */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as VisibilityType)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="private">Private (Only you)</option>
              <option value="team">Team</option>
              <option value="organization">Organization</option>
              <option value="public">Public</option>
            </select>
          </div>
        </form>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {editEntry ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}; 