import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Pencil, Download } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Chat } from '@/types';

const ChatHistoryPage = () => {
  const { chats, createChat, deleteChat, downloadQueue } = useChatContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    createChat();
    navigate('/');
  };

  const handleChatClick = (id: string) => {
    navigate(`/chat/${id}`);
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteChat(id);
  };

  const handleDownloadsClick = () => {
    navigate('/downloads');
  };

  const getLastMessagePreview = (chat: Chat) => {
    if (chat.messages.length === 0) return "No messages yet";
    const lastMessage = chat.messages[chat.messages.length - 1];
    const preview = lastMessage.content.slice(0, 60) + (lastMessage.content.length > 60 ? "..." : "");
    return preview;
  };

  const getLastMessageTime = (chat: Chat) => {
    if (chat.messages.length === 0) return "";
    const lastMessage = chat.messages[chat.messages.length - 1];
    const timestamp = new Date(lastMessage.timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="w-full h-full overflow-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium text-gray-800">Your chat history</h1>
          <div className="flex items-center gap-3">
            {downloadQueue.length > 0 && (
              <Button
                variant="outline"
                onClick={handleDownloadsClick}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Downloads
                <span className="ml-1 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {downloadQueue.length}
                </span>
              </Button>
            )}
            <Button 
              onClick={handleNewChat}
              className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
            >
              + New chat
            </Button>
          </div>
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
          />
        </div>

        <p className="text-sm text-gray-500 mb-4">
          You have {chats.length} previous chats with Claude
        </p>
        
        <div className="space-y-3">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat.id)}
              onDoubleClick={() => handleChatClick(chat.id)}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors group relative"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 truncate">{chat.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {getLastMessagePreview(chat)}
                  </p>
                </div>
                <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">
                  {getLastMessageTime(chat)}
                </span>
              </div>
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button 
                  className="p-1 hover:bg-gray-200 rounded-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChatClick(chat.id);
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
      </div>
    </div>
  );
};

export default ChatHistoryPage;
