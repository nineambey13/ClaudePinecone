import { createClient } from '@supabase/supabase-js';
import { Chat, Message } from '@/contexts/ChatContext';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';

// Use environment variables for Supabase credentials from config
const SUPABASE_URL = config.supabase.url;
const SUPABASE_ANON_KEY = config.supabase.anonKey;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Log Supabase configuration for debugging
console.log('Supabase Configuration:', { 
  url: SUPABASE_URL ? 'Set (not showing full URL for security)' : 'Not set',
  anonKey: SUPABASE_ANON_KEY ? 'Set (not showing key for security)' : 'Not set'
});

// Helper function to convert string IDs to valid UUIDs or generate new ones
function ensureUUID(id: string): string {
  // Check if the id is already a valid UUID
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (UUID_REGEX.test(id)) {
    return id;
  }
  
  // If not, generate a new UUID
  try {
    // For specific ID formats like timestamps, we could implement a deterministic conversion
    // But for now, we'll generate a new UUID
    return uuidv4();
  } catch (e) {
    console.warn('Failed to convert ID to UUID, generating new one', id);
    return uuidv4();
  }
}

export interface SupabaseMessage {
  id: string;
  chat_id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  is_edited?: boolean;
}

export interface SupabaseChat {
  id: string;
  title: string;
  created_at: string;
}

export const chatService = {
  // Send a new message
  async sendMessage(message: Message, chatId: string): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      console.log(`Attempting to send message to Supabase. Chat ID: ${chatId}, Message ID: ${message.id}`);
      
      // Convert IDs to valid UUIDs
      const uuidChatId = ensureUUID(chatId);
      const uuidMessageId = ensureUUID(message.id);
      
      console.log(`Using UUID formats - Chat ID: ${uuidChatId}, Message ID: ${uuidMessageId}`);
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          id: uuidMessageId,
          chat_id: uuidChatId,
          content: message.content,
          role: message.role,
          timestamp: message.timestamp.toISOString(),
          is_edited: message.edited || false
        });
        
      if (error) {
        console.error('Supabase error when sending message:', error);
        throw error;
      }
      
      console.log('Message successfully sent to Supabase:', uuidMessageId);
      return { success: true, data };
    } catch (error) {
      console.error('Error sending message to Supabase:', error);
      return { success: false, error };
    }
  },
  
  // Create a new chat
  async createChat(chat: Chat): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      console.log(`Attempting to create chat in Supabase. Chat ID: ${chat.id}`);
      
      // Convert ID to valid UUID
      const uuidChatId = ensureUUID(chat.id);
      
      console.log(`Using UUID format - Chat ID: ${uuidChatId}`);
      
      const { data, error } = await supabase
        .from('chats')
        .insert({
          id: uuidChatId,
          title: chat.title,
          created_at: chat.createdAt.toISOString()
        });
        
      if (error) {
        console.error('Supabase error when creating chat:', error);
        throw error;
      }
      
      console.log('Chat successfully created in Supabase:', uuidChatId);
      return { success: true, data };
    } catch (error) {
      console.error('Error creating chat in Supabase:', error);
      return { success: false, error };
    }
  },
  
  // Update chat title
  async updateChatTitle(chatId: string, title: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log(`Attempting to update chat title in Supabase. Chat ID: ${chatId}`);
      
      // Convert ID to valid UUID
      const uuidChatId = ensureUUID(chatId);
      
      const { error } = await supabase
        .from('chats')
        .update({ title })
        .eq('id', uuidChatId);
        
      if (error) {
        console.error('Supabase error when updating chat title:', error);
        throw error;
      }
      
      console.log('Chat title successfully updated in Supabase:', uuidChatId);
      return { success: true };
    } catch (error) {
      console.error('Error updating chat title in Supabase:', error);
      return { success: false, error };
    }
  },
  
  // Delete a chat and its messages
  async deleteChat(chatId: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log(`Attempting to delete chat and messages from Supabase. Chat ID: ${chatId}`);
      
      // Convert ID to valid UUID
      const uuidChatId = ensureUUID(chatId);
      
      // First delete all messages associated with this chat
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', uuidChatId);
      
      if (messagesError) {
        console.error('Supabase error when deleting messages:', messagesError);
        throw messagesError;
      }
      
      // Then delete the chat itself
      const { error: chatError } = await supabase
        .from('chats')
        .delete()
        .eq('id', uuidChatId);
        
      if (chatError) {
        console.error('Supabase error when deleting chat:', chatError);
        throw chatError;
      }
      
      console.log('Chat and messages successfully deleted from Supabase:', uuidChatId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting chat from Supabase:', error);
      return { success: false, error };
    }
  },
  
  // Get all chats
  async getAllChats(): Promise<Chat[]> {
    try {
      console.log('Attempting to fetch all chats from Supabase');
      
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (chatError) {
        console.error('Supabase error when fetching chats:', chatError);
        throw chatError;
      }
      
      console.log(`Successfully fetched ${chatData?.length || 0} chats from Supabase`);
      
      // Fetch messages for each chat
      const chats: Chat[] = [];
      
      for (const chat of chatData || []) {
        console.log(`Fetching messages for chat: ${chat.id}`);
        
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('timestamp');
          
        if (messageError) {
          console.error('Supabase error when fetching messages:', messageError);
          throw messageError;
        }
        
        console.log(`Successfully fetched ${messageData?.length || 0} messages for chat: ${chat.id}`);
        
        const messages: Message[] = (messageData || []).map((msg: SupabaseMessage) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          edited: msg.is_edited
        }));
        
        chats.push({
          id: chat.id,
          title: chat.title,
          messages,
          createdAt: new Date(chat.created_at)
        });
      }
      
      return chats;
    } catch (error) {
      console.error('Error getting chats from Supabase:', error);
      return [];
    }
  },
  
  // Subscribe to real-time updates for chats and messages
  subscribeToChanges(callback: (chats: Chat[]) => void) {
    console.log('Setting up real-time subscriptions for Supabase changes');
    
    // Set up real-time subscription for chats
    const chatSubscription = supabase
      .channel('public:chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, (payload) => {
        console.log('Real-time chat update received from Supabase:', payload);
        // When any change happens to chats, fetch all chats and messages again
        this.getAllChats().then(chats => {
          callback(chats);
        });
      })
      .subscribe((status) => {
        console.log('Chat subscription status:', status);
      });
      
    // Set up real-time subscription for messages
    const messageSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        console.log('Real-time message update received from Supabase:', payload);
        // When any change happens to messages, fetch all chats and messages again
        this.getAllChats().then(chats => {
          callback(chats);
        });
      })
      .subscribe((status) => {
        console.log('Message subscription status:', status);
      });
      
    console.log('Supabase real-time subscriptions set up successfully');
    
    // Return function to unsubscribe from both channels
    return () => {
      console.log('Unsubscribing from Supabase real-time channels');
      supabase.removeChannel(chatSubscription);
      supabase.removeChannel(messageSubscription);
    };
  }
}; 