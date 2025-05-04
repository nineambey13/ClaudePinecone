import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatHeader } from '@/components/ui/ChatHeader';
import { ChatMessages } from '@/components/ui/ChatMessages';
import { ChatInput } from '@/components/ui/ChatInput';
import { useChatContext } from '@/contexts/ChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Plus, Database, ChevronDown } from 'lucide-react';

// Square icon for sidebar toggle
const SquareIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M2.5 3C1.67157 3 1 3.67157 1 4.5V15.5C1 16.3284 1.67157 17 2.5 17H17.5C18.3284 17 19 16.3284 19 15.5V4.5C19 3.67157 18.3284 3 17.5 3H2.5ZM2 4.5C2 4.22386 2.22386 4 2.5 4H6V16H2.5C2.22386 16 2 15.7761 2 15.5V4.5ZM7 16H17.5C17.7761 16 18 15.7761 18 15.5V4.5C18 4.22386 17.7761 4 17.5 4H7V16Z"></path>
  </svg>
);

const RightArrowIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M17.5 2C17.7761 2 18 2.22386 18 2.5V17.5C18 17.7761 17.7761 18 17.5 18C17.2239 18 17 17.7761 17 17.5V2.5C17 2.22386 17.2239 2 17.5 2ZM8.63003 4.66366C8.81578 4.45933 9.13201 4.44428 9.33634 4.63003L14.8363 9.63003C14.9406 9.72479 15 9.85913 15 10C15 10.1409 14.9406 10.2752 14.8363 10.37L9.33634 15.37C9.13201 15.5557 8.81578 15.5407 8.63003 15.3363C8.44428 15.132 8.45934 14.8158 8.66366 14.63L13.2067 10.5L2.5 10.5C2.22386 10.5 2 10.2761 2 10C2 9.72386 2.22386 9.5 2.5 9.5L13.2067 9.5L8.66366 5.36997C8.45934 5.18422 8.44428 4.86799 8.63003 4.66366Z"></path>
  </svg>
);

const LeftArrowIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M5 10C5 9.85913 5.05943 9.72479 5.16366 9.63003L10.6637 4.63003C10.868 4.44428 11.1842 4.45933 11.37 4.66366C11.5557 4.86799 11.5407 5.18422 11.3363 5.36997L6.7933 9.5L17.5 9.5C17.7761 9.5 18 9.72386 18 10C18 10.2761 17.7761 10.5 17.5 10.5L6.7933 10.5L11.3363 14.63C11.5407 14.8158 11.5557 15.132 11.37 15.3363C11.1842 15.5407 10.868 15.5557 10.6637 15.37L5.16366 10.37C5.05943 10.2752 5 10.1409 5 10Z"></path>
    <path fillRule="evenodd" clipRule="evenodd" d="M2.5 2C2.77614 2 3 2.22386 3 2.5L3 17.5C3 17.7761 2.77614 18 2.5 18C2.22385 18 2 17.7761 2 17.5L2 2.5C2 2.22386 2.22386 2 2.5 2Z"></path>
  </svg>
);

// Double chat bubble SVG icon component
const ChatBubbleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M9 2C5.96243 2 3.5 4.46243 3.5 7.5C3.5 8.66827 3.86369 9.75009 4.48403 10.6404C4.6225 10.8391 4.59862 11.1085 4.42735 11.2798L2.70711 13H9C12.0376 13 14.5 10.5376 14.5 7.5C14.5 4.46243 12.0376 2 9 2ZM2.5 7.5C2.5 3.91015 5.41015 1 9 1C12.5898 1 15.5 3.91015 15.5 7.5C15.5 11.0899 12.5898 14 9 14H1.5C1.29777 14 1.11545 13.8782 1.03806 13.6913C0.960669 13.5045 1.00345 13.2894 1.14645 13.1464L3.43405 10.8588C2.84122 9.87838 2.5 8.72844 2.5 7.5Z"></path>
    <path fillRule="evenodd" clipRule="evenodd" d="M16.2996 9.64015C16.5527 9.52951 16.8474 9.64493 16.9581 9.89794C17.0204 10.0405 17.0778 10.1857 17.13 10.3334C17.3698 11.0117 17.5 11.7412 17.5 12.5C17.5 13.7284 17.1588 14.8784 16.5659 15.8588L18.8535 18.1464C18.9965 18.2894 19.0393 18.5045 18.9619 18.6913C18.8845 18.8782 18.7022 19 18.5 19H11C8.59344 19 6.493 17.6919 5.36988 15.7504C5.23161 15.5113 5.31329 15.2055 5.55232 15.0672C5.79135 14.9289 6.09721 15.0106 6.23548 15.2496C7.18721 16.8949 8.96484 18 11 18H17.2929L15.5726 16.2798C15.4014 16.1085 15.3775 15.8391 15.516 15.6404C16.1363 14.7501 16.5 13.6683 16.5 12.5C16.5 11.8563 16.3896 11.2394 16.1872 10.6666C16.143 10.5418 16.0946 10.4191 16.0419 10.2986C15.9312 10.0456 16.0466 9.75079 16.2996 9.64015Z"></path>
  </svg>
);

// Unified sidebar toggle button component - directly copied from TestMobileInputPage
const SidebarToggle = ({ isOpen, wasOpen, onClick, className }: {
  isOpen: boolean;
  wasOpen: boolean;
  onClick: () => void;
  className?: string;
}) => {
  return (
    <div
      id="sidebar-toggle"
      className={cn("w-7 h-7 flex items-center justify-center cursor-pointer", className)}
      onClick={onClick}
    >
      <div className="relative w-[23px] h-[23px] flex items-center justify-center">
        {/* Background for arrows - light to medium gray transparent color */}
        {(isOpen || wasOpen) && (
          <div className="absolute inset-0 bg-gray-300/50 rounded-md"></div>
        )}

        {!isOpen ? (
          <>
            {/* Square icon - visible by default when closed */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out",
              wasOpen ? "opacity-0" : "opacity-100"
            )}>
              <SquareIcon />
            </div>

            {/* Right arrow - only visible after sidebar was closed */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out",
              wasOpen ? "opacity-100" : "opacity-0"
            )}>
              <RightArrowIcon />
            </div>
          </>
        ) : (
          /* Left arrow - only visible when sidebar is open */
          <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out opacity-100">
            <LeftArrowIcon />
          </div>
        )}
      </div>
    </div>
  );
};

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { chats, setCurrentChat, userProfile: contextUserProfile } = useChatContext();
  const isMobile = useIsMobile();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [activeSection, setActiveSection] = useState<'chats' | 'knowledge'>('chats');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const currentChat = chats.find(chat => chat.id === id);
  const hasMessages = currentChat?.messages.length > 0;

  // Use the userProfile from context if available, otherwise use local mock
  const userProfile = contextUserProfile || {
    initials: 'CW',
    name: 'Clarity World',
    role: 'Creator'
  };

  useEffect(() => {
    if (id) {
      const chat = chats.find(chat => chat.id === id);
      if (chat) {
        setCurrentChat(id);
      } else {
        navigate('/');
      }
    }
  }, [id, chats, navigate, setCurrentChat]);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const toggleButton = document.getElementById('sidebar-toggle');
      if (toggleButton && !toggleButton.contains(e.target as Node) && !isSidebarOpen) {
        setShowRightArrow(false);
      }

      // Close user dropdown when clicking outside
      const userDropdown = document.getElementById('user-dropdown-button');
      if (userDropdown && !userDropdown.contains(e.target as Node) && isUserDropdownOpen) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isSidebarOpen, isUserDropdownOpen]);

  useEffect(() => {
    setShowRightArrow(false);
  }, []);

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      setShowRightArrow(true);
    }
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = () => {
    // Don't create a new chat immediately - wait for first message
    setCurrentChat('');
    toggleSidebar();
    navigate('/');
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChat(chatId);
    toggleSidebar();
    navigate(`/chat/${chatId}`);
  };

  if (!currentChat) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-[#F9F3E5] overflow-x-hidden">
      {(hasMessages || isMobile) && <ChatHeader
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        showRightArrow={showRightArrow}
        className="pl-1"
      />}
      <div className={cn(
        "flex-1 overflow-y-auto",
        // Add padding top when header is visible on mobile to account for fixed positioning
        isMobile && (hasMessages || isMobile) ? "pt-[44.5px]" : "",
        // Add padding bottom on mobile for fixed input box
        isMobile ? "pb-[72px]" : ""
      )}>
        <ChatMessages />
      </div>
      <div className={cn(
        "p-4 border-t border-[#F9F3E5] flex justify-center",
        !hasMessages && "mt-auto",
        // Add fixed positioning for mobile
        isMobile ? "fixed bottom-0 left-0 right-0 bg-[#F9F3E5] z-10 overflow-x-hidden" : ""
      )}>
        <ChatInput />
      </div>

      {isMobile && (
        <>
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-30"
              onClick={toggleSidebar}
            />
          )}

          <div
            className={cn(
              "fixed top-0 left-0 h-full bg-[#F9F3E5] w-[90%] max-w-[330px] z-40 transition-transform duration-300 shadow-lg overflow-y-auto overflow-x-hidden flex flex-col",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* Sidebar Header */}
            <div className="flex items-center h-[44.5px] px-2">
              <div className="flex items-center h-full">
                <div className="flex items-center justify-center w-7 h-7">
                  <SidebarToggle
                    isOpen={true}
                    wasOpen={false}
                    onClick={toggleSidebar}
                  />
                </div>
                <span className="ml-2 font-['Lora'] font-semibold text-gray-800 text-[17.5px]">ClarityAI</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* New Chat Button */}
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
                  <span className="ml-2 text-[#E07A5F] font-bold text-[14px] tracking-tight">
                    New chat
                  </span>
                </button>

                {/* Chats Link */}
                <button
                  className={cn(
                    "flex items-center w-full h-[40px] px-3",
                    activeSection === 'chats' ? "bg-gray-100 rounded-md" : ""
                  )}
                  onClick={() => setActiveSection('chats')}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    <ChatBubbleIcon />
                  </div>
                  <span className="ml-2 text-gray-700 text-[13px] tracking-tight">
                    Chats
                  </span>
                </button>

                {/* Knowledge Base Link */}
                <button
                  className={cn(
                    "flex items-center w-full h-[40px] px-3",
                    activeSection === 'knowledge' ? "bg-gray-100 rounded-md" : ""
                  )}
                  onClick={() => navigate('/knowledge')}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Database size={16} className="text-gray-700" />
                  </div>
                  <span className="ml-2 text-gray-700 text-[13px] tracking-tight">
                    Knowledge Base
                  </span>
                </button>
              </div>

              {/* Section Title */}
              <div className="px-2 mt-5">
                <p className="text-xs text-gray-500 px-2 py-1 mb-0.5">
                  {activeSection === 'knowledge' ? 'Saved Knowledge' : 'Recents'}
                </p>
              </div>

              {/* Content List - Either Chats or Knowledge Base entries */}
              <div className="flex-1 overflow-y-auto px-2">
                {activeSection === 'chats' ? (
                  // Chat List
                  chats.length > 0 ? (
                    chats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => handleChatSelect(chat.id)}
                        className={cn(
                          "block w-full text-left px-3 py-2 rounded-md text-[13px] tracking-tight truncate font-normal",
                          id === chat.id
                            ? "bg-gray-200 text-gray-900"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        {chat.title}
                      </button>
                    ))
                  ) : (
                    <div className="text-gray-500 text-xs italic px-3 py-2">
                      No chats yet. Create a new chat to get started.
                    </div>
                  )
                ) : (
                  // Knowledge Base Entries (placeholder)
                  <div className="text-gray-500 text-xs italic px-3 py-2">
                    No knowledge entries yet. Save messages to create entries.
                  </div>
                )}
              </div>
            </div>

            {/* User Profile Section - Fixed at bottom */}
            <div className="p-2 mt-auto border-t border-gray-200">
              <div className="relative">
                <button
                  id="user-dropdown-button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex w-full items-center space-x-2 -translate-x-[2px] p-[6px] hover:bg-black/5 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm text-gray-700">{userProfile.initials}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-700">{userProfile.name}</div>
                    <div className="text-xs text-gray-500">{userProfile.role}</div>
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm text-gray-700">{userProfile.initials}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{userProfile.name}</div>
                          <div className="text-sm text-gray-500">{userProfile.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPage;
