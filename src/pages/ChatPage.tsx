
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatHeader } from '@/components/ui/ChatHeader';
import { ChatMessages } from '@/components/ui/ChatMessages';
import { ChatInput } from '@/components/ui/ChatInput';
import { useChatContext } from '@/contexts/ChatContext';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { chats, setCurrentChat } = useChatContext();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (id) {
      const chatExists = chats.some(chat => chat.id === id);
      if (chatExists) {
        setCurrentChat(id);
      } else {
        navigate('/');
      }
    }
  }, [id, chats, navigate, setCurrentChat]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <ChatMessages />
      {!isMobile && (
        <div className="p-4 border-t border-claude-border">
          <ChatInput />
        </div>
      )}
      {isMobile && <ChatInput />}
    </div>
  );
};

export default ChatPage;
