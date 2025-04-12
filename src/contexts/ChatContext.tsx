
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

type ChatContextType = {
  chats: Chat[];
  currentChatId: string | null;
  sidebarExpanded: boolean;
  createChat: () => string;
  updateChatTitle: (chatId: string, title: string) => void;
  sendMessage: (content: string) => void;
  setCurrentChat: (chatId: string) => void;
  toggleSidebar: () => void;
  deleteChat: (chatId: string) => void;
  userProfile: {
    initials: string;
    name: string;
    role: string;
  };
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'The Science of Slow-Cooking Beef',
      messages: [],
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Understanding Firebase vs Supabase',
      messages: [],
      createdAt: new Date(),
    },
    {
      id: '3',
      title: 'Aligning Text Field in FlutterFlow',
      messages: [],
      createdAt: new Date(),
    },
    {
      id: '4',
      title: 'Troubleshooting Electron app startup',
      messages: [],
      createdAt: new Date(),
    },
    {
      id: '5',
      title: 'Building a Custom Claude Chat UI',
      messages: [],
      createdAt: new Date(),
    },
  ]);
  
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const createChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    };
    
    setChats((prevChats) => [newChat, ...prevChats]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  };

  const updateChatTitle = (chatId: string, title: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, title } : chat
      )
    );
  };

  const deleteChat = (chatId: string) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    
    // If the deleted chat is the current one, clear the current chat
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

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

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => !prev);
  };

  const userProfile = {
    initials: 'CW',
    name: 'Clarity World',
    role: 'Creator',
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        sidebarExpanded,
        createChat,
        updateChatTitle,
        sendMessage,
        setCurrentChat: setCurrentChatId,
        toggleSidebar,
        deleteChat,
        userProfile,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
