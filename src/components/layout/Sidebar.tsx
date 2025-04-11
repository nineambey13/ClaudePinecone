
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus, ChevronLeft, ChevronRight, Settings, LogOut, Check } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { UserProfileDropdown } from '../ui/UserProfileDropdown';

export const Sidebar = () => {
  const { 
    chats, 
    createChat, 
    currentChatId,
    sidebarExpanded, 
    toggleSidebar, 
    setCurrentChat,
    userProfile 
  } = useChatContext();

  const handleNewChat = () => {
    createChat();
  };

  return (
    <aside
      className={cn(
        "bg-claude-beige border-r border-claude-border h-full transition-all duration-300 flex flex-col",
        sidebarExpanded ? "w-72" : "w-16"
      )}
    >
      <div className="flex items-center p-4">
        {sidebarExpanded && (
          <h1 className="text-xl font-semibold">Claude</h1>
        )}
      </div>

      <button
        onClick={handleNewChat}
        className={cn(
          "flex items-center bg-claude-orange text-white rounded-md hover:bg-opacity-90 transition-all mx-4 my-2",
          sidebarExpanded ? "px-4 py-2" : "justify-center p-2"
        )}
      >
        <Plus size={20} />
        {sidebarExpanded && <span className="ml-2">New chat</span>}
      </button>
      
      <div className="flex items-center px-4 py-2 mt-2">
        <MessageSquare size={20} />
        {sidebarExpanded && <span className="ml-2">Chats</span>}
      </div>

      <div className="px-2 mb-4 font-medium text-sm">
        {sidebarExpanded && <p className="text-xs text-gray-500 px-2 py-1">Recents</p>}
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {sidebarExpanded && chats.map((chat) => (
          <Link
            key={chat.id}
            to={`/chat/${chat.id}`}
            className={cn(
              "block px-3 py-2 rounded-md text-sm truncate",
              currentChatId === chat.id
                ? "bg-gray-200 text-gray-900"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            {chat.title}
          </Link>
        ))}
      </div>

      <div className="border-t border-claude-border p-2">
        <UserProfileDropdown />
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-r-md p-1 shadow-md border border-l-0 border-claude-border"
      >
        {sidebarExpanded ? (
          <ChevronLeft size={16} className="text-gray-400" />
        ) : (
          <ChevronRight size={16} className="text-gray-400" />
        )}
      </button>
    </aside>
  );
};
