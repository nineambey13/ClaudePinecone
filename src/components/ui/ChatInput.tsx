
import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { Plus, Equal, ChevronDown, ArrowUp } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
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
  const { sendMessage } = useChatContext();
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Claude 3.7 Sonnet');

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
      sendMessage(inputValue);
      setInputValue('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const models = [
    'Claude 3.7 Sonnet',
    'Claude 3.5 Sonnet',
    'Claude 3 Opus',
    'Claude 3 Haiku',
  ];

  return (
    <form onSubmit={handleSubmit} className={cn("relative max-w-3xl mx-auto w-full px-4", className)}>
      <div className="relative flex items-end bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center border-r border-gray-200 p-2">
          <DropdownMenu open={isUploadMenuOpen} onOpenChange={setIsUploadMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 rounded hover:bg-gray-100 transition-colors"
              >
                <Plus size={20} className="text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>Upload a file</DropdownMenuItem>
              <DropdownMenuItem>Take a screenshot</DropdownMenuItem>
              <DropdownMenuItem>Add from GitHub</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center border-r border-gray-200 p-2">
          <DropdownMenu open={isToolsMenuOpen} onOpenChange={setIsToolsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 rounded hover:bg-gray-100 transition-colors"
              >
                <Equal size={20} className="text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>Use style &gt;</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 py-3 px-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="How can I help you today?"
            className="w-full resize-none outline-none border-0 focus:ring-0 max-h-36 overflow-y-auto"
            rows={1}
            style={{ height: 'auto' }}
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
              "rounded-full p-2 transition-colors",
              inputValue.trim()
                ? "bg-claude-orange text-white hover:bg-opacity-90"
                : "bg-gray-200 text-gray-400"
            )}
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </form>
  );
};
