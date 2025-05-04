import { useState, useRef, FormEvent, ChangeEvent, useEffect } from 'react';
import { Plus, ChevronDown, X, Camera, Github, Paperclip, StopCircle, Database } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Textarea } from './textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { upsertToPinecone } from '@/lib/pineconeUtils';
import { PineconeEntry } from '@/types/knowledge';
import { v4 as uuidv4 } from 'uuid';

type ChatInputProps = {
  className?: string;
};

type Model = {
  name: string;
  description: string;
};

export const ChatInput = ({ className }: ChatInputProps) => {
  const { sendMessage, createChat, currentChatId, isLoading, stopGeneration, prePrompts, chats } = useChatContext();
  const [inputValue, setInputValue] = useState('');
  const [selectedPrePrompt, setSelectedPrePrompt] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Claude 3.5 Haiku');
  const [isPineconeModalOpen, setIsPineconeModalOpen] = useState(false);
  const [upsertTitle, setUpsertTitle] = useState('');
  const [upsertContent, setUpsertContent] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle click outside for desktop upload menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUploadMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.upload-menu')) {
          setIsUploadMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUploadMenuOpen]);

  const models: Model[] = [
    {
      name: 'Claude 3.5 Haiku',
      description: 'Fast and efficient for simple tasks'
    },
    {
      name: 'Claude 3.7 Sonnet',
      description: 'Most capable model for complex tasks'
    },

  ];

  // Auto-resize textarea effect
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 150; // Desktop max height
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [inputValue]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      let messageContent = inputValue;
      
      // Add selected pre-prompt if any (desktop only)
      if (selectedPrePrompt) {
        const prompt = prePrompts.find(p => p.id === selectedPrePrompt);
        if (prompt) {
          messageContent = `${prompt.content}\n\n${inputValue}`;
        }
      }
      
      const chatId = sendMessage(messageContent);
      setInputValue('');
      setSelectedPrePrompt('');
      
      // Reset textarea height after submit
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      if (window.location.pathname === '/') {
        navigate(`/chat/${chatId}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Desktop-only handlers
  const handleUpload = () => console.log('Upload clicked');
  const handleScreenshot = () => console.log('Screenshot clicked');
  const handleGithub = () => console.log('GitHub clicked');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit');
      return;
    }

    // Handle different file types
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        // Add the image to the chat
        const message = {
          id: uuidv4(),
          content: `![${file.name}](${imageUrl})`,
          role: 'user' as const,
          createdAt: new Date()
        };
        sendMessage(message.content);
      };
      reader.onerror = () => {
        alert('Error reading image file');
      };
      reader.readAsDataURL(file);
    } else {
      // Handle text-based files
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          // Create a Pinecone entry for the file content
          const entry: PineconeEntry = {
            id: uuidv4(),
            content,
            metadata: {
              title: file.name,
              type: 'knowledge',
              tags: ['file-upload'],
              created: new Date(),
              visibility: 'private',
              status: 'published',
              accessCount: 0,
              version: 1
            }
          };
          
          // Upsert to Pinecone
          await upsertToPinecone(entry);
          
          // Add a message about the uploaded file
          const message = {
            id: uuidv4(),
            content: `📄 Uploaded file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)\nContent has been saved to knowledge base.`,
            role: 'user' as const,
            createdAt: new Date()
          };
          sendMessage(message.content);
        } catch (error) {
          console.error('Error processing file:', error);
          alert('Error processing file. Please try again.');
        }
      };
      reader.onerror = () => {
        alert('Error reading file');
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setIsUploadMenuOpen(false);
  };

  const handlePineconeUpsert = () => {
    if (!currentChatId) return;
    
    const currentChat = chats.find(chat => chat.id === currentChatId);
    if (!currentChat || !currentChat.messages.length) return;
    
    // Get the last message
    const lastMessage = currentChat.messages[currentChat.messages.length - 1];
    
    // Pre-populate the modal
    setUpsertTitle(currentChat.title || 'Chat Message');
    setUpsertContent(lastMessage.content);
    setIsPineconeModalOpen(true);
  };

  const handleUpsertSubmit = async () => {
    try {
      if (!upsertTitle.trim() || !upsertContent.trim()) {
        alert('Please provide both title and content');
        return;
      }

      // Create a Pinecone entry
      const entry: PineconeEntry = {
        id: uuidv4(),
        content: upsertContent,
        metadata: {
          title: upsertTitle,
          type: 'knowledge',
          tags: ['manual-entry'],
          created: new Date(),
          visibility: 'private',
          status: 'published',
          accessCount: 0,
          version: 1
        }
      };

      // Upsert to Pinecone
      await upsertToPinecone(entry);

      // Add a confirmation message
      const message = {
        id: uuidv4(),
        content: `✅ Successfully saved to knowledge base: "${upsertTitle}"`,
        role: 'assistant' as const,
        createdAt: new Date()
      };
      sendMessage(message.content);

      // Reset form
      setIsPineconeModalOpen(false);
      setUpsertTitle('');
      setUpsertContent('');
    } catch (error) {
      console.error('Error upserting to Pinecone:', error);
      alert('Error saving to knowledge base. Please try again.');
    }
  };

  const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z"></path></svg>
  );

  // --- DESKTOP LAYOUT ONLY ---
  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "relative mx-auto w-full max-w-[672px] overflow-x-hidden",
        className
      )}
    >
      <div className={cn(
        "flex flex-col bg-white rounded-2xl shadow-[0_0_24px_rgba(0,0,0,0.04)] hover:shadow-[0_0_24px_rgba(0,0,0,0.08)] focus-within:shadow-[0_0_24px_rgba(0,0,0,0.08)] w-full border-[1.5px] border-[#D4D4D4] h-[124px]"
      )}>
        <div className="flex flex-col h-full">
          {/* Pre-prompts Select - Kept for desktop */}
          {prePrompts.length > 0 && (
             <div className="flex items-center gap-2 p-2 border-b border-gray-200">
              <Select
                value={selectedPrePrompt}
                onValueChange={setSelectedPrePrompt}
              >
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <SelectValue placeholder="Select a pre-prompt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {prePrompts.map((prompt) => (
                    <SelectItem key={prompt.id} value={prompt.id}>
                      {prompt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Main text area */} 
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="How can I help you today?"
              className="w-full h-full resize-none outline-none border-0 focus:ring-0 overflow-y-auto bg-transparent text-[15px] leading-[1.4] pt-3.5 px-3.5"
              style={{ height: '100%' }}
              disabled={isLoading}
            />
          </div>
          
          {/* Bottom controls */} 
          <div className="flex gap-2.5 w-full items-center px-3.5 pb-3.5">
            {/* Upload Menu */} 
            <div className="relative flex items-center gap-2 shrink min-w-0">
              <DropdownMenu open={isUploadMenuOpen} onOpenChange={setIsUploadMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="upload-menu inline-flex items-center justify-center relative shrink-0 border border-gray-200 transition-all rounded-lg px-[7.5px] h-8 min-w-8 hover:bg-gray-100 active:scale-[0.98]"
                  >
                    {isUploadMenuOpen ? (
                      <X size={18} className="text-gray-500" />
                    ) : (
                    <Plus size={18} className="text-gray-500" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => handleFileUpload()} className="flex items-center gap-2">
                    <Paperclip size={16} className="text-gray-500" />
                    <span className="text-sm">Upload a file</span>
                  </DropdownMenuItem>
                  {currentChatId && chats.find(chat => chat.id === currentChatId)?.messages.length > 0 && (
                    <DropdownMenuItem onClick={() => handlePineconeUpsert()} className="flex items-center gap-2">
                      <Database size={16} className="text-gray-500" />
                      <span className="text-sm">Save to knowledge base</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Spacer */} 
            <div className="flex-1"></div>

            {/* Model Selector & Send/Stop Buttons */} 
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="text-gray-800 hover:bg-gray-100 rounded px-2 py-1 text-sm flex items-center gap-1 h-7"
                  >
                    {selectedModel}
                    <ChevronDown size={12} className="text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {models.map((model) => (
                    <DropdownMenuItem
                      key={model.name}
                      onClick={() => setSelectedModel(model.name)}
                      className="flex flex-col items-start py-2"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{model.name}</span>
                        {model.name === selectedModel && <span className="text-green-500">✓</span>}
                      </div>
                      <span className="text-xs text-gray-500">{model.description}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {isLoading ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className="inline-flex items-center justify-center relative shrink-0 font-medium transition-colors rounded-lg bg-[#E07A5F] text-white hover:bg-[#E07A5F]/90 active:scale-95 h-8 w-8"
                  aria-label="Stop generating"
                >
                  <StopCircle size={16} />
                </button>
              ) : (
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                  className="inline-flex items-center justify-center relative shrink-0 font-medium transition-colors rounded-lg active:scale-95 bg-[#E07A5F]/90 text-white hover:bg-[#E07A5F] disabled:bg-[#E07A5F]/80 disabled:text-white h-8 w-8"
              >
                <SendIcon />
              </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,.txt,.pdf,.doc,.docx"
      />

      {/* Pinecone Upsert Modal */}
      {isPineconeModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-[500px]">
            <h3 className="text-lg font-semibold mb-4">Save to Knowledge Base</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={upsertTitle}
                  onChange={(e) => setUpsertTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter a title for this entry"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={upsertContent}
                  onChange={(e) => setUpsertContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md h-32 resize-none"
                  placeholder="Enter the content to save"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsPineconeModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleUpsertSubmit}
                className="px-4 py-2 text-sm text-white bg-[#C75C4A] hover:bg-[#C75C4A]/90 rounded-md"
                disabled={!upsertTitle.trim() || !upsertContent.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};






