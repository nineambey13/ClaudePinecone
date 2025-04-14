import { createContext, useContext, useState, ReactNode } from 'react';

type UserProfile = {
  name: string;
  email: string;
  avatarUrl?: string;
  initials?: string;
  role?: string;
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
  updateChatTitle?: (chatId: string, title: string) => void;
  deleteChat?: (chatId: string) => void;
};

const dummyUserProfile: UserProfile = {
  name: 'Clarity',
  email: 'clarity@example.com',
  initials: 'C',
  role: 'Free Plan',
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
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: `assistant-${Date.now() + 100}`,
      role: 'assistant',
      content: 'This is a placeholder response from Claude. In a real application, this would be the AI\'s response.',
      timestamp: new Date(),
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, userMessage, assistantMessage],
          };

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

  const updateChatTitle = (chatId: string, title: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          return { ...chat, title };
        }
        return chat;
      })
    );
  };

  const deleteChat = (chatId: string) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId('');
    }
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
    updateChatTitle,
    deleteChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
