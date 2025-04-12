import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

type ChatInputProps = {
  className?: string;
};

export const ChatInput = ({ className }: ChatInputProps) => {
  const { sendMessage, createChat, currentChatId } = useChatContext();
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Claude 3.7 Sonnet');
  const isMobile = useIsMobile();

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize the textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // If we don't have a current chat, create one first
      if (!currentChatId) {
        createChat();
      }
      
      // Use a setTimeout to ensure the chat has been created
      setTimeout(() => {
        sendMessage(inputValue);
        setInputValue('');
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }, 0);
    }
  };

  const models = [
    'Claude 3.7 Sonnet',
    'Claude 3.5 Sonnet',
    'Claude 3 Opus',
    'Claude 3 Haiku',
  ];

  // Up arrow SVG for send button
  const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
      <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z"></path>
    </svg>
  );

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "relative mx-auto w-full px-4",
        isMobile ? "fixed bottom-0 left-0 pb-4 pt-2 bg-claude-beige" : "max-w-[672px]",
        className
      )}
    >
      <div className="relative flex items-end bg-white border border-gray-300 rounded-2xl shadow-lg">
        <div className="flex items-center p-2">
          <DropdownMenu open={isUploadMenuOpen} onOpenChange={setIsUploadMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 rounded hover:bg-gray-100 transition-colors h-8 w-8 border border-gray-200 flex items-center justify-center"
              >
                <Plus size={18} className="text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>Upload a file</DropdownMenuItem>
              <DropdownMenuItem>Take a screenshot</DropdownMenuItem>
              <DropdownMenuItem>Add from GitHub</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 py-3 px-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="How can I help you today?"
            className="w-full resize-none outline-none border-0 focus:ring-0 max-h-36 overflow-y-auto bg-transparent"
            rows={1}
            style={{ height: 'auto', lineHeight: '24px' }}
          />
        </div>

        <div className="p-2 flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 text-sm px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                {selectedModel}
                <ChevronDown size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {models.map((model) => (
                <DropdownMenuItem 
                  key={model} 
                  onClick={() => setSelectedModel(model)}
                  className="flex items-center justify-between"
                >
                  {model}
                  {model === selectedModel && <span className="text-green-500">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={cn(
              "rounded-md p-2 transition-colors h-8 w-8 flex items-center justify-center",
              inputValue.trim()
                ? "bg-claude-orange text-white hover:bg-opacity-90"
                : "bg-gray-200 text-gray-400"
            )}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </form>
  );
};
