
import { useRef, useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

export const ChatMessages = () => {
  const { chats, currentChatId } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  const currentChat = currentChatId 
    ? chats.find(chat => chat.id === currentChatId) 
    : null;

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  if (!currentChat) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
        {currentChat.messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start a conversation!
          </div>
        ) : (
          currentChat.messages.map((message) => (
            <div 
              key={message.id} 
              className="mb-6 group"
              onMouseEnter={() => setHoveredMessageId(message.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              {message.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-[80%] relative flex items-end gap-2">
                    <div
                      className="bg-blue-500 text-white rounded-xl px-4 py-3 whitespace-pre-wrap break-words"
                    >
                      {message.content}
                      
                      {hoveredMessageId === message.id && (
                        <button 
                          className="absolute -top-8 right-2 p-1 rounded hover:bg-gray-100 bg-white shadow-sm"
                        >
                          <Pencil size={16} className="text-gray-500" />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs font-medium">CW</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="max-w-[80%] whitespace-pre-wrap break-words text-gray-800">
                    {message.content}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
