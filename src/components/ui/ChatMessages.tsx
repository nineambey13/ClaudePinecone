import { useRef, useEffect, useState } from 'react';
import { Pencil, StopCircle, Trash2, RotateCw, Download, Copy, Check, Search } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './avatar';
import { Button } from './button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Input } from './input';

interface MessageContentProps {
  content: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  return (
    <div className="prose dark:prose-invert max-w-none overflow-x-auto">
      <ReactMarkdown
        components={{
          code: ({children, className}) => {
            const language = className ? className.replace('language-', '') : '';
            return language ? (
              <SyntaxHighlighter
                style={oneDark}
                language={language}
                wrapLongLines={true}
                customStyle={{maxWidth: '100%', overflowX: 'auto'}}
              >
                {String(children)}
              </SyntaxHighlighter>
            ) : (
              <code className="break-words">{children}</code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const ChatMessages = () => {
  const {
    chats,
    currentChatId,
    userProfile,
    updateMessage,
    deleteMessage,
    regenerateMessage,
    isLoading,
    stopGeneration,
    addToDownloadQueue
  } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const currentChat = currentChatId
    ? chats.find(chat => chat.id === currentChatId)
    : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  const handleEditClick = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  const handleEditSubmit = (messageId: string) => {
    if (editContent.trim()) {
      updateMessage(messageId, editContent);
    }
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleDeleteClick = (messageId: string) => {
    setMessageToDelete(messageId);
  };

  const handleDeleteConfirm = () => {
    if (messageToDelete) {
      deleteMessage(messageToDelete);
      setMessageToDelete(null);
    }
  };

  const handleCopyClick = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const filteredMessages = currentChat?.messages.filter(message =>
    searchQuery ? message.content.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && currentChat) {
      const results = currentChat.messages
        .filter(message => message.content.toLowerCase().includes(query.toLowerCase()))
        .map(message => message.id);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  if (!currentChat) {
    return null;
  }

  return (
    <>
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        {currentChat?.messages.length > 0 && (
          <div className="max-w-[672px] mx-auto mb-4 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
              {searchResults.length > 0 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {searchResults.length} results
                </div>
              )}
            </div>
          </div>
        )}
      <div className="max-w-[672px] w-full mx-auto">
        {currentChat.messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start a conversation!
          </div>
        ) : (
            <>
              {(filteredMessages || []).map((message) => (
            <div
              key={message.id}
                  className={cn(
                    "mb-6 group",
                    searchResults.includes(message.id) && "bg-yellow-50/10 rounded-xl"
                  )}
              onMouseEnter={() => setHoveredMessageId(message.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              {message.role === 'user' ? (
                <div className="flex flex-col">
                  <div className="flex justify-start items-start">
                    <div className="bg-[#F4EAD2]/80 border border-[#F4EAD2] text-gray-800 rounded-2xl px-4 py-3 w-full max-w-[672px] relative flex items-start gap-3 shadow-sm overflow-hidden">
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                      {userProfile.initials}
                    </AvatarFallback>
                  </Avatar>
                      {editingMessageId === message.id ? (
                        <div className="flex-1">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleEditSubmit(message.id);
                              }
                              if (e.key === 'Escape') {
                                setEditingMessageId(null);
                                setEditContent('');
                              }
                            }}
                                className="w-full p-2 border rounded-md"
                            autoFocus
                          />
                            </div>
                          ) : (
                            <div className="flex-1 break-words">
                              <MessageContent content={message.content} />
                            </div>
                          )}
                          {hoveredMessageId === message.id && !editingMessageId && (
                            <div className="absolute right-2 top-2 flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditClick(message.id, message.content)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCopyClick(message.id, message.content)}
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => addToDownloadQueue(message.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteClick(message.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex justify-end items-start">
                        <div className="text-gray-800 w-full max-w-[672px] relative flex items-start gap-3">
                          <div className="flex-1 break-words">
                            {/* Show Pinecone indicator if message used stored knowledge */}
                            {message.usedStoredKnowledge && (
                              <div className="flex items-center gap-1 mb-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8Z" stroke="currentColor" strokeWidth="2" />
                                  <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <span>Using knowledge from Pinecone</span>
                              </div>
                            )}
                            <MessageContent content={message.content} />
                            {isLoading && currentChat.messages[currentChat.messages.length - 1].id === message.id && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="animate-pulse flex space-x-1">
                                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                </div>
                              </div>
                            )}
                          </div>
                          {hoveredMessageId === message.id && (
                            <div className="absolute right-2 bottom-2 flex gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCopyClick(message.id, message.content)}
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => regenerateMessage(message.id)}
                              >
                                <RotateCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => addToDownloadQueue(message.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteClick(message.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                        </div>
                      )}
                    </div>
                  </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="fixed bottom-4 right-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={stopGeneration}
                  >
                    <StopCircle className="h-4 w-4" />
                    Stop Generation
                  </Button>
                </div>
              )}
            </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>

      <AlertDialog open={!!messageToDelete} onOpenChange={() => setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
