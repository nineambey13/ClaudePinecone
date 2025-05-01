import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Settings, LogOut, Download } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { UserProfileDropdown } from '../ui/UserProfileDropdown';
import { useIsMobile } from '@/hooks/use-mobile';

// Double chat bubble SVG icon component
const ChatBubbleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M9 2C5.96243 2 3.5 4.46243 3.5 7.5C3.5 8.66827 3.86369 9.75009 4.48403 10.6404C4.6225 10.8391 4.59862 11.1085 4.42735 11.2798L2.70711 13H9C12.0376 13 14.5 10.5376 14.5 7.5C14.5 4.46243 12.0376 2 9 2ZM2.5 7.5C2.5 3.91015 5.41015 1 9 1C12.5898 1 15.5 3.91015 15.5 7.5C15.5 11.0899 12.5898 14 9 14H1.5C1.29777 14 1.11545 13.8782 1.03806 13.6913C0.960669 13.5045 1.00345 13.2894 1.14645 13.1464L3.43405 10.8588C2.84122 9.87838 2.5 8.72844 2.5 7.5Z"></path>
    <path fillRule="evenodd" clipRule="evenodd" d="M16.2996 9.64015C16.5527 9.52951 16.8474 9.64493 16.9581 9.89794C17.0204 10.0405 17.0778 10.1857 17.13 10.3334C17.3698 11.0117 17.5 11.7412 17.5 12.5C17.5 13.7284 17.1588 14.8784 16.5659 15.8588L18.8535 18.1464C18.9965 18.2894 19.0393 18.5045 18.9619 18.6913C18.8845 18.8782 18.7022 19 18.5 19H11C8.59344 19 6.493 17.6919 5.36988 15.7504C5.23161 15.5113 5.31329 15.2055 5.55232 15.0672C5.79135 14.9289 6.09721 15.0106 6.23548 15.2496C7.18721 16.8949 8.96484 18 11 18H17.2929L15.5726 16.2798C15.4014 16.1085 15.3775 15.8391 15.516 15.6404C16.1363 14.7501 16.5 13.6683 16.5 12.5C16.5 11.8563 16.3896 11.2394 16.1872 10.6666C16.143 10.5418 16.0946 10.4191 16.0419 10.2986C15.9312 10.0456 16.0466 9.75079 16.2996 9.64015Z"></path>
  </svg>
);

// Square and Arrow toggle icons
const SquareIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg" 
    className="absolute shrink-0 text-gray-700 transition-all duration-150 ease-in-out select-none group-hover:opacity-0"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M2.5 3C1.67157 3 1 3.67157 1 4.5V15.5C1 16.3284 1.67157 17 2.5 17H17.5C18.3284 17 19 16.3284 19 15.5V4.5C19 3.67157 18.3284 3 17.5 3H2.5ZM2 4.5C2 4.22386 2.22386 4 2.5 4H6V16H2.5C2.22386 16 2 15.7761 2 15.5V4.5ZM7 16H17.5C17.7761 16 18 15.7761 18 15.5V4.5C18 4.22386 17.7761 4 17.5 4H7V16Z"></path>
  </svg>
);

const LeftArrowIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg" 
    className="absolute shrink-0 text-gray-500 transition-all duration-150 ease-in-out select-none opacity-0 group-hover:opacity-100"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M5 10C5 9.85913 5.05943 9.72479 5.16366 9.63003L10.6637 4.63003C10.868 4.44428 11.1842 4.45933 11.37 4.66366C11.5557 4.86799 11.5407 5.18422 11.3363 5.36997L6.7933 9.5L17.5 9.5C17.7761 9.5 18 9.72386 18 10C18 10.2761 17.7761 10.5 17.5 10.5L6.7933 10.5L11.3363 14.63C11.5407 14.8158 11.5557 15.132 11.37 15.3363C11.1842 15.5407 10.868 15.5557 10.6637 15.37L5.16366 10.37C5.05943 10.2752 5 10.1409 5 10Z"></path>
    <path fillRule="evenodd" clipRule="evenodd" d="M2.5 2C2.77614 2 3 2.22386 3 2.5L3 17.5C3 17.7761 2.77614 18 2.5 18C2.22385 18 2 17.7761 2 17.5L2 2.5C2 2.22386 2.22386 2 2.5 2Z"></path>
  </svg>
);

const RightArrowIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg" 
    className="absolute shrink-0 text-gray-500 transition-all duration-150 ease-in-out select-none opacity-0 group-hover:opacity-100"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M17.5 2C17.7761 2 18 2.22386 18 2.5V17.5C18 17.7761 17.7761 18 17.5 18C17.2239 18 17 17.7761 17 17.5V2.5C17 2.22386 17.2239 2 17.5 2ZM8.63003 4.66366C8.81578 4.45933 9.13201 4.44428 9.33634 4.63003L14.8363 9.63003C14.9406 9.72479 15 9.85913 15 10C15 10.1409 14.9406 10.2752 14.8363 10.37L9.33634 15.37C9.13201 15.5557 8.81578 15.5407 8.63003 15.3363C8.44428 15.132 8.45934 14.8158 8.66366 14.63L13.2067 10.5L2.5 10.5C2.22386 10.5 2 10.2761 2 10C2 9.72386 2.22386 9.5 2.5 9.5L13.2067 9.5L8.66366 5.36997C8.45934 5.18422 8.44428 4.86799 8.63003 4.66366Z"></path>
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
    userProfile,
    deleteChat
  } = useChatContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleNewChat = () => {
    // Delete current chat if it's empty
    if (currentChatId) {
      const currentChat = chats.find(chat => chat.id === currentChatId);
      if (currentChat && currentChat.messages.length === 0) {
        deleteChat(currentChatId);
      }
    }
    
    // Create new chat and navigate to homepage
    createChat();
    navigate('/');
  };

  // Only show the mobile toggle when not on homepage
  if (isMobile && !isHomePage) {
    return (
      <div className="fixed top-0 left-0 w-6 h-6 flex items-center justify-center cursor-pointer z-50" onClick={toggleSidebar}>
        <div className="group relative flex justify-center">
          <SquareIcon />
          <RightArrowIcon />
        </div>
      </div>
    );
  }

  // For desktop or non-homepage routes
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 bg-[#FEF8EC] h-full transition-all duration-300 flex flex-col z-50",
        sidebarExpanded ? "w-72" : "w-16"
      )}
    >
      <div className="flex items-center h-[56px] px-3">
        <div className="flex items-center -translate-y-[2.75px]">
          <div className="w-6 h-6 flex items-center justify-center cursor-pointer -translate-y-[8px]" onClick={toggleSidebar}>
            <div className="group relative flex justify-center">
              <SquareIcon />
              {sidebarExpanded ? <LeftArrowIcon /> : <RightArrowIcon />}
            </div>
          </div>
          {sidebarExpanded && (
            <span className="ml-[8px] font-['Lora'] font-semibold text-gray-800 text-[20.5px] translate-x-[1.5px]">ClarityAI</span>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <button
          onClick={handleNewChat}
          className="flex items-center w-full h-[40px] px-3"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <div className="rounded-full bg-[#D35F44] text-white p-1.5 flex items-center justify-center hover:shadow-md hover:-rotate-2 hover:scale-105 active:rotate-3 active:scale-[0.98] active:shadow-none transition-all duration-150 ease-in-out">
              <Plus size={14} strokeWidth={2.5} />
            </div>
          </div>
          {sidebarExpanded && (
            <span className="ml-2 text-[#E07A5F] font-bold text-[14px] tracking-tight">
              New chat
            </span>
          )}
        </button>
        
        <Link
          to="/chats"
          className="flex items-center w-full h-[40px] px-3"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <ChatBubbleIcon />
          </div>
          {sidebarExpanded && (
            <span className="ml-2 text-gray-700 text-[13px] tracking-tight">
              Chats
            </span>
          )}
        </Link>

        <Link
          to="/knowledge"
          className="flex items-center w-full h-[40px] px-3"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" className="text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
          </div>
          {sidebarExpanded && (
            <span className="ml-2 text-gray-700 text-[13px] tracking-tight">
              Knowledge Base
            </span>
          )}
        </Link>
      </div>

      <div className="px-2 mt-5">
        {sidebarExpanded && (
          <p className="text-xs text-gray-500 px-2 py-1 mb-0.5">Recents</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {sidebarExpanded && chats.map((chat) => (
          <Link
            key={chat.id}
            to={`/chat/${chat.id}`}
            className={cn(
              "block px-3 py-2 rounded-md text-[13px] tracking-tight truncate font-normal",
              currentChatId === chat.id
                ? "bg-gray-200 text-gray-900"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            {chat.title}
          </Link>
        ))}
      </div>

      <div className="p-2">
        <UserProfileDropdown />
      </div>
    </aside>
  );
};
