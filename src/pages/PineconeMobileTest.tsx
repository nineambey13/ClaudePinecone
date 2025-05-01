import React, { useState, useRef, FormEvent, ChangeEvent, useEffect } from 'react';
import { Plus, ChevronDown, X, Camera, Paperclip, StopCircle, Database, ChevronRight, MessageCircle, ArrowLeft, Settings, LogOut, Send, FileUp, Search, Tag, Clock, BookOpen, Brain, Check, AlertCircle } from 'lucide-react';
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

// Other SVG components from TestMobileInputPage...
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

// Pinecone related interfaces
interface PineconeEntry {
  id: string;
  content: string;
  metadata: {
    type: 'code' | 'decision' | 'feature' | 'knowledge';
    tags: string[];
    created: Date;
    sourceMessageIds: string[];
    title: string;
  };
  embedding?: number[]; // This would be the vector representation
}

// Content types for Pinecone entries
type ContentType = 'code' | 'decision' | 'feature' | 'knowledge';

// Sample tag options for Pinecone entries
const tagOptions = [
  'javascript', 'react', 'typescript', 'frontend', 'backend',
  'api', 'database', 'ui', 'ux', 'performance', 'security',
  'accessibility', 'mobile', 'desktop', 'architecture'
];

// Message types
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
  isGenerating?: boolean;
  relatedKnowledge?: PineconeEntry[]; // Reference to related Pinecone entries
}

// Mock Pinecone data for demonstration
const mockPineconeData: PineconeEntry[] = [
  {
    id: '1',
    content: 'We decided to use React with TypeScript for the frontend to ensure type safety.',
    metadata: {
      type: 'decision',
      tags: ['react', 'typescript', 'frontend', 'architecture'],
      created: new Date('2023-07-15'),
      sourceMessageIds: ['msg123', 'msg124'],
      title: 'Frontend Tech Stack Decision'
    }
  },
  {
    id: '2',
    content: 'const fetchData = async () => {\n  try {\n    const response = await api.get(\'/data\');\n    return response.data;\n  } catch (error) {\n    console.error(\'Error fetching data:\', error);\n    return null;\n  }\n};',
    metadata: {
      type: 'code',
      tags: ['javascript', 'api', 'async'],
      created: new Date('2023-07-20'),
      sourceMessageIds: ['msg789'],
      title: 'API Data Fetching Function'
    }
  },
  {
    id: '3',
    content: 'The mobile sidebar should appear from the left edge and overlay the content with a semi-transparent backdrop.',
    metadata: {
      type: 'feature',
      tags: ['ui', 'mobile', 'sidebar'],
      created: new Date('2023-08-05'),
      sourceMessageIds: ['msg456', 'msg457'],
      title: 'Mobile Sidebar Design'
    }
  }
];

// Add new CSS in the component
const mobileDropdownStyles = `
  .dropdown-content {
    position: fixed;
    z-index: 999;
  }
  
  .touch-manipulation {
    touch-action: manipulation;
  }
  
  .knowledge-panel {
    background-color: #F8F9FC;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .knowledge-tag {
    background-color: #EDF2F7;
    color: #4A5568;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    margin-right: 4px;
  }
  
  .related-knowledge-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background-color: #3182CE;
    color: white;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .truncate-2-lines {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

// Empty chats array - will be populated with user-created chats
const userChats: { id: string; title: string; messages: Message[]; createdAt: Date }[] = [];

// Main component 
const PineconeMobileTest: React.FC = () => {
  // UI state
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  // Chat state
  const [chats, setChats] = useState(userChats);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('Claude 3.7 Sonnet');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // File upload state
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  
  // Pinecone specific state
  const [isPineconeUpsertOpen, setIsPineconeUpsertOpen] = useState(false);
  const [pineconeEntries, setPineconeEntries] = useState<PineconeEntry[]>(mockPineconeData);
  const [selectedContentType, setSelectedContentType] = useState<ContentType>('knowledge');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [upsertTitle, setUpsertTitle] = useState('');
  const [upsertContent, setUpsertContent] = useState('');
  const [showRelatedKnowledge, setShowRelatedKnowledge] = useState<{ [messageId: string]: boolean }>({});
  const [isRelatedKnowledgeLoading, setIsRelatedKnowledgeLoading] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  
  // Refs
  const generationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get current chat
  const currentChat = currentChatId ? chats.find(chat => chat.id === currentChatId) : null;
  
  // Computed property to check if we have any messages
  const hasMessages = Boolean(currentChat?.messages?.length);
  
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

  const userProfile = {
    initials: 'CW',
    name: 'ClarityAI',
    role: 'Creator'
  };

  const models = [
    {
      name: 'Claude 3.7 Sonnet',
      description: 'Our most intelligent model yet'
    },
    {
      name: 'Claude 3.5 Haiku',
      description: 'Fastest model for daily tasks'
    },
    {
      name: 'Claude 3.5 Sonnet',
      description: ''
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
    setCurrentChatId(null);
    setInputValue('');
    toggleSidebar();
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    toggleSidebar();
  };
  
  // Pinecone specific methods
  const handlePineconeUpsert = () => {
    setIsPineconeUpsertOpen(true);
    
    // If any message is selected, use its content as the default content
    if (currentChat && selectedMessages.length > 0) {
      const selectedMessageContents = selectedMessages.map(msgId => {
        const message = currentChat.messages.find(msg => msg.id === msgId);
        return message ? message.content : '';
      }).join('\n\n');
      
      setUpsertContent(selectedMessageContents);
      
      // Generate a default title from the first selected message
      if (selectedMessages.length > 0) {
        const firstMessage = currentChat.messages.find(msg => msg.id === selectedMessages[0]);
        if (firstMessage) {
          const firstLine = firstMessage.content.split('\n')[0];
          setUpsertTitle(firstLine.slice(0, 30) + (firstLine.length > 30 ? '...' : ''));
        }
      }
    }
  };
  
  const handleSaveToPinecone = () => {
    // Create a new Pinecone entry
    const newEntry: PineconeEntry = {
      id: Date.now().toString(),
      content: upsertContent,
      metadata: {
        type: selectedContentType,
        tags: selectedTags,
        created: new Date(),
        sourceMessageIds: selectedMessages,
        title: upsertTitle || `New entry ${Date.now()}`
      }
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
        content: `✅ Successfully saved to Pinecone as "${newEntry.metadata.title}" with tags: ${newEntry.metadata.tags.join(', ')}`,
        role: 'assistant',
        createdAt: new Date()
      };
      
      updateChat(currentChat.id, [...currentChat.messages, confirmationMessage]);
    }
  };
  
  const toggleMessageSelection = (messageId: string) => {
    if (selectedMessages.includes(messageId)) {
      setSelectedMessages(selectedMessages.filter(id => id !== messageId));
    } else {
      setSelectedMessages([...selectedMessages, messageId]);
    }
  };
  
  const toggleRelatedKnowledge = (messageId: string) => {
    setShowRelatedKnowledge(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
    
    // Simulate loading related knowledge
    setIsRelatedKnowledgeLoading(true);
    setTimeout(() => {
      setIsRelatedKnowledgeLoading(false);
    }, 1000);
  };
  
  const findRelatedKnowledge = (message: Message): PineconeEntry[] => {
    // In a real app, this would perform a vector similarity search
    // For now, we'll just do a basic keyword match
    const keywords = message.content.toLowerCase().split(/\s+/);
    return pineconeEntries.filter(entry => {
      const entryContent = entry.content.toLowerCase();
      return keywords.some(word => 
        word.length > 3 && entryContent.includes(word)
      );
    }).slice(0, 3); // Limit to top 3 matches
  };
  
  const updateChat = (chatId: string, messages: Message[]) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages } 
          : chat
      )
    );
  };
  
  // Send a message
  const sendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      createdAt: new Date()
    };
    
    let updatedChats = [...chats];
    let chatToUpdate;
    
    // If no current chat, create a new one
    if (!currentChatId) {
      const newChat = {
        id: Date.now().toString(),
        title: inputValue.slice(0, 30) + (inputValue.length > 30 ? '...' : ''),
        messages: [userMessage],
        createdAt: new Date()
      };
      
      updatedChats = [newChat, ...updatedChats];
      setCurrentChatId(newChat.id);
      chatToUpdate = newChat;
    } else {
      // Update existing chat
      chatToUpdate = updatedChats.find(chat => chat.id === currentChatId);
      if (chatToUpdate) {
        chatToUpdate.messages = [...chatToUpdate.messages, userMessage];
      }
    }
    
    setChats(updatedChats);
    setInputValue('');
    
    // Generate AI response
    generateResponse(chatToUpdate);
  };
  
  // Generate AI response with related knowledge
  const generateResponse = (chat: typeof currentChat) => {
    if (!chat) return;
    
    // Find related knowledge for the latest user message
    const latestUserMessage = chat.messages[chat.messages.length - 1];
    const relatedKnowledge = findRelatedKnowledge(latestUserMessage);
    
    // Add a placeholder message for the generating response
    const assistantMessage: Message = {
      id: Date.now().toString(),
      content: '',
      role: 'assistant',
      createdAt: new Date(),
      isGenerating: true,
      relatedKnowledge: relatedKnowledge.length > 0 ? relatedKnowledge : undefined
    };
    
    // Update the chat with the placeholder
    setChats(prevChats => {
      return prevChats.map(c => {
        if (c.id === chat.id) {
          return {
            ...c,
            messages: [...c.messages, assistantMessage]
          };
        }
        return c;
      });
    });
    
    setIsGenerating(true);
    
    // Mock AI response generation
    const mockResponse = "This is a mock AI response. In a real application, this would be an API call to Claude or another LLM. The response would be streamed word by word to simulate real-time generation.";
    let generatedText = '';
    let wordIndex = 0;
    const words = mockResponse.split(' ');
    
    // Clear any existing interval
    if (generationIntervalRef.current) {
      clearInterval(generationIntervalRef.current);
    }
    
    // Store the interval ID in the ref so we can access it from stopGeneration
    generationIntervalRef.current = setInterval(() => {
      if (wordIndex < words.length) {
        generatedText += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
        wordIndex++;
        
        // Update the message content
        setChats(prevChats => {
          return prevChats.map(c => {
            if (c.id === chat.id) {
              return {
                ...c,
                messages: c.messages.map(m => {
                  if (m.id === assistantMessage.id) {
                    return {
                      ...m,
                      content: generatedText,
                      isGenerating: true
                    };
                  }
                  return m;
                })
              };
            }
            return c;
          });
        });
      } else {
        // Finished generating
        if (generationIntervalRef.current) {
          clearInterval(generationIntervalRef.current);
          generationIntervalRef.current = null;
        }
        setIsGenerating(false);
        
        // Update the message to mark it as complete
        setChats(prevChats => {
          return prevChats.map(c => {
            if (c.id === chat.id) {
              return {
                ...c,
                messages: c.messages.map(m => {
                  if (m.id === assistantMessage.id) {
                    return {
                      ...m,
                      isGenerating: false
                    };
                  }
                  return m;
                })
              };
            }
            return c;
          });
        });
      }
    }, 100); // Generate word by word with a 100ms delay
  };
  
  // Stop message generation
  const stopGeneration = () => {
    // Clear the interval
    if (generationIntervalRef.current) {
      clearInterval(generationIntervalRef.current);
      generationIntervalRef.current = null;
    }
    
    setIsGenerating(false);
    
    // Mark the currently generating message as complete
    if (currentChatId) {
      setChats(prevChats => {
        return prevChats.map(c => {
          if (c.id === currentChatId) {
            return {
              ...c,
              messages: c.messages.map(m => {
                if (m.isGenerating) {
                  return {
                    ...m,
                    isGenerating: false,
                    content: m.content + " [Generation stopped]"
                  };
                }
                return m;
              })
            };
          }
          return c;
        });
      });
    }
  };
  
  // Add greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

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
  
  // Pinecone upsert handling
  const handlePineconeClick = () => {
    handlePineconeUpsert();
    setIsUploadMenuOpen(false);
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
      setCurrentChatId(newChat.id);
      chatToUpdate = newChat;
    } else {
      // Update existing chat
      chatToUpdate = updatedChats.find(chat => chat.id === currentChatId);
      if (chatToUpdate) {
        chatToUpdate.messages = [...chatToUpdate.messages, userMessage];
      }
    }
    
    setChats(updatedChats);
    
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
  
  // Helper functions for content types
  const getContentTypeColor = (type: ContentType): string => {
    switch (type) {
      case 'code':
        return '#3B82F6'; // blue
      case 'decision':
        return '#8B5CF6'; // purple
      case 'feature':
        return '#10B981'; // green
      case 'knowledge':
        return '#F59E0B'; // amber
      default:
        return '#6B7280'; // gray
    }
  };

  const getContentTypeLabel = (type: ContentType): string => {
    switch (type) {
      case 'code':
        return 'Code';
      case 'decision':
        return 'Decision';
      case 'feature':
        return 'Feature';
      case 'knowledge':
        return 'Knowledge';
      default:
        return 'Unknown';
    }
  };

  return (
    <div 
      className="h-screen w-screen relative overflow-hidden"
      style={{ backgroundColor: '#F9F3E5' }}
    >
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
            <div className="flex items-center justify-center w-7 h-7 cursor-pointer" onClick={toggleSidebar}>
              <ArrowLeft size={18} />
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
            <button className="flex items-center w-full h-[40px] px-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <MessageCircle size={16} className="text-gray-700" />
              </div>
              <span className="ml-2 text-gray-700 text-[13px] tracking-tight">
                Chats
              </span>
            </button>
            
            {/* Pinecone Knowledge Link */}
            <button className="flex items-center w-full h-[40px] px-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <Database size={16} className="text-gray-700" />
              </div>
              <span className="ml-2 text-gray-700 text-[13px] tracking-tight">
                Knowledge Base
              </span>
            </button>
          </div>

          {/* Recents Section */}
          <div className="px-2 mt-5">
            <p className="text-xs text-gray-500 px-2 py-1 mb-0.5">Recents</p>
          </div>

          {/* Chat List - Only showing user created chats with messages */}
          <div className="flex-1 overflow-y-auto px-2">
            {chats.length > 0 ? (
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
                  <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </button>
                  <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <LogOut size={16} className="mr-2" />
                    Log out
                  </button>
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
        <div
          id="sidebar-toggle"
          className="fixed top-0 left-0 z-50 m-3 w-7 h-7 flex items-center justify-center cursor-pointer"
          onClick={toggleSidebar}
        >
          <div className="relative w-[23px] h-[23px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gray-300/50 rounded-md"></div>
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out", 
              showRightArrow ? "opacity-100" : "opacity-0"
            )}>
              <RightArrowIcon />
            </div>
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out", 
              showRightArrow ? "opacity-0" : "opacity-100"
            )}>
              <SquareIcon />
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages Container */}
      {hasMessages && (
        <div className="h-screen w-full overflow-y-auto pb-[180px] pt-14">
          <div className="max-w-3xl mx-auto px-4">
            {currentChat?.messages.map((message) => (
              <div key={message.id} className="mb-6">
                {message.role === 'user' ? (
                  <div className="flex flex-col">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-1">
                        <span className="text-sm text-gray-700">{userProfile.initials}</span>
                      </div>
                      <div className="ml-3 bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-gray-800">{message.content}</p>
                      </div>
                      
                      {/* Message Selection Checkbox for Pinecone Upsert */}
                      <div className="ml-2 mt-1">
                        <div 
                          className={cn(
                            "w-5 h-5 border rounded flex items-center justify-center cursor-pointer",
                            selectedMessages.includes(message.id) 
                              ? "bg-blue-500 border-blue-500 text-white" 
                              : "border-gray-300 bg-white"
                          )}
                          onClick={() => toggleMessageSelection(message.id)}
                        >
                          {selectedMessages.includes(message.id) && <Check size={12} />}
                        </div>
                      </div>
                    </div>
                    
                    {/* Message Actions */}
                    <div className="flex ml-11 mt-1 text-xs text-gray-500">
                      <button 
                        className="hover:text-gray-700"
                        onClick={() => handlePineconeUpsert()}
                      >
                        Save to Knowledge Base
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full shrink-0 mt-1 flex">
                        <img 
                          src="https://www.anthropic.com/images/icons/claude.svg" 
                          alt="Claude" 
                          className="w-7 h-7"
                        />
                      </div>
                      <div className="ml-3 relative group">
                        <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                        {message.isGenerating && (
                          <span className="inline-block w-1.5 h-4 ml-0.5 bg-black animate-blink"></span>
                        )}
                        
                        {/* Show related knowledge badge if available */}
                        {message.relatedKnowledge && message.relatedKnowledge.length > 0 && (
                          <div className="absolute right-0 top-0">
                            <button 
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1"
                              onClick={() => toggleRelatedKnowledge(message.id)}
                            >
                              <Database size={12} />
                              {message.relatedKnowledge.length} related
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Message Selection Checkbox for Pinecone Upsert */}
                      <div className="ml-2 mt-1">
                        <div 
                          className={cn(
                            "w-5 h-5 border rounded flex items-center justify-center cursor-pointer",
                            selectedMessages.includes(message.id) 
                              ? "bg-blue-500 border-blue-500 text-white" 
                              : "border-gray-300 bg-white"
                          )}
                          onClick={() => toggleMessageSelection(message.id)}
                        >
                          {selectedMessages.includes(message.id) && <Check size={12} />}
                        </div>
                      </div>
                    </div>
                    
                    {/* Related Knowledge Panel */}
                    {showRelatedKnowledge[message.id] && message.relatedKnowledge && (
                      <div className="ml-11 mt-2 knowledge-panel p-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Brain size={14} className="mr-1" /> Related Knowledge
                        </h4>
                        
                        {isRelatedKnowledgeLoading ? (
                          <div className="py-2 text-center text-gray-500 text-sm">
                            Loading related knowledge...
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {message.relatedKnowledge.map(entry => (
                              <div key={entry.id} className="border-l-2 pl-2 py-1" style={{ borderColor: getContentTypeColor(entry.metadata.type) }}>
                                <div className="flex items-center mb-1">
                                  <span 
                                    className="text-xs font-medium mr-1"
                                    style={{ color: getContentTypeColor(entry.metadata.type) }}
                                  >
                                    {getContentTypeLabel(entry.metadata.type)}
                                  </span>
                                  <h5 className="text-xs font-medium text-gray-700">{entry.metadata.title}</h5>
                                </div>
                                <p className="text-xs text-gray-600 truncate-2-lines">{entry.content}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {entry.metadata.tags.map(tag => (
                                    <span key={tag} className="knowledge-tag">{tag}</span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Message Actions */}
                    <div className="flex ml-11 mt-1 text-xs text-gray-500">
                      <button 
                        className="hover:text-gray-700"
                        onClick={() => handlePineconeUpsert()}
                      >
                        Save to Knowledge Base
                      </button>
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
              paddingRight: '140px' // Space for model selector and send button
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
                side="bottom"
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
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer touch-manipulation"
                  onClick={handlePineconeClick}
                >
                  <Database size={16} className="text-gray-500" />
                  <span className="text-sm">Save to Knowledge Base</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bottom right controls */}
          <div className="absolute right-3.5 bottom-3 flex items-center gap-3">
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
                <span>{selectedModel}</span>
                <ChevronDown size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="bottom"
                className="z-[999] dropdown-content"
                sideOffset={5}
              >
                {models.map((model) => (
                  <DropdownMenuItem 
                    key={model.name}
                    onClick={() => setSelectedModel(model.name)}
                    className="flex flex-col items-start cursor-pointer touch-manipulation"
                  >
                    <span>{model.name}</span>
                    {model.description && (
                      <span className="text-xs text-gray-500">{model.description}</span>
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
      
      {/* Pinecone Upsert Form - only shown when upsert is open */}
      {isPineconeUpsertOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Save to Knowledge Base</h3>
              <button 
                onClick={() => setIsPineconeUpsertOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={upsertTitle}
                  onChange={(e) => setUpsertTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Give your entry a descriptive title"
                />
              </div>
              
              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-2 border rounded-md flex items-center gap-2",
                      selectedContentType === 'code' 
                        ? "bg-blue-50 border-blue-300 text-blue-700" 
                        : "border-gray-300 text-gray-700"
                    )}
                    onClick={() => setSelectedContentType('code')}
                  >
                    <div className="w-4 h-4 bg-blue-400 rounded-full" />
                    <span>Code Snippet</span>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-2 border rounded-md flex items-center gap-2",
                      selectedContentType === 'decision' 
                        ? "bg-purple-50 border-purple-300 text-purple-700" 
                        : "border-gray-300 text-gray-700"
                    )}
                    onClick={() => setSelectedContentType('decision')}
                  >
                    <div className="w-4 h-4 bg-purple-400 rounded-full" />
                    <span>Decision</span>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-2 border rounded-md flex items-center gap-2",
                      selectedContentType === 'feature' 
                        ? "bg-green-50 border-green-300 text-green-700" 
                        : "border-gray-300 text-gray-700"
                    )}
                    onClick={() => setSelectedContentType('feature')}
                  >
                    <div className="w-4 h-4 bg-green-400 rounded-full" />
                    <span>Feature</span>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-2 border rounded-md flex items-center gap-2",
                      selectedContentType === 'knowledge' 
                        ? "bg-amber-50 border-amber-300 text-amber-700" 
                        : "border-gray-300 text-gray-700"
                    )}
                    onClick={() => setSelectedContentType('knowledge')}
                  >
                    <div className="w-4 h-4 bg-amber-400 rounded-full" />
                    <span>Knowledge</span>
                  </button>
                </div>
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map(tag => (
                    <div 
                      key={tag} 
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      <span>{tag}</span>
                      <button 
                        className="ml-1 text-gray-500 hover:text-gray-700"
                        onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 p-2 border border-gray-300 rounded-md max-h-[100px] overflow-y-auto">
                  {tagOptions.filter(tag => !selectedTags.includes(tag)).map(tag => (
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
              
              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={upsertContent}
                  onChange={(e) => setUpsertContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-32 resize-none"
                  placeholder="The content to save to your knowledge base"
                />
              </div>
              
              {/* Selected Messages */}
              {selectedMessages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selected Messages
                  </label>
                  <div className="border border-gray-300 rounded-md p-2 text-sm text-gray-500">
                    {selectedMessages.length} message{selectedMessages.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsPineconeUpsertOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  onClick={handleSaveToPinecone}
                  disabled={!upsertContent || !upsertTitle}
                >
                  <Database size={16} />
                  Save to Knowledge Base
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PineconeMobileTest; 