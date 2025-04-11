
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Star, Pencil, Trash2 } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ChatHeader = () => {
  const { chats, currentChatId, updateChatTitle, deleteChat } = useChatContext();
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentChat = currentChatId 
    ? chats.find(chat => chat.id === currentChatId) 
    : null;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleTitleClick = () => {
    if (currentChat) {
      setTitleInput(currentChat.title);
      setIsEditing(true);
    }
  };

  const handleTitleChange = () => {
    if (currentChatId && titleInput.trim()) {
      updateChatTitle(currentChatId, titleInput);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleChange();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleRename = () => {
    if (currentChat) {
      setTitleInput(currentChat.title);
      setIsEditing(true);
      setIsMenuOpen(false);
    }
  };

  const handleDelete = () => {
    if (currentChatId) {
      deleteChat(currentChatId);
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="flex justify-center p-3 border-b border-claude-border bg-claude-beige">
      <div className="flex items-center justify-center">
        <div className="mr-2 text-claude-orange text-xl">*</div>
        {isEditing ? (
          <input
            ref={inputRef}
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleChange}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-b border-gray-300 focus:border-claude-orange outline-none text-2xl text-center font-normal"
          />
        ) : (
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center cursor-pointer hover:opacity-80">
                <h1 className="text-2xl font-normal">
                  {currentChat?.title || 'Evening, Clarity'}
                </h1>
                <ChevronDown size={20} className="ml-1 text-gray-500" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-36">
              <DropdownMenuItem className="cursor-pointer flex items-center" onClick={() => {
                // Star functionality placeholder
                setIsMenuOpen(false);
              }}>
                <Star size={16} className="mr-2" />
                <span>Star</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center" onClick={handleRename}>
                <Pencil size={16} className="mr-2" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center text-red-500" onClick={handleDelete}>
                <Trash2 size={16} className="mr-2" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
