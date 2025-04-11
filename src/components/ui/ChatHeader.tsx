
import { useState, useRef, useEffect } from 'react';
import { useChatContext } from '@/contexts/ChatContext';

export const ChatHeader = () => {
  const { chats, currentChatId, updateChatTitle } = useChatContext();
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState('');
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
          <h1 
            onClick={handleTitleClick}
            className="text-2xl font-normal cursor-pointer hover:opacity-80"
          >
            {currentChat?.title || 'Evening, Clarity'}
          </h1>
        )}
      </div>
    </div>
  );
};
