
import { useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

export const ChatMessages = () => {
  const { chats, currentChatId } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
              className={cn(
                "mb-6 group",
                message.role === 'user' ? "flex justify-end" : "flex justify-start"
              )}
            >
              <div className="max-w-[80%] relative flex items-end gap-2">
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-claude-orange flex items-center justify-center text-white">
                    <span className="text-xl">*</span>
                  </div>
                )}
                
                <div
                  className={cn(
                    "rounded-xl px-4 py-3 whitespace-pre-wrap break-words",
                    message.role === 'user'
                      ? "bg-blue-500 text-white"
                      : "bg-claude-gray text-gray-800"
                  )}
                >
                  {message.content}
                </div>
                
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium">CW</span>
                  </div>
                )}
                
                {message.role === 'user' && (
                  <button 
                    className="absolute -top-8 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
                  >
                    <Pencil size={16} className="text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
