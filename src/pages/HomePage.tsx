
import { useEffect } from 'react';
import { ChatInput } from '@/components/ui/ChatInput';
import { useChatContext } from '@/contexts/ChatContext';

const HomePage = () => {
  const { setCurrentChat } = useChatContext();

  // Clear current chat when coming to home page
  useEffect(() => {
    setCurrentChat('');
  }, [setCurrentChat]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-claude-orange text-3xl mb-4">*</div>
        <h1 className="text-3xl font-normal mb-8">Evening, Clarity</h1>
        <div className="w-full max-w-2xl">
          <ChatInput />
        </div>
      </div>
      <div className="h-16"></div> {/* Spacer at bottom */}
    </div>
  );
};

export default HomePage;
