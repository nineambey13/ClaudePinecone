
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Settings, LogOut } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { UserProfileDropdown } from '../ui/UserProfileDropdown';

// Double chat bubble SVG icon component
const ChatBubbleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M9 2C5.96243 2 3.5 4.46243 3.5 7.5C3.5 8.66827 3.86369 9.75009 4.48403 10.6404C4.6225 10.8391 4.59862 11.1085 4.42735 11.2798L2.70711 13H9C12.0376 13 14.5 10.5376 14.5 7.5C14.5 4.46243 12.0376 2 9 2ZM2.5 7.5C2.5 3.91015 5.41015 1 9 1C12.5898 1 15.5 3.91015 15.5 7.5C15.5 11.0899 12.5898 14 9 14H1.5C1.29777 14 1.11545 13.8782 1.03806 13.6913C0.960669 13.5045 1.00345 13.2894 1.14645 13.1464L3.43405 10.8588C2.84122 9.87838 2.5 8.72844 2.5 7.5Z"></path>
    <path fillRule="evenodd" clipRule="evenodd" d="M16.2996 9.64015C16.5527 9.52951 16.8474 9.64493 16.9581 9.89794C17.0204 10.0405 17.0778 10.1857 17.13 10.3334C17.3698 11.0117 17.5 11.7412 17.5 12.5C17.5 13.7284 17.1588 14.8784 16.5659 15.8588L18.8535 18.1464C18.9965 18.2894 19.0393 18.5045 18.9619 18.6913C18.8845 18.8782 18.7022 19 18.5 19H11C8.59344 19 6.493 17.6919 5.36988 15.7504C5.23161 15.5113 5.31329 15.2055 5.55232 15.0672C5.79135 14.9289 6.09721 15.0106 6.23548 15.2496C7.18721 16.8949 8.96484 18 11 18H17.2929L15.5726 16.2798C15.4014 16.1085 15.3775 15.8391 15.516 15.6404C16.1363 14.7501 16.5 13.6683 16.5 12.5C16.5 11.8563 16.3896 11.2394 16.1872 10.6666C16.143 10.5418 16.0946 10.4191 16.0419 10.2986C15.9312 10.0456 16.0466 9.75079 16.2996 9.64015Z"></path>
  </svg>
);

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
  const navigate = useNavigate();

  const handleNewChat = () => {
    // Navigate to homepage instead of creating a new chat directly
    navigate('/');
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
          "flex items-center mx-4 my-2",
          sidebarExpanded ? "px-4 py-2" : "justify-center p-2",
        )}
      >
        <div className="rounded-full bg-claude-orange text-white p-2 flex items-center justify-center">
          <Plus size={18} />
        </div>
        {sidebarExpanded && <span className="ml-2">New chat</span>}
      </button>
      
      <Link
        to="/chats"
        className={cn(
          "flex items-center px-4 py-2 mt-2 text-gray-700 hover:bg-gray-100 rounded-md",
          !sidebarExpanded && "justify-center"
        )}
      >
        <ChatBubbleIcon />
        {sidebarExpanded && <span className="ml-2">Chats</span>}
      </Link>

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
