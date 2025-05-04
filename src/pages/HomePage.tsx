import { useEffect } from 'react';
import { ChatInput } from '@/components/ui/ChatInput';
import { useChatContext } from '@/contexts/ChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import TestMobileInputPage from './TestMobileInputPage';

const HomePage = () => {
  const { setCurrentChat, sendMessage } = useChatContext();
  const isMobile = useIsMobile();

  // Clear current chat when coming to home page
  useEffect(() => {
    setCurrentChat('');
  }, [setCurrentChat]);

  // Render the mobile version for mobile devices
  if (isMobile) {
    return <TestMobileInputPage />;
  }

  // Render the desktop version for non-mobile devices
  return (
    <div className="flex flex-col h-full">
      <div className={cn(
        "flex-1 flex flex-col items-center justify-center -mt-24"
      )}>
        <div className="flex flex-col items-center transform -translate-x-[3px]">
          <div className="text-claude-orange text-3xl mb-4">*</div>
          <h1 className="text-[50px] font-medium mb-0 text-gray-800 w-[672px] text-center -translate-x-[11px] font-['Söhne']">What's new, Clarity?</h1>
          <div className="w-full max-w-[672px] mt-[28.5px] -translate-x-[11px]">
            <ChatInput />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

