import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Star, Pencil, Trash2, Download } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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

// Unified sidebar toggle button component
const SidebarToggle = ({ isOpen, wasOpen, onClick, className }: {
  isOpen: boolean;
  wasOpen: boolean;
  onClick: () => void;
  className?: string;
}) => {
  return (
    <div 
      id="sidebar-toggle"
      className={cn("w-7 h-7 flex items-center justify-center cursor-pointer touch-manipulation", className)}
      onClick={onClick}
      role="button"
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
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

export const ChatHeader = ({ 
  isSidebarOpen, 
  toggleSidebar, 
  showRightArrow,
  className
}: { 
  isSidebarOpen: boolean; 
  toggleSidebar: () => void; 
  showRightArrow: boolean;
  className?: string;
}) => {
  const { chats, currentChatId, updateChatTitle, deleteChat } = useChatContext();
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleToggleSidebar = () => {
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

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

  const handleExport = () => {
    if (!currentChat) return;

    // Create a formatted string of the chat
    const chatContent = currentChat.messages.map(msg => {
      const role = msg.role === 'user' ? 'You' : 'Claude';
      const timestamp = new Date(msg.timestamp).toLocaleString();
      return `${role} (${timestamp}):\n${msg.content}\n`;
    }).join('\n');

    // Create the full export content
    const exportContent = `Chat: ${currentChat.title}\n\n${chatContent}`;

    // Create and trigger download
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentChat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chat.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsMenuOpen(false);
  };

  // Mobile header component
  if (isMobile) {
    return (
      <div className={cn("fixed top-0 left-0 right-0 z-10 overflow-x-hidden", className)}>
        {/* Add subtle background blur and gradient similar to Claude */}
        <div className="absolute inset-0 bg-[#F9F3E5]/95 backdrop-blur-[2px] border-b border-[#E8E2D4] shadow-sm"></div>
        
        {/* Add subtle gradient overlay at the bottom of the header */}
        <div className="absolute inset-x-0 bottom-0 h-[4px] bg-gradient-to-b from-transparent to-[#E8E2D4]/20"></div>
        
        {/* Header content */}
        <div className="relative h-[44.5px] px-4 flex items-center">
          {/* Sidebar toggle with multiple states - use passed props */}
          <SidebarToggle 
            isOpen={isSidebarOpen}
            wasOpen={showRightArrow}
            onClick={handleToggleSidebar}
            className="shrink-0 w-9 h-9 active:bg-gray-200/50 rounded-md"
          />
          
          {/* Adjust the chat title to be positioned more to the left */}
          <div className="flex items-center ml-1 flex-1">
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                {isEditing ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleTitleChange}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent border-none focus:outline-none text-gray-800 text-[15px] font-medium"
                    autoFocus
                  />
                ) : (
                  <div 
                    className={cn(
                      "flex items-center cursor-pointer max-w-[220px]",
                      "hover:bg-gray-100/50 rounded px-1.5 py-0.5"
                    )}
                  >
                    <h1 className="text-[15px] font-medium truncate">
                      {currentChat?.title || 'New Chat'}
                    </h1>
                    <ChevronDown size={16} className="ml-1 text-gray-500 flex-shrink-0" />
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="bottom" className="w-36">
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
                <DropdownMenuItem className="cursor-pointer flex items-center" onClick={handleExport}>
                  <Download size={16} className="mr-2" />
                  <span>Export</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer flex items-center text-red-500" onClick={handleDelete}>
                  <Trash2 size={16} className="mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  }

  // Desktop header component
  return (
    <div className={cn("border-b border-[#F9F3E5] bg-[#F9F3E5]", className)}>
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center">
        <div className="flex-1">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border border-gray-300 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              autoFocus
            />
          ) : (
            <h1 
              className="text-lg font-medium text-gray-800 cursor-pointer hover:underline"
              onClick={handleTitleClick}
            >
              {currentChat?.title || 'New Chat'}
            </h1>
          )}
        </div>
        
        <div className="flex items-center">
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md hover:bg-gray-200/50 focus:outline-none">
                <ChevronDown size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
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
              <DropdownMenuItem className="cursor-pointer flex items-center" onClick={handleExport}>
                <Download size={16} className="mr-2" />
                <span>Export</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center text-red-500" onClick={handleDelete}>
                <Trash2 size={16} className="mr-2" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
