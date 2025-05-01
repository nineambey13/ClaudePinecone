import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Define types for chat and message data
export interface ChatData {
  id: string;
  title: string;
  created_at: string;
}

export interface MessageData {
  id: string;
  chat_id: string;
  content: string;
  role: string;
  timestamp: string;
  is_edited: boolean;
}

/**
 * Initialize and return a Supabase client instance
 */
export function initSupabaseClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment variables');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Load all chats from Supabase
 */
export async function loadChats() {
  const supabase = initSupabaseClient();
  if (!supabase) return { data: null, error: 'Supabase client not initialized' };
  
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .order('created_at', { ascending: false });
    
  return { data, error };
}

/**
 * Load a single chat with its messages
 */
export async function loadChat(chatId: string) {
  const supabase = initSupabaseClient();
  if (!supabase) return { chat: null, messages: null, error: 'Supabase client not initialized' };
  
  // Load chat data
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .single();
    
  if (chatError) {
    return { chat: null, messages: null, error: chatError };
  }
  
  // Load chat messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('timestamp', { ascending: true });
    
  if (messagesError) {
    return { chat, messages: null, error: messagesError };
  }
  
  return { chat, messages, error: null };
}

/**
 * Subscribe to a chat's messages
 */
export function subscribeToChat(chatId: string, onMessage: (message: MessageData) => void) {
  const supabase = initSupabaseClient();
  if (!supabase) return null;
  
  const channel = supabase
    .channel(`chat:${chatId}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
      (payload) => {
        onMessage(payload.new as MessageData);
      }
    )
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
      (payload) => {
        onMessage(payload.new as MessageData);
      }
    )
    .subscribe();
    
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Create a new chat
 */
export async function createChat(title: string = 'New Chat') {
  const supabase = initSupabaseClient();
  if (!supabase) return { data: null, error: 'Supabase client not initialized' };
  
  const chatId = uuidv4();
  const { data, error } = await supabase
    .from('chats')
    .insert([{
      id: chatId,
      title,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
    
  return { data, error };
}

/**
 * Update a chat's title
 */
export async function updateChatTitle(chatId: string, title: string) {
  const supabase = initSupabaseClient();
  if (!supabase) return { data: null, error: 'Supabase client not initialized' };
  
  const { data, error } = await supabase
    .from('chats')
    .update({ title })
    .eq('id', chatId)
    .select()
    .single();
    
  return { data, error };
}

/**
 * Delete a chat
 */
export async function deleteChat(chatId: string) {
  const supabase = initSupabaseClient();
  if (!supabase) return { error: 'Supabase client not initialized' };
  
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId);
    
  return { error };
}

/**
 * Save a message to a chat
 */
export async function saveMessage(chatId: string, content: string, role: string) {
  const supabase = initSupabaseClient();
  if (!supabase) return { data: null, error: 'Supabase client not initialized' };
  
  const messageId = uuidv4();
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      id: messageId,
      chat_id: chatId,
      content,
      role,
      timestamp: new Date().toISOString(),
      is_edited: false
    }])
    .select()
    .single();
    
  return { data, error };
}

/**
 * Update a message
 */
export async function updateMessage(messageId: string, content: string) {
  const supabase = initSupabaseClient();
  if (!supabase) return { data: null, error: 'Supabase client not initialized' };
  
  const { data, error } = await supabase
    .from('messages')
    .update({ 
      content,
      is_edited: true
    })
    .eq('id', messageId)
    .select()
    .single();
    
  return { data, error };
}

/**
 * Migrate local chats to Supabase
 * @param chats Array of chat data to migrate
 * @param getMessages Function that returns messages for a given chat ID
 */
export async function migrateLocalChats(
  chats: { id: string; title: string; createdAt: Date }[],
  getMessages: (chatId: string) => { id: string; content: string; role: string; timestamp: Date }[]
) {
  const supabase = initSupabaseClient();
  if (!supabase) return { error: 'Supabase client not initialized' };
  
  const results = {
    chatsSuccess: 0,
    chatsError: 0,
    messagesSuccess: 0,
    messagesError: 0,
    errors: [] as string[]
  };
  
  // Process each chat and its messages
  for (const chat of chats) {
    // Insert chat
    const { error: chatError } = await supabase
      .from('chats')
      .insert([{
        id: chat.id,
        title: chat.title,
        created_at: chat.createdAt.toISOString()
      }]);
      
    if (chatError) {
      results.chatsError++;
      results.errors.push(`Failed to insert chat ${chat.id}: ${chatError.message}`);
      continue;
    }
    
    results.chatsSuccess++;
    
    // Get messages for this chat
    const messages = getMessages(chat.id);
    
    // Insert messages
    for (const message of messages) {
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          id: message.id,
          chat_id: chat.id,
          content: message.content,
          role: message.role,
          timestamp: message.timestamp.toISOString(),
          is_edited: false
        }]);
        
      if (messageError) {
        results.messagesError++;
        results.errors.push(`Failed to insert message ${message.id}: ${messageError.message}`);
      } else {
        results.messagesSuccess++;
      }
    }
  }
  
  return { results };
}

/**
 * Example of how to integrate Supabase sync into your chat context
 */
export function generateImplementationCode() {
  return `
// In your ChatContext.tsx file:

import { useEffect, useState } from 'react';
import { 
  initSupabaseClient, 
  loadChats, 
  loadChat, 
  subscribeToChat, 
  createChat,
  saveMessage,
  updateChatTitle,
  deleteChat
} from '../lib/supabase-sync';

// Inside your ChatProvider component:
const [syncing, setSyncing] = useState(false);
const [syncError, setSyncError] = useState<string | null>(null);

// Initialize Supabase and load chats
useEffect(() => {
  const initSupabase = async () => {
    setSyncing(true);
    setSyncError(null);
    
    const supabase = initSupabaseClient();
    if (!supabase) {
      setSyncError('Failed to initialize Supabase client');
      setSyncing(false);
      return;
    }
    
    // Load all chats
    const { data: chatsData, error: chatsError } = await loadChats();
    
    if (chatsError) {
      setSyncError(\`Failed to load chats: \${chatsError.message}\`);
      setSyncing(false);
      return;
    }
    
    if (chatsData) {
      // Transform Supabase chats to your app's format
      const loadedChats = chatsData.map(chat => ({
        id: chat.id,
        title: chat.title,
        messages: [] // Messages will be loaded separately
      }));
      
      setChats(loadedChats);
      
      // If there are chats, load the first one
      if (loadedChats.length > 0) {
        await loadChatMessages(loadedChats[0].id);
      }
    }
    
    setSyncing(false);
  };
  
  initSupabase();
}, []);

// Load a specific chat with its messages
const loadChatMessages = async (chatId) => {
  setSyncing(true);
  
  const { chat, messages, error } = await loadChat(chatId);
  
  if (error) {
    setSyncError(\`Failed to load chat: \${error.message}\`);
    setSyncing(false);
    return;
  }
  
  if (messages) {
    // Transform messages to your app's format
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: new Date(msg.timestamp)
    }));
    
    // Update the current chat with messages
    setCurrentChat({
      id: chat.id,
      title: chat.title,
      messages: formattedMessages
    });
    
    // Subscribe to real-time updates for this chat
    const unsubscribe = subscribeToChat(chatId, (newMessage) => {
      // When a new message arrives, add it to the chat
      setCurrentChat(prevChat => {
        // Check if message already exists (might have been added locally)
        const messageExists = prevChat.messages.some(m => m.id === newMessage.id);
        
        if (messageExists) {
          // Update existing message
          return {
            ...prevChat,
            messages: prevChat.messages.map(m => 
              m.id === newMessage.id 
                ? {
                    id: newMessage.id,
                    content: newMessage.content,
                    role: newMessage.role,
                    timestamp: new Date(newMessage.timestamp)
                  }
                : m
            )
          };
        } else {
          // Add new message
          return {
            ...prevChat,
            messages: [
              ...prevChat.messages,
              {
                id: newMessage.id,
                content: newMessage.content,
                role: newMessage.role,
                timestamp: new Date(newMessage.timestamp)
              }
            ]
          };
        }
      });
    });
    
    // Store unsubscribe function for cleanup
    setCurrentSubscription(() => unsubscribe);
  }
  
  setSyncing(false);
};

// Modify your sendMessage function
const sendMessage = async (content, role = 'user') => {
  // Create a temporary message ID
  const messageId = uuidv4();
  
  // Add message to local state first
  setCurrentChat(prev => ({
    ...prev,
    messages: [
      ...prev.messages,
      {
        id: messageId,
        content,
        role,
        timestamp: new Date()
      }
    ]
  }));
  
  // Save to Supabase
  const { data, error } = await saveMessage(
    currentChat.id,
    content,
    role
  );
  
  if (error) {
    setSyncError(\`Failed to save message: \${error.message}\`);
  }
};

// Modify your createNewChat function
const createNewChat = async (title = 'New Chat') => {
  const { data: newChat, error } = await createChat(title);
  
  if (error) {
    setSyncError(\`Failed to create chat: \${error.message}\`);
    return;
  }
  
  const formattedChat = {
    id: newChat.id,
    title: newChat.title,
    messages: []
  };
  
  setChats(prev => [formattedChat, ...prev]);
  setCurrentChat(formattedChat);
};

// Clean up subscription when component unmounts or chat changes
useEffect(() => {
  return () => {
    if (currentSubscription) {
      currentSubscription();
    }
  };
}, [currentChat?.id]);
  `;
} 