
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Pencil } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';

const ChatHistoryPage = () => {
  const { chats, createChat, deleteChat } = useChatContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    const newChatId = createChat();
    navigate(`/chat/${newChatId}`);
  };

  const handleChatClick = (id: string) => {
    navigate(`/chat/${id}`);
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteChat(id);
  };

  return (
    <div className="w-full h-full overflow-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium text-gray-800">Your chat history</h1>
          <Button 
            onClick={handleNewChat}
            className="bg-claude-orange hover:bg-claude-orange/90 text-white"
          >
            + New chat
          </Button>
        </div>
        
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search your chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-orange focus:border-transparent"
          />
        </div>

        {chats.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              You have {chats.length} previous chats with Claude
            </p>
            
            <div className="space-y-3">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors group relative"
                >
                  <h3 className="font-medium text-gray-800">{chat.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Last message {chat.messages.length > 0 ? "recently" : "just now"}
                  </p>
                  
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button 
                      className="p-1 hover:bg-gray-200 rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Rename functionality placeholder
                      }}
                    >
                      <Pencil size={16} className="text-gray-500" />
                    </button>
                    <button 
                      className="p-1 hover:bg-gray-200 rounded-md"
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                    >
                      <Trash2 size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No chats yet. Start a new conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistoryPage;
