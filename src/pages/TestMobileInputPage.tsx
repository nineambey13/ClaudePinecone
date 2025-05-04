import React, { useState, useRef, FormEvent, ChangeEvent, useEffect } from 'react';
import {
  MessageCircle, Settings, Plus, ChevronDown, X, Paperclip, LogOut,
  Database, StopCircle, Save, Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChatContext } from '@/contexts/ChatContext';
import { useNavigate } from 'react-router-dom';

// Icons to be used inside the SidebarToggle component
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

// Double chat bubble SVG icon component
const ChatBubbleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M9 2C5.96243 2 3.5 4.46243 3.5 7.5C3.5 8.66827 3.86369 9.75009 4.48403 10.6404C4.6225 10.8391 4.59862 11.1085 4.42735 11.2798L2.70711 13H9C12.0376 13 14.5 10.5376 14.5 7.5C14.5 4.46243 12.0376 2 9 2ZM2.5 7.5C2.5 3.91015 5.41015 1 9 1C12.5898 1 15.5 3.91015 15.5 7.5C15.5 11.0899 12.5898 14 9 14H1.5C1.29777 14 1.11545 13.8782 1.03806 13.6913C0.960669 13.5045 1.00345 13.2894 1.14645 13.1464L3.43405 10.8588C2.84122 9.87838 2.5 8.72844 2.5 7.5Z"></path>
    <path fillRule="evenodd" clipRule="evenodd" d="M16.2996 9.64015C16.5527 9.52951 16.8474 9.64493 16.9581 9.89794C17.0204 10.0405 17.0778 10.1857 17.13 10.3334C17.3698 11.0117 17.5 11.7412 17.5 12.5C17.5 13.7284 17.1588 14.8784 16.5659 15.8588L18.8535 18.1464C18.9965 18.2894 19.0393 18.5045 18.9619 18.6913C18.8845 18.8782 18.7022 19 18.5 19H11C8.59344 19 6.493 17.6919 5.36988 15.7504C5.23161 15.5113 5.31329 15.2055 5.55232 15.0672C5.79135 14.9289 6.09721 15.0106 6.23548 15.2496C7.18721 16.8949 8.96484 18 11 18H17.2929L15.5726 16.2798C15.4014 16.1085 15.3775 15.8391 15.516 15.6404C16.1363 14.7501 16.5 13.6683 16.5 12.5C16.5 11.8563 16.3896 11.2394 16.1872 10.6666C16.143 10.5418 16.0946 10.4191 16.0419 10.2986C15.9312 10.0456 16.0466 9.75079 16.2996 9.64015Z"></path>
  </svg>
);

// Sample tag options for knowledge base
const tagOptions = [
  'javascript', 'react', 'typescript', 'frontend', 'backend',
  'api', 'database', 'ui', 'ux', 'performance', 'security',
  'accessibility', 'mobile', 'desktop', 'architecture',
  'testing', 'deployment', 'design', 'analytics'
];

// Message types
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
  isGenerating?: boolean;
}

// Add new CSS in the component
const mobileDropdownStyles = `
  .dropdown-content {
    position: fixed !important;
    z-index: 999 !important;
  }

  .touch-manipulation {
    touch-action: manipulation;
  }

  /* Ensure model dropdown is visible and properly positioned */
  .model-dropdown {
    transform: translateX(-20px) !important;
    right: 0 !important;
    left: auto !important;
  }
`;

const TestMobileInputPage: React.FC = () => {
  const {
    chats,
    currentChatId,
    sendMessage: contextSendMessage,
    setCurrentChat,
    isLoading: contextIsLoading,
    stopGeneration: contextStopGeneration,
    userProfile: contextUserProfile
  } = useChatContext();

  const navigate = useNavigate();
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Claude 3.7 Sonnet');
  const [inputValue, setInputValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  // Using mock chats only when global chats aren't available
  const [isGenerating, setIsGenerating] = useState(false);

  // Ref to store the generation interval ID so we can clear it when stopping
  const generationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current chat from the context
  const currentChat = currentChatId ? chats.find(chat => chat.id === currentChatId) : null;

  // Ref for message container to scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChat?.messages]);

  // Reset showRightArrow on initial page load
  useEffect(() => {
    setShowRightArrow(false);
  }, []);

  // Handle clicks anywhere on the page to reset right arrow visibility
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Check if click is not on the sidebar toggle button
      const toggleButton = document.getElementById('sidebar-toggle');
      if (toggleButton && !toggleButton.contains(e.target as Node) && !isSidebarOpen) {
        setShowRightArrow(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isSidebarOpen]);

  // Use the userProfile from context if available, otherwise use local mock
  const userProfile = contextUserProfile || {
    initials: 'CW',
    name: 'ClarityAI',
    role: 'Creator'
  };

  const models = [
    {
      name: 'Claude 3.5 Haiku',
      description: 'Fastest model for daily tasks'
    },
    {
      name: 'Claude 3.7 Sonnet',
      description: 'Our most intelligent model yet'
    }
  ];

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      // When closing sidebar, show right arrow
      setShowRightArrow(true);
    }
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = () => {
    // Don't create a new chat immediately - wait for first message
    setCurrentChat('');
    setInputValue('');
    toggleSidebar();
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChat(chatId);
    toggleSidebar();
    navigate(`/chat/${chatId}`);
  };

  // Send a message using the context's sendMessage
  const sendMessage = () => {
    if (!inputValue.trim() || contextIsLoading) return;

    const chatId = contextSendMessage(inputValue);
    setInputValue('');

    if (window.location.pathname === '/') {
      navigate(`/chat/${chatId}`);
    }
  };

  // Use context's stopGeneration
  const stopGeneration = () => {
    contextStopGeneration();
  };

  // Check if there are messages in the current chat
  const hasMessages = currentChat && currentChat.messages.length > 0;

  // Add greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Refs for file uploads
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // Handle file upload state
  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setIsUploadMenuOpen(false);
  };

  // Add touch events handling
  useEffect(() => {
    const handleTouchOutside = (e: TouchEvent) => {
      const element = e.target as Node;
      const dropdownButtons = document.querySelectorAll('.dropdown-trigger');

      // Close dropdowns when touching outside
      let clickedInsideDropdown = false;
      dropdownButtons.forEach(button => {
        if (button.contains(element)) {
          clickedInsideDropdown = true;
        }
      });

      if (!clickedInsideDropdown) {
        setIsUploadMenuOpen(false);
        // Don't close model menu here - it's handled by the DropdownMenu component
      }
    };

    document.addEventListener('touchstart', handleTouchOutside);
    return () => {
      document.removeEventListener('touchstart', handleTouchOutside);
    };
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    setSelectedFile(file);

    // Create a preview URL for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviewUrl(null);
    }

    // Mock file upload process
    mockFileUpload(file);
  };

  const mockFileUpload = (file: File) => {
    setIsFileUploading(true);
    setUploadProgress(0);

    const totalSteps = 10;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setUploadProgress(Math.round((currentStep / totalSteps) * 100));

      if (currentStep === totalSteps) {
        clearInterval(interval);
        setIsFileUploading(false);

        // Add message about the uploaded file
        const content = `Uploaded file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        const userMessage: Message = {
          id: Date.now().toString(),
          content,
          role: 'user',
          createdAt: new Date()
        };

        addMessageAndGenerateResponse(userMessage);
      }
    }, 300);
  };

  // Helper function to add message and generate response
  const addMessageAndGenerateResponse = (userMessage: Message) => {
    let updatedChats = [...chats];
    let chatToUpdate;

    // If no current chat, create a new one
    if (!currentChatId) {
      const newChat = {
        id: Date.now().toString(),
        title: userMessage.content.slice(0, 30) + (userMessage.content.length > 30 ? '...' : ''),
        messages: [userMessage],
        createdAt: new Date()
      };

      updatedChats = [newChat, ...updatedChats];
      setCurrentChat(newChat.id);
      chatToUpdate = newChat;
    } else {
      // Update existing chat
      chatToUpdate = updatedChats.find(chat => chat.id === currentChatId);
      if (chatToUpdate) {
        chatToUpdate.messages = [...chatToUpdate.messages, userMessage];
      }
    }

    setCurrentChat(chatToUpdate.id);

    // Generate AI response
    generateResponse(chatToUpdate);
  };

  // Add this function to handle mobile touchstart events
  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent default behavior for dropdown triggers
    if ((e.target as HTMLElement).closest('.dropdown-trigger')) {
      e.preventDefault();
    }
  };

  // Update state to handle manual closing of dropdowns
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

  // Close all menus
  const closeAllMenus = () => {
    setIsUploadMenuOpen(false);
    setIsModelMenuOpen(false);
  };

  // Add event listener to close menus when tapping outside
  useEffect(() => {
    const handleDocumentTouchStart = (e: TouchEvent) => {
      const element = e.target as Node;
      const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
      const dropdownContents = document.querySelectorAll('.dropdown-content');

      // Check if touch is outside both triggers and content
      let insideDropdown = false;

      dropdownTriggers.forEach(trigger => {
        if (trigger.contains(element)) {
          insideDropdown = true;
        }
      });

      dropdownContents.forEach(content => {
        if (content.contains(element)) {
          insideDropdown = true;
        }
      });

      if (!insideDropdown) {
        closeAllMenus();
      }
    };

    document.addEventListener('touchstart', handleDocumentTouchStart);
    return () => {
      document.removeEventListener('touchstart', handleDocumentTouchStart);
    };
  }, []);

  // Pinecone integration
  const handlePineconeClick = () => {
    // Open Pinecone configuration dialog instead of sending a message
    alert("Opening Pinecone configuration...");
    setIsUploadMenuOpen(false);
  };

  // Pinecone knowledge base state
  const [isPineconeUpsertOpen, setIsPineconeUpsertOpen] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [upsertTitle, setUpsertTitle] = useState('');
  const [upsertContent, setUpsertContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedContentType, setSelectedContentType] = useState<'code' | 'decision' | 'feature' | 'knowledge'>('knowledge');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<'chats' | 'knowledge'>('chats');
  const [pineconeEntries, setPineconeEntries] = useState<{
    id: string;
    content: string;
    metadata: {
      type: 'code' | 'decision' | 'feature' | 'knowledge';
      tags: string[];
      created: Date;
      sourceMessageIds: string[];
      title: string;
      lastAccessed?: Date;
      accessCount?: number;
      version?: number;
      visibility?: 'private' | 'team' | 'organization' | 'public';
      status?: 'draft' | 'published' | 'archived' | 'flagged';
      aiGenerated?: boolean;
    };
    relatedEntries?: string[];
  }[]>([]);

  // Pinecone entry detail state
  const [isEntryDetailOpen, setIsEntryDetailOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<typeof pineconeEntries[0] | null>(null);

  // Save to Knowledge Base handler
  const handleSaveToKnowledgeBase = (message: Message) => {
    setIsUploadMenuOpen(false);
    setIsPineconeUpsertOpen(true);

    // If there's a current chat, use the last message as default content
    if (currentChat && currentChat.messages.length > 0) {
      const lastMessage = currentChat.messages[currentChat.messages.length - 1];
      setUpsertContent(lastMessage.content);

      // Generate a default title from the message content
      const firstLine = lastMessage.content.split('\n')[0];
      setUpsertTitle(firstLine.slice(0, 30) + (firstLine.length > 30 ? '...' : ''));

      // Set the last message as selected
      setSelectedMessages([lastMessage.id]);

      // Detect potential content type based on content
      let detectedType: 'code' | 'decision' | 'feature' | 'knowledge' = 'knowledge';
      const lowerContent = lastMessage.content.toLowerCase();
      if (lowerContent.includes('```') || lowerContent.includes('function') || lowerContent.includes('class')) {
        detectedType = 'code';
      } else if (lowerContent.includes('decid') || lowerContent.includes('option') || lowerContent.includes('chose')) {
        detectedType = 'decision';
      } else if (lowerContent.includes('feature') || lowerContent.includes('implement') || lowerContent.includes('develop')) {
        detectedType = 'feature';
      }

      setSelectedContentType(detectedType);

      // Generate potential tags based on content
      const potentialTags = ['pinecone', 'knowledge-base'];
      if (lowerContent.includes('react')) potentialTags.push('react');
      if (lowerContent.includes('typescript')) potentialTags.push('typescript');
      if (lowerContent.includes('ui') || lowerContent.includes('interface')) potentialTags.push('ui');

      setSelectedTags(potentialTags.slice(0, 3)); // Limit to 3 initial tags
    }
  };

  // Save the entry to Pinecone
  const handleSaveToPinecone = () => {
    // Create a new Pinecone entry with enhanced metadata
    const newEntry = {
      id: Date.now().toString(),
      content: upsertContent,
      metadata: {
        type: selectedContentType,
        tags: selectedTags,
        created: new Date(),
        sourceMessageIds: selectedMessages,
        title: upsertTitle || `New entry ${Date.now()}`,
        lastAccessed: new Date(),
        accessCount: 0,
        version: 1,
        visibility: 'private' as const,
        status: 'published' as const,
        aiGenerated: false
      },
      relatedEntries: []
    };

    // Add to our mock database
    setPineconeEntries([...pineconeEntries, newEntry]);

    // Reset the upsert state
    setIsPineconeUpsertOpen(false);
    setSelectedContentType('knowledge');
    setSelectedTags([]);
    setUpsertTitle('');
    setUpsertContent('');
    setSelectedMessages([]);

    // Add a confirmation message to the chat
    if (currentChat) {
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        content: `✅ Successfully saved to Knowledge Base as "${newEntry.metadata.title}" with tags: ${newEntry.metadata.tags.length > 0 ? newEntry.metadata.tags.join(', ') : 'none'}`,
        role: 'assistant',
        createdAt: new Date()
      };

      const updatedChats = chats.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, confirmationMessage] }
          : chat
      );

      setCurrentChat(currentChat.id);
    }
  };

  // View Knowledge Entry
  const handleViewEntry = (entry: typeof pineconeEntries[0]) => {
    setSelectedEntry(entry);
    setIsEntryDetailOpen(true);

    // Update last accessed time and access count
    const updatedEntries = pineconeEntries.map(e => {
      if (e.id === entry.id) {
        return {
          ...e,
          metadata: {
            ...e.metadata,
            lastAccessed: new Date(),
            accessCount: (e.metadata.accessCount || 0) + 1
          }
        };
      }
      return e;
    });

    setPineconeEntries(updatedEntries);
    toggleSidebar(); // Close the sidebar when viewing an entry
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden" style={{ backgroundColor: '#F9F3E5' }}>
      {/* Add a style tag for custom mobile styles */}
      <style>{mobileDropdownStyles}</style>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full bg-[#F9F3E5] w-[330px] z-40 transition-transform duration-300 shadow-lg overflow-y-auto flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center h-14 px-2">
          <div className="flex items-center h-full">
            {/* Sidebar toggle button inside sidebar - aligned with other icons */}
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
                      currentChatId === chat.id
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
              // Knowledge Base Entries
              pineconeEntries.length > 0 ? (
                pineconeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewEntry(entry)}
                  >
                    <div className="flex items-start">
                      <div
                        className="w-2 h-full rounded-full mr-2 mt-1"
                        style={{
                          backgroundColor:
                            entry.metadata.type === 'code' ? '#6366F1' :
                            entry.metadata.type === 'decision' ? '#F97316' :
                            entry.metadata.type === 'feature' ? '#8B5CF6' :
                            '#10B981'
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1">{entry.metadata.title}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{entry.content}</p>
                        <div className="flex flex-wrap gap-1">
                          {entry.metadata.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded-full text-[10px]"
                            >
                              {tag}
                            </span>
                          ))}
                          {entry.metadata.tags.length > 3 && (
                            <span className="text-[10px] text-gray-500">
                              +{entry.metadata.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-xs italic px-3 py-2">
                  No knowledge entries yet. Save messages to create entries.
                </div>
              )
            )}
          </div>
        </div>

        {/* User Profile Section - Fixed at bottom */}
        <div className="p-2 mt-auto border-t border-gray-200">
          <div className="relative">
            <button
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
                <div className="py-2">
                  <DropdownMenu open={isUserDropdownOpen} onOpenChange={setIsUserDropdownOpen}>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 z-50 bg-white rounded-md shadow-lg"
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          navigate('/settings');
                          setIsUserDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 cursor-pointer touch-manipulation"
                      >
                        <Settings size={16} className="text-gray-500" />
                        <span className="text-sm">Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/logout')} className="cursor-pointer">
                        <LogOut size={16} className="mr-2" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Toggle Button - outside sidebar (visible when closed) */}
      {!isSidebarOpen && (
        <SidebarToggle
          isOpen={false}
          wasOpen={showRightArrow}
          onClick={toggleSidebar}
          className="fixed top-0 left-0 z-50 m-3"
        />
      )}

      {/* Chat Messages Container */}
      {hasMessages && (
        <div className="h-screen w-full overflow-y-auto pb-[180px] pt-14">
          <div className="max-w-3xl mx-auto px-4">
            {currentChat?.messages.map((message) => (
              <div key={message.id} className="mb-6">
                {message.role === 'user' ? (
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <span className="text-sm text-gray-700">{userProfile.initials}</span>
                    </div>
                    <div className="ml-3 bg-white rounded-lg p-3 shadow-sm relative">
                      <p className="text-gray-800">{message.content}</p>
                      {message.relatedKnowledge && message.relatedKnowledge.length > 0 && (
                        <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1">
                          <div className="bg-blue-100 text-blue-800 rounded-full p-1">
                            <Database size={12} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full shrink-0 mt-1 flex">
                      {/* AI avatar removed */}
                    </div>
                    <div className="ml-3 relative">
                      <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                      {message.isGenerating && (
                        <span className="inline-block w-1.5 h-4 ml-0.5 bg-black animate-blink"></span>
                      )}
                      {message.usedStoredKnowledge && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <Database size={12} className="mr-1" />
                          <span>Used knowledge from Pinecone</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Header with greeting - only shown when no active chat */}
      {!hasMessages && (
        <div className="fixed left-0 right-0 top-[20%] flex flex-col items-center">
          <div className="text-[#E07A5F] mb-3">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 1C18 1 21.1603 7.60113 21.1603 12.9018C21.1603 16.7938 19.1377 19.9549 18 19.9549C16.8623 19.9549 14.8397 16.7938 14.8397 12.9018C14.8397 7.60113 18 1 18 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 35C18 35 14.8397 28.3989 14.8397 23.0982C14.8397 19.2062 16.8623 16.0451 18 16.0451C19.1377 16.0451 21.1603 19.2062 21.1603 23.0982C21.1603 28.3989 18 35 18 35Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M35 18C35 18 28.3989 21.1603 23.0982 21.1603C19.2062 21.1603 16.0451 19.1377 16.0451 18C16.0451 16.8623 19.2062 14.8397 23.0982 14.8397C28.3989 14.8397 35 18 35 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 18C1 18 7.60113 14.8397 12.9018 14.8397C16.7938 14.8397 19.9549 16.8623 19.9549 18C19.9549 19.1377 16.7938 21.1603 12.9018 21.1603C7.60113 21.1603 1 18 1 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M29.8635 6.13653C29.8635 6.13653 25.466 11.2929 21.1603 14.0416C18.1322 16.0163 14.8115 16.0163 14.0416 14.8397C13.2716 13.6631 14.8115 10.6351 17.8396 7.60113C21.1603 3.96033 29.8635 6.13653 29.8635 6.13653Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.13653 29.8635C6.13653 29.8635 10.534 24.7071 14.8397 21.9584C17.8678 19.9837 21.1885 19.9837 21.9584 21.1603C22.7284 22.3369 21.1885 25.3649 18.1604 28.3989C14.8397 32.0397 6.13653 29.8635 6.13653 29.8635Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M29.8635 29.8635C29.8635 29.8635 24.7071 25.466 21.9584 21.1603C19.9837 18.1322 19.9837 14.8115 21.1603 14.0416C22.3369 13.2716 25.3649 14.8115 28.3989 17.8396C32.0397 21.1603 29.8635 29.8635 29.8635 29.8635Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.13653 6.13653C6.13653 6.13653 11.2929 10.534 14.0416 14.8397C16.0163 17.8678 16.0163 21.1885 14.8397 21.9584C13.6631 22.7284 10.6351 21.1885 7.60113 18.1604C3.96033 14.8397 6.13653 6.13653 6.13653 6.13653Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-gray-800 text-[37px] font-['Lora'] font-medium text-center mb-4">
            {getGreeting()}, Clarity
          </h1>
        </div>
      )}

      {/* Chat Input - positioned at bottom when chat is active, or below greeting when no messages */}
      <div
        className={cn(
          "fixed z-20 transition-all duration-300 ease-in-out w-full px-4 pb-4",
          hasMessages
            ? "bottom-[16px]" // Raised from bottom edge
            : "top-[calc(20%+130px)] left-1/2 -translate-x-1/2 w-[400px] px-0"
        )}
      >
        <div className="relative bg-white rounded-[20px] border border-[#D4D4D4] shadow-sm w-full">
          {/* Input area */}
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            className="w-full h-[125px] md:h-[130px] resize-none outline-none rounded-[20px]"
            style={{
              padding: '10px 12px',
              paddingTop: '10px',
              paddingRight: '120px' // Reduced from 140px to 120px for mobile
            }}
            placeholder="How may I assist you today?"
          />

          {/* Upload menu */}
          <div className="absolute left-3.5 bottom-3">
            <DropdownMenu open={isUploadMenuOpen} onOpenChange={setIsUploadMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center relative border border-gray-200 rounded-lg p-1.5 hover:bg-gray-100 touch-manipulation dropdown-trigger"
                  onTouchStart={handleTouchStart}
                >
                  {isUploadMenuOpen ? (
                    <X size={18} className="text-gray-500" />
                  ) : (
                    <Plus size={18} className="text-gray-500" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="top"
                className="w-56 z-[999] dropdown-content"
                sideOffset={5}
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer touch-manipulation"
                  onClick={handleFileUploadClick}
                >
                  <Paperclip size={16} className="text-gray-500" />
                  <span className="text-sm">Upload a file</span>
                </DropdownMenuItem>

                {currentChat && currentChat.messages.length > 0 && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer touch-manipulation"
                    onClick={() => {
                      handleSaveToKnowledgeBase(currentChat.messages[currentChat.messages.length - 1]);
                      setIsUploadMenuOpen(false);
                    }}
                  >
                    <Database size={16} className="text-gray-500" />
                    <span className="text-sm">Save to Knowledge Base</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bottom right controls */}
          <div className="absolute right-2.5 bottom-3 flex items-center gap-2"> {/* Changed right from 3.5 to 2.5 and gap from 3 to 2 */}
            {/* Stop Generation Button - only visible when generating */}
            {isGenerating && (
              <button
                onClick={stopGeneration}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:bg-gray-100 rounded px-2 py-1 touch-manipulation"
              >
                <StopCircle size={16} className="text-gray-600" />
                <span>Stop</span>
              </button>
            )}

            {/* Model selector */}
            <DropdownMenu open={isModelMenuOpen} onOpenChange={setIsModelMenuOpen}>
              <DropdownMenuTrigger
                className="flex items-center gap-1 text-sm text-gray-500 hover:bg-gray-100 rounded px-2 py-1 touch-manipulation dropdown-trigger"
                onTouchStart={handleTouchStart}
              >
                <span className="truncate max-w-[90px]">{selectedModel}</span>
                <ChevronDown size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="bottom"
                className="z-[999] dropdown-content model-dropdown w-56"
                sideOffset={5}
              >
                {models.slice(0, 2).map((model) => (
                  <DropdownMenuItem
                    key={model.name}
                    onClick={() => setSelectedModel(model.name)}
                    className="flex flex-col items-start cursor-pointer touch-manipulation py-2 pl-2"
                  >
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="font-medium">{model.name}</span>
                      {model.name === selectedModel && <span className="text-green-500">✓</span>}
                    </div>
                    {model.description && (
                      <span className="text-xs text-gray-500 mt-0.5">{model.description}</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Send button */}
            <button
              type="button"
              onClick={sendMessage}
              className={cn(
                "inline-flex items-center justify-center rounded-lg p-1.5 touch-manipulation",
                "bg-[#C75C4A] disabled:bg-[#C75C4A]/60", // More faded when disabled (60% opacity)
                "text-white"
              )}
              disabled={!inputValue.trim() || isGenerating}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      {/* File upload progress indicator - only shown when uploading */}
      {isFileUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[80%] max-w-[300px]">
            <p className="text-center mb-2">Uploading file...</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className="bg-[#C75C4A] h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-500">{uploadProgress}%</p>
          </div>
        </div>
      )}

      {/* Pinecone Entry Upsert Modal */}
      {isPineconeUpsertOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-medium">Save to Knowledge Base</h2>
              <button
                className="text-gray-500"
                onClick={() => setIsPineconeUpsertOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Title</label>
                  <input
                    type="text"
                    value={upsertTitle}
                    onChange={(e) => setUpsertTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Entry title"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Content</label>
                  <textarea
                    value={upsertContent}
                    onChange={(e) => setUpsertContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-32 font-mono"
                    placeholder="Content"
                  />
                </div>

                {/* Content Type */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Content Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['code', 'decision', 'feature', 'knowledge'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        className={cn(
                          "px-3 py-2 border rounded-md flex items-center gap-2",
                          selectedContentType === type
                            ? "bg-blue-50 border-blue-200"
                            : "border-gray-300 text-gray-700"
                        )}
                        onClick={() => setSelectedContentType(type)}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: type === 'code' ? '#6366F1' :
                              type === 'decision' ? '#F97316' :
                              type === 'feature' ? '#8B5CF6' :
                              '#10B981'
                          }}
                        />
                        <span>{
                          type === 'code' ? 'Code' :
                          type === 'decision' ? 'Decision' :
                          type === 'feature' ? 'Feature' :
                          'Knowledge'
                        }</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedTags.map(tag => (
                      <div
                        key={tag}
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center"
                      >
                        <span>{tag}</span>
                        <button
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Add a tag and press Enter"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          e.preventDefault();
                          if (!selectedTags.includes(tagInput.trim())) {
                            setSelectedTags([...selectedTags, tagInput.trim()]);
                          }
                          setTagInput('');
                        }
                      }}
                    />
                  </div>

                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Suggested tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {['react', 'typescript', 'frontend', 'ui', 'api', 'database', 'mobile'].filter(tag =>
                        !selectedTags.includes(tag)
                      ).map(tag => (
                        <button
                          key={tag}
                          type="button"
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                          onClick={() => setSelectedTags([...selectedTags, tag])}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-between">
              <button
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded"
                onClick={() => setIsPineconeUpsertOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 bg-blue-600 text-white rounded"
                onClick={handleSaveToPinecone}
                disabled={!upsertTitle.trim() || !upsertContent.trim()}
              >
                Save to Knowledge Base
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Entry Detail Modal */}
      {isEntryDetailOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor:
                      selectedEntry.metadata.type === 'code' ? '#6366F1' :
                      selectedEntry.metadata.type === 'decision' ? '#F97316' :
                      selectedEntry.metadata.type === 'feature' ? '#8B5CF6' :
                      '#10B981'
                  }}
                />
                <h2 className="text-lg font-medium truncate">{selectedEntry.metadata.title}</h2>
              </div>
              <button
                className="text-gray-500"
                onClick={() => setIsEntryDetailOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Content */}
                <div className="bg-gray-50 p-3 rounded-md font-mono text-sm whitespace-pre-wrap">
                  {selectedEntry.content}
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium capitalize">{selectedEntry.metadata.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium">{selectedEntry.metadata.created.toLocaleDateString()}</p>
                  </div>
                  {selectedEntry.metadata.lastAccessed && (
                    <div>
                      <p className="text-gray-500">Last accessed</p>
                      <p className="font-medium">{selectedEntry.metadata.lastAccessed.toLocaleDateString()}</p>
                    </div>
                  )}
                  {typeof selectedEntry.metadata.accessCount !== 'undefined' && (
                    <div>
                      <p className="text-gray-500">Views</p>
                      <p className="font-medium">{selectedEntry.metadata.accessCount}</p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <p className="text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedEntry.metadata.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {selectedEntry.metadata.tags.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No tags</p>
                    )}
                  </div>
                </div>

                {/* Source Messages */}
                <div>
                  <p className="text-gray-500 mb-2">Source Messages</p>
                  {selectedEntry.metadata.sourceMessageIds.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEntry.metadata.sourceMessageIds.map(messageId => {
                        // Find the message in the chats
                        const sourceMessage = chats.flatMap(chat => chat.messages).find(m => m.id === messageId);
                        return (
                          <div key={messageId} className="border border-gray-200 rounded-md p-2">
                            {sourceMessage ? (
                              <>
                                <p className="text-xs text-gray-500 mb-1">
                                  {sourceMessage.role === 'user' ? 'You' : 'AI'}, {' '}
                                  {sourceMessage.createdAt.toLocaleString()}
                                </p>
                                <p className="text-sm line-clamp-2">{sourceMessage.content}</p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-500 italic">Message not found</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No source messages</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-between">
              <button
                className="px-3 py-1.5 border border-red-200 text-red-500 rounded"
                onClick={() => {
                  setPineconeEntries(pineconeEntries.filter(e => e.id !== selectedEntry.id));
                  setIsEntryDetailOpen(false);
                }}
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded"
                  onClick={() => setIsEntryDetailOpen(false)}
                >
                  Close
                </button>
                <button
                  className="px-3 py-1.5 bg-blue-600 text-white rounded flex items-center gap-1"
                  onClick={() => {
                    // Set up the edit form
                    setUpsertTitle(selectedEntry.metadata.title);
                    setUpsertContent(selectedEntry.content);
                    setSelectedContentType(selectedEntry.metadata.type);
                    setSelectedTags([...selectedEntry.metadata.tags]);
                    setSelectedMessages([...selectedEntry.metadata.sourceMessageIds]);

                    // Close the detail modal and open the upsert modal
                    setIsEntryDetailOpen(false);
                    setIsPineconeUpsertOpen(true);
                  }}
                >
                  <Edit size={14} />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestMobileInputPage;










