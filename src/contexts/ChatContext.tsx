import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ClaudeProxyApi } from '../lib/api/claudeProxy';
import { config } from '../lib/config';
import { QueuedMessage } from '@/components/ui/DownloadQueue';
import { jsPDF } from 'jspdf';
import { chatService } from '@/lib/services/chatService';
import { v4 as uuidv4 } from 'uuid';
import { searchKnowledgeBase } from '@/lib/enhancedKnowledgeStorage';
import { isPineconeConfigured } from '@/lib/pineconeUtils';
import { isEmbeddingConfigured } from '@/lib/claudeApi';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  edited?: boolean;
  isLoading?: boolean;
  relatedKnowledge?: any[]; // Store related Pinecone entries
  usedStoredKnowledge?: boolean; // Flag to indicate if Claude used knowledge from Pinecone
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

interface PrePrompt {
  id: string;
  name: string;
  content: string;
}

type ChatContextType = {
  chats: Chat[];
  currentChatId: string | null;
  sidebarExpanded: boolean;
  showRightArrow: boolean;
  isLoading: boolean;
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
  updateMessage: (messageId: string, newContent: string) => void;
  stopGeneration: () => void;
  deleteMessage: (messageId: string) => void;
  regenerateMessage: (messageId: string) => void;
  prePrompts: PrePrompt[];
  addPrePrompt: (prompt: Omit<PrePrompt, 'id'>) => void;
  deletePrePrompt: (id: string) => void;
  updatePrePrompt: (id: string, prompt: Omit<PrePrompt, 'id'>) => void;
  prePromptsEnabled: boolean;
  togglePrePrompts: () => void;
  downloadQueue: QueuedMessage[];
  addToDownloadQueue: (messageId: string) => void;
  removeFromDownloadQueue: (messageId: string) => void;
  clearDownloadQueue: () => void;
  downloadMessage: (messageId: string) => void;
  downloadAllAsPdf: () => void;
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
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [prePrompts, setPrePrompts] = useState<PrePrompt[]>(() => {
    const saved = localStorage.getItem('prePrompts');
    return saved ? JSON.parse(saved) : [];
  });
  const [downloadQueue, setDownloadQueue] = useState<QueuedMessage[]>(() => {
    const saved = localStorage.getItem('downloadQueue');
    return saved ? JSON.parse(saved) : [];
  });
  const [prePromptsEnabled, setPrePromptsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('prePromptsEnabled');
    return saved ? JSON.parse(saved) : true;
  });

  // Initialize Claude API with proxy
  const claudeApi = new ClaudeProxyApi(config.claude.model);

  // Fetch chats from Supabase on initial load
  useEffect(() => {
    const fetchChats = async () => {
      const fetchedChats = await chatService.getAllChats();
      setChats(fetchedChats);
    };
    fetchChats();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = chatService.subscribeToChanges((updatedChats) => {
      setChats(updatedChats);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const createChat = () => {
    // Delete any existing empty chats
    setChats((prevChats) => prevChats.filter((chat) => chat.messages.length > 0));

    // Generate a proper UUID for the new chat
    const chatId = uuidv4();

    const newChat: Chat = {
      id: chatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    };

    // Save to Supabase
    chatService.createChat(newChat);

    setChats((prevChats) => [newChat, ...prevChats]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  };

  const updateChatTitle = (chatId: string, title: string) => {
    // Update in Supabase
    chatService.updateChatTitle(chatId, title);

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, title } : chat
      )
    );
  };

  const deleteChat = (chatId: string) => {
    // Delete from Supabase
    chatService.deleteChat(chatId);

    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

    // If the deleted chat is the current one, clear the current chat
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const stopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);

      // Update the loading state of the last assistant message
      if (currentChatId) {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id === currentChatId) {
              const updatedMessages = [...chat.messages];

              // Find the last loading assistant message
              const lastLoadingIndex = updatedMessages
                .map((msg, i) => ({ msg, i }))
                .filter(({ msg }) => msg.role === 'assistant' && msg.isLoading)
                .pop()?.i;

              if (lastLoadingIndex !== undefined) {
                updatedMessages[lastLoadingIndex] = {
                  ...updatedMessages[lastLoadingIndex],
                  isLoading: false
                };
              }

              return {
                ...chat,
                messages: updatedMessages
              };
            }
            return chat;
          })
        );
      }
    }
  }, [abortController, currentChatId]);

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    // If there's no current chat, create one first
    if (!currentChatId) {
      const newChatId = createChat();
      addMessagesToChat(newChatId, content);
      return newChatId;
    }

    // Otherwise send to current chat
    addMessagesToChat(currentChatId, content);
    return currentChatId;
  };

  const addMessagesToChat = async (chatId: string, content: string) => {
    // Cancel any ongoing generation
    if (abortController) {
      abortController.abort();
    }

    // Create a new abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);

    // Generate a proper UUID for the user message
    const userMessage: Message = {
      id: `user-${uuidv4()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Create the messages array first
    const currentChat = chats.find(chat => chat.id === chatId);
    const messages = currentChat ? [...currentChat.messages, userMessage] : [userMessage];

    // Add user message to state
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages,
          };
        }
        return chat;
      })
    );

    // Save user message to Supabase
    await chatService.sendMessage(userMessage, chatId);

    // Add a placeholder for the assistant's response with a proper UUID
    const assistantMessageId = `assistant-${uuidv4()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    // Add the placeholder message
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          // If this is the first message, update the chat title
          if (chat.messages.length === 0) {
            const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');

            // Update chat title in Supabase
            chatService.updateChatTitle(chatId, title);

            return {
              ...chat,
              title,
              messages: [...messages, assistantMessage],
            };
          }
          return {
            ...chat,
            messages: [...messages, assistantMessage],
          };
        }
        return chat;
      })
    );

    setIsLoading(true);

    try {
      // Check if Pinecone search is available
      console.log('🔍 Checking Pinecone configuration...');
      const isPineconeConfig = isPineconeConfigured();
      const isEmbeddingConfig = isEmbeddingConfigured();
      console.log('📊 Pinecone configured:', isPineconeConfig);
      console.log('🔤 Embedding API configured:', isEmbeddingConfig);

      const canUseVectorSearch = isPineconeConfig && isEmbeddingConfig;
      console.log('🔎 Can use vector search:', canUseVectorSearch);

      let relatedKnowledge = [];
      let enhancedPrompt = content;

      // Search Pinecone for relevant knowledge if available
      if (canUseVectorSearch) {
        try {
          console.log('🔍 Searching Pinecone for relevant knowledge...');
          console.log('🔍 Query:', content);
          relatedKnowledge = await searchKnowledgeBase(content, true);

          // If we found relevant knowledge, enhance the prompt with it
          if (relatedKnowledge && relatedKnowledge.length > 0) {
            console.log(`✅ Found ${relatedKnowledge.length} relevant entries in Pinecone`);

            // Log the found entries
            relatedKnowledge.forEach((entry, index) => {
              console.log(`📄 Entry ${index + 1}:`);
              console.log(`   Title: ${entry.metadata.title}`);
              console.log(`   Type: ${entry.metadata.type}`);
              console.log(`   Tags: ${entry.metadata.tags.join(', ')}`);
              console.log(`   Content: ${entry.content.substring(0, 100)}...`);
            });

            // Add a visual indicator that we're using Pinecone data
            console.log('🔍 Adding visual indicator for Pinecone data usage');

            // Set the usedStoredKnowledge flag on the assistant message
            setChats((prevChats) =>
              prevChats.map((chat) => {
                if (chat.id === chatId) {
                  return {
                    ...chat,
                    messages: chat.messages.map((msg) => {
                      if (msg.id === assistantMessageId) {
                        return {
                          ...msg,
                          usedStoredKnowledge: true
                        };
                      }
                      return msg;
                    }),
                  };
                }
                return chat;
              })
            );

            // Format the knowledge to include in the prompt - improved format for better Claude understanding
            let knowledgeContext = "\n\n<knowledge_base>\n";

            // Log the knowledge entries for debugging
            console.log(`🔍 Formatting ${relatedKnowledge.length} knowledge entries for Claude`);

            relatedKnowledge.forEach((entry, index) => {
              // Log each entry for debugging
              console.log(`🔍 Entry ${index + 1}:`);
              console.log(`   Title: ${entry.metadata.title}`);
              console.log(`   Content length: ${entry.content?.length || 0} characters`);
              console.log(`   Tags: ${entry.metadata.tags?.join(', ') || 'none'}`);

              // Ensure the entry has valid content
              const title = entry.metadata.title?.trim() || `Entry ${index + 1}`;
              const content = entry.content?.trim() || `No content available for entry ${index + 1}`;

              knowledgeContext += `\n<entry id="${index + 1}">\n`;
              knowledgeContext += `<title>${title}</title>\n`;
              knowledgeContext += `<content>${content}</content>\n`;
              knowledgeContext += `</entry>\n`;
            });

            knowledgeContext += "\n</knowledge_base>\n\nI've provided information from my knowledge base above. This information is HIGHLY RELEVANT to the user's question. Please use this information to enhance your understanding of the context and provide a detailed, accurate response.\n\nDo not mention that you're using the knowledge base unless it's necessary to cite a specific fact or detail. Focus on providing a natural, conversational response that incorporates the knowledge seamlessly.\n\nUser's question: ";

            // Add the knowledge context to the user's message
            enhancedPrompt = knowledgeContext + content;

            // Update the user message with related knowledge
            userMessage.relatedKnowledge = relatedKnowledge;
            assistantMessage.usedStoredKnowledge = true;

            console.log('🔍 Setting usedStoredKnowledge flag to true for assistant message');

            // Update the user message in state to show it has related knowledge
            setChats((prevChats) =>
              prevChats.map((chat) => {
                if (chat.id === chatId) {
                  return {
                    ...chat,
                    messages: chat.messages.map((msg) => {
                      if (msg.id === userMessage.id) {
                        return {
                          ...msg,
                          relatedKnowledge
                        };
                      }
                      return msg;
                    }),
                  };
                }
                return chat;
              })
            );
          }
        } catch (searchError) {
          console.error('Error searching Pinecone:', searchError);
        }
      }

      // Prepare the messages for the API
      const apiMessages = messages.map(msg => {
        // If this is the user message and we have enhanced it with knowledge context
        if (msg.id === userMessage.id && enhancedPrompt !== content) {
          console.log('🔍 Using enhanced prompt with knowledge context');
          // Log the first 200 characters of the enhanced prompt for debugging
          console.log('🔍 Enhanced prompt preview:', enhancedPrompt.substring(0, 200) + '...');
          return {
            role: msg.role,
            content: enhancedPrompt
          };
        }
        return {
          role: msg.role,
          content: msg.content
        };
      });

      // Log the number of messages being sent to Claude
      console.log(`🔍 Sending ${apiMessages.length} messages to Claude`);

      // Use streaming for a better user experience
      let fullResponse = '';

      await claudeApi.streamChat(
        {
          messages: apiMessages,
          system: "You are Claude, an AI assistant by Anthropic. When provided with information from a knowledge base in the user's message, you MUST use it to enhance your responses. The knowledge base contains highly relevant information to answer the user's question. Incorporate this information naturally into your response. Only mention the knowledge base explicitly if you need to cite specific facts or details.",
          temperature: 0.7
        },
        (chunk) => {
          // Update the assistant's message with the new chunk
          fullResponse += chunk;
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (chat.id === chatId) {
                return {
                  ...chat,
                  messages: chat.messages.map((msg) => {
                    if (msg.id === assistantMessageId) {
                      return {
                        ...msg,
                        content: fullResponse,
                        isLoading: true,
                        usedStoredKnowledge: assistantMessage.usedStoredKnowledge
                      };
                    }
                    return msg;
                  }),
                };
              }
              return chat;
            })
          );
        },
        (error) => {
          console.error('Stream error:', error);
          // Update the assistant's message with the error
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (chat.id === chatId) {
                return {
                  ...chat,
                  messages: chat.messages.map((msg) => {
                    if (msg.id === assistantMessageId) {
                      return {
                        ...msg,
                        content: error.message || 'An error occurred while generating the response.',
                        isLoading: false
                      };
                    }
                    return msg;
                  }),
                };
              }
              return chat;
            })
          );
        },
        controller.signal
      );

      // Final update to mark the message as not loading
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === chatId) {
            // Find the current state of the assistant message to preserve usedStoredKnowledge
            const currentAssistantMessage = chat.messages.find(msg => msg.id === assistantMessageId);
            const usedKnowledge = currentAssistantMessage?.usedStoredKnowledge || false;

            const finalAssistantMessage = {
              ...assistantMessage,
              content: fullResponse,
              isLoading: false,
              usedStoredKnowledge: usedKnowledge
            };

            // Save assistant message to Supabase
            chatService.sendMessage(finalAssistantMessage, chatId);

            return {
              ...chat,
              messages: chat.messages.map((msg) => {
                if (msg.id === assistantMessageId) {
                  return finalAssistantMessage;
                }
                return msg;
              }),
            };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error('Error in addMessagesToChat:', error);

      // Update the assistant's message with the error
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request. Please try again.';

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === chatId) {
            // Find the current state of the assistant message to preserve usedStoredKnowledge
            const currentAssistantMessage = chat.messages.find(msg => msg.id === assistantMessageId);
            const usedKnowledge = currentAssistantMessage?.usedStoredKnowledge || false;

            const errorAssistantMessage = {
              ...assistantMessage,
              content: errorMessage,
              isLoading: false,
              usedStoredKnowledge: usedKnowledge
            };

            // Save error message to Supabase
            chatService.sendMessage(errorAssistantMessage, chatId);

            return {
              ...chat,
              messages: chat.messages.map((msg) => {
                if (msg.id === assistantMessageId) {
                  return errorAssistantMessage;
                }
                return msg;
              }),
            };
          }
          return chat;
        })
      );
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const toggleSidebar = () => {
    // First toggle the sidebar state
    setSidebarExpanded((prev) => {
      const newState = !prev;

      // Set showRightArrow based on new sidebar state
      if (!newState) {
        // When closing sidebar, show right arrow
        setShowRightArrow(true);
      } else {
        // When opening sidebar, hide right arrow
        setShowRightArrow(false);
      }

      return newState;
    });
  };

  const userProfile = {
    initials: 'CW',
    name: 'Clarity World',
    role: 'Creator',
  };

  const updateMessage = async (messageId: string, newContent: string) => {
    if (!currentChatId) return;

    // Cancel any ongoing generation
    if (abortController) {
      abortController.abort();
    }

    // Create a new abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);

    // Find the original message first
    const currentChat = chats.find(chat => chat.id === currentChatId);
    if (!currentChat) return;

    const originalMessage = currentChat.messages.find(msg => msg.id === messageId);
    if (!originalMessage) return;

    // Create updated message with edit flag
    const updatedMessage: Message = {
      ...originalMessage,
      content: newContent,
      edited: true,
      timestamp: new Date(),
    };

    // First update the edited message
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === currentChatId) {
          const updatedMessages = chat.messages.map((msg) => {
              if (msg.id === messageId) {
                return updatedMessage;
              }
              return msg;
          });

          // Find the index of the edited message
          const editedIndex = updatedMessages.findIndex(msg => msg.id === messageId);
          if (editedIndex === -1) return chat;

          // Keep messages up to and including the edited message
          const truncatedMessages = updatedMessages.slice(0, editedIndex + 1);

          return {
            ...chat,
            messages: truncatedMessages,
          };
        }
        return chat;
      })
    );

    // Update message in Supabase
    await chatService.sendMessage(updatedMessage, currentChatId);

    // Add a placeholder for the assistant's response
    const assistantMessageId = `assistant-${uuidv4()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    // Add the placeholder message
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, assistantMessage],
          };
        }
        return chat;
      })
    );

    setIsLoading(true);

    try {
      // Get current chat's message history
      const currentChat = chats.find(chat => chat.id === currentChatId);
      if (!currentChat) return;

      // Prepare the messages for the API
      const apiMessages = currentChat.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Use streaming for a better user experience
      let fullResponse = '';

      await claudeApi.streamChat(
        {
          messages: apiMessages,
          system: "You are Claude, an AI assistant by Anthropic. When provided with information from a knowledge base in the user's message, you MUST use it to enhance your responses. The knowledge base contains highly relevant information to answer the user's question. Incorporate this information naturally into your response. Only mention the knowledge base explicitly if you need to cite specific facts or details.",
          temperature: 0.7
        },
        (chunk) => {
          // Update the assistant's message with the new chunk
          fullResponse += chunk;
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (chat.id === currentChatId) {
                return {
                  ...chat,
                  messages: chat.messages.map((msg) => {
                    if (msg.id === assistantMessageId) {
                      return {
                        ...msg,
                        content: fullResponse,
                        isLoading: true
                      };
                    }
                    return msg;
                  }),
                };
              }
              return chat;
            })
          );
        },
        (error) => {
          console.error('Stream error:', error);
          // Update the assistant's message with the error
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (chat.id === currentChatId) {
                return {
                  ...chat,
                  messages: chat.messages.map((msg) => {
                    if (msg.id === assistantMessageId) {
                      return {
                        ...msg,
                        content: error.message || 'An error occurred while generating the response.',
                        isLoading: false
                      };
                    }
                    return msg;
                  }),
                };
              }
              return chat;
            })
          );
        },
        controller.signal
      );

      // Final update to mark the message as not loading
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === currentChatId) {
            const finalAssistantMessage = {
              ...assistantMessage,
              content: fullResponse,
              isLoading: false
            };

            // Save assistant message to Supabase
            chatService.sendMessage(finalAssistantMessage, currentChatId);

            return {
              ...chat,
              messages: chat.messages.map((msg) => {
                if (msg.id === assistantMessageId) {
                  return finalAssistantMessage;
                }
                return msg;
              }),
            };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error('Error in updateMessage:', error);

      // Update the assistant's message with the error
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request. Please try again.';

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === currentChatId) {
            const errorAssistantMessage = {
              ...assistantMessage,
              content: errorMessage,
              isLoading: false
            };

            // Save error message to Supabase
            chatService.sendMessage(errorAssistantMessage, currentChatId);

            return {
              ...chat,
              messages: chat.messages.map((msg) => {
                if (msg.id === assistantMessageId) {
                  return errorAssistantMessage;
                }
                return msg;
              }),
            };
          }
          return chat;
        })
      );
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const deleteMessage = (messageId: string) => {
    if (!currentChatId) return;

    const currentChat = chats.find(chat => chat.id === currentChatId);
    if (!currentChat) return;

    // Find the index of the message to delete
    const messageIndex = currentChat.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Create a new array of messages without the deleted message and any messages after it
    const updatedMessages = currentChat.messages.slice(0, messageIndex);

    // Update the chat with the new messages
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: updatedMessages
          };
        }
        return chat;
      })
    );

    // Delete message and all subsequent messages from Supabase
    // This is a bit tricky with the current structure, so we'll handle it by
    // first deleting all messages for the chat and then re-inserting the kept ones
    chatService.deleteChat(currentChatId).then(() => {
      // Re-create the chat
      chatService.createChat(currentChat);

      // Re-insert all remaining messages
      for (const message of updatedMessages) {
        chatService.sendMessage(message, currentChatId);
      }
    });
  };

  const regenerateMessage = async (messageId: string) => {
    if (!currentChatId) return;

    // Cancel any ongoing generation
    if (abortController) {
      abortController.abort();
    }

    // Create a new abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);

    const currentChat = chats.find(chat => chat.id === currentChatId);
    if (!currentChat) return;

    // Find the index of the message to regenerate
    const messageIndex = currentChat.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Make sure it's an assistant message
    if (currentChat.messages[messageIndex].role !== 'assistant') return;

    // Keep messages up to the previous message (the user prompt)
    const keptMessages = currentChat.messages.slice(0, messageIndex);

    // Update the chat with just the kept messages
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: keptMessages
          };
        }
        return chat;
      })
    );

    // Create a new assistant message as a placeholder
    const assistantMessageId = `assistant-${uuidv4()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    // Add the assistant message placeholder
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...keptMessages, assistantMessage]
          };
        }
        return chat;
      })
    );

    setIsLoading(true);

    try {
      // Prepare the messages for the API
      const apiMessages = keptMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Use streaming for a better user experience
      let fullResponse = '';

      await claudeApi.streamChat(
        {
          messages: apiMessages,
          system: "You are Claude, an AI assistant by Anthropic. When provided with information from a knowledge base in the user's message, you MUST use it to enhance your responses. The knowledge base contains highly relevant information to answer the user's question. Incorporate this information naturally into your response. Only mention the knowledge base explicitly if you need to cite specific facts or details.",
          temperature: 0.7
        },
        (chunk) => {
          // Update the assistant's message with the new chunk
          fullResponse += chunk;
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (chat.id === currentChatId) {
                return {
                  ...chat,
                  messages: chat.messages.map((msg) => {
                    if (msg.id === assistantMessageId) {
                      return {
                        ...msg,
                        content: fullResponse,
                        isLoading: true
                      };
                    }
                    return msg;
                  }),
                };
              }
              return chat;
            })
          );
        },
        (error) => {
          console.error('Stream error:', error);
          // Update the assistant's message with the error
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (chat.id === currentChatId) {
                return {
                  ...chat,
                  messages: chat.messages.map((msg) => {
                    if (msg.id === assistantMessageId) {
                      return {
                        ...msg,
                        content: error.message || 'An error occurred while generating the response.',
                        isLoading: false
                      };
                    }
                    return msg;
                  }),
                };
              }
              return chat;
            })
          );
        },
        controller.signal
      );

      // Final update to mark the message as not loading
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === currentChatId) {
            const finalAssistantMessage = {
              ...assistantMessage,
              content: fullResponse,
              isLoading: false
            };

            // Save assistant message to Supabase
            chatService.sendMessage(finalAssistantMessage, currentChatId);

            return {
              ...chat,
              messages: chat.messages.map((msg) => {
                if (msg.id === assistantMessageId) {
                  return finalAssistantMessage;
                }
                return msg;
              }),
            };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error('Error in regenerateMessage:', error);

      // Update the assistant's message with the error
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request. Please try again.';

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === currentChatId) {
            const errorAssistantMessage = {
              ...assistantMessage,
              content: errorMessage,
              isLoading: false
            };

            // Save error message to Supabase
            chatService.sendMessage(errorAssistantMessage, currentChatId);

            return {
              ...chat,
              messages: chat.messages.map((msg) => {
                if (msg.id === assistantMessageId) {
                  return errorAssistantMessage;
                }
                return msg;
              }),
            };
          }
          return chat;
        })
      );
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const addPrePrompt = (prompt: Omit<PrePrompt, 'id'>) => {
    const newPrompt = {
      ...prompt,
      id: uuidv4(),
    };
    const updatedPrompts = [...prePrompts, newPrompt];
    setPrePrompts(updatedPrompts);
    localStorage.setItem('prePrompts', JSON.stringify(updatedPrompts));
  };

  const deletePrePrompt = (id: string) => {
    const updatedPrompts = prePrompts.filter(p => p.id !== id);
    setPrePrompts(updatedPrompts);
    localStorage.setItem('prePrompts', JSON.stringify(updatedPrompts));
  };

  const updatePrePrompt = (id: string, prompt: Omit<PrePrompt, 'id'>) => {
    const updatedPrompts = prePrompts.map(p =>
      p.id === id ? { ...prompt, id } : p
    );
    setPrePrompts(updatedPrompts);
    localStorage.setItem('prePrompts', JSON.stringify(updatedPrompts));
  };

  const togglePrePrompts = () => {
    setPrePromptsEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('prePromptsEnabled', JSON.stringify(newValue));
      return newValue;
    });
  };

  const addToDownloadQueue = (messageId: string) => {
    const message = chats.flatMap(chat => chat.messages).find(msg => msg.id === messageId);
    if (!message) return;

    setDownloadQueue(prev => {
      if (prev.some(item => item.id === messageId)) return prev;
      const newQueue = [...prev, {
        id: messageId,
        title: message.content.slice(0, 50) + '...',
        timestamp: new Date(message.timestamp),
        downloaded: false
      }];
      localStorage.setItem('downloadQueue', JSON.stringify(newQueue));
      return newQueue;
    });
  };

  const removeFromDownloadQueue = (messageId: string) => {
    setDownloadQueue(prev => {
      const newQueue = prev.filter(item => item.id !== messageId);
      localStorage.setItem('downloadQueue', JSON.stringify(newQueue));
      return newQueue;
    });
  };

  const clearDownloadQueue = () => {
    setDownloadQueue([]);
    localStorage.removeItem('downloadQueue');
  };

  const downloadMessage = (messageId: string) => {
    const message = chats.flatMap(chat => chat.messages).find(msg => msg.id === messageId);
    if (!message) return;

    const blob = new Blob([message.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-${messageId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadQueue(prev => {
      const newQueue = prev.map(item =>
        item.id === messageId ? { ...item, downloaded: true } : item
      );
      localStorage.setItem('downloadQueue', JSON.stringify(newQueue));
      return newQueue;
    });
  };

  const downloadAllAsPdf = () => {
    const doc = new jsPDF();
    let y = 10;

    downloadQueue.forEach((item) => {
      const message = chats.flatMap(chat => chat.messages).find(msg => msg.id === item.id);
      if (!message) return;

      if (y > 280) {
        doc.addPage();
        y = 10;
      }

      doc.setFontSize(12);
      doc.text(message.role.toUpperCase(), 10, y);
      y += 7;

      doc.setFontSize(10);
      const lines = doc.splitTextToSize(message.content, 190);
      doc.text(lines, 10, y);
      y += lines.length * 5 + 10;
    });

    doc.save('all-messages.pdf');

    setDownloadQueue(prev => {
      const newQueue = prev.map(item => ({ ...item, downloaded: true }));
      localStorage.setItem('downloadQueue', JSON.stringify(newQueue));
      return newQueue;
    });
  };

  // Reset showRightArrow when clicking outside the sidebar toggle
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const toggleButton = document.getElementById('sidebar-toggle');
      if (toggleButton && !toggleButton.contains(e.target as Node) && !sidebarExpanded) {
        setShowRightArrow(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [sidebarExpanded]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        sidebarExpanded,
        showRightArrow,
        isLoading,
        createChat,
        updateChatTitle,
        sendMessage,
        setCurrentChat: setCurrentChatId,
        toggleSidebar,
        deleteChat,
        userProfile,
        updateMessage,
        stopGeneration,
        deleteMessage,
        regenerateMessage,
        prePrompts,
        addPrePrompt,
        deletePrePrompt,
        updatePrePrompt,
        prePromptsEnabled,
        togglePrePrompts,
        downloadQueue,
        addToDownloadQueue,
        removeFromDownloadQueue,
        clearDownloadQueue,
        downloadMessage,
        downloadAllAsPdf,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
