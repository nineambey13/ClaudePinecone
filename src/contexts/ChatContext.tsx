
import { createContext, useContext, useState, ReactNode } from 'react';

type UserProfile = {
  name: string;
  email: string;
  avatarUrl?: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

type ChatContextType = {
  chats: Chat[];
  currentChatId: string;
  userProfile: UserProfile;
  sidebarExpanded: boolean;
  createChat: () => string;
  setCurrentChat: (chatId: string) => void;
  sendMessage: (content: string) => void;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
};

const dummyUserProfile: UserProfile = {
  name: 'Clarity',
  email: 'clarity@example.com',
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState('');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setSidebarExpanded(prev => !prev);
  };

  const setCurrentChat = (chatId: string) => {
    setCurrentChatId(chatId);
    
    // If we're selecting a chat, make sure sidebar is expanded
    if (chatId) {
      setSidebarExpanded(true);
    }
  };

  const createChat = (): string => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setChats(prevChats => [newChat, ...prevChats]);
    setCurrentChatId(newChatId);
    
    return newChatId;
  };

  const sendMessage = (content: string) => {
    // If there's no current chat, create one
    if (!currentChatId) {
      const newChatId = createChat();
      setTimeout(() => {
        addMessagesToChat(newChatId, content);
      }, 10);
    } else {
      addMessagesToChat(currentChatId, content);
    }
  };

  const addMessagesToChat = (chatId: string, content: string) => {
    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Placeholder for assistant response
    const assistantMessage: Message = {
      id: `assistant-${Date.now() + 100}`,
      role: 'assistant',
      content: 'This is a placeholder response from Claude. In a real application, this would be the AI\'s response.',
      timestamp: new Date(),
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          // Update chat title based on first message
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, userMessage, assistantMessage],
          };
          
          // If this is the first message, update the title
          if (chat.messages.length === 0) {
            updatedChat.title = content.length > 30 
              ? `${content.substring(0, 30)}...` 
              : content;
          }
          
          return updatedChat;
        }
        return chat;
      })
    );
  };

  const value: ChatContextType = {
    chats,
    currentChatId,
    userProfile: dummyUserProfile,
    sidebarExpanded,
    createChat,
    setCurrentChat,
    sendMessage,
    toggleSidebar,
    setSidebarExpanded,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
