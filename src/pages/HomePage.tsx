
import { useEffect } from 'react';
import { ChatInput } from '@/components/ui/ChatInput';
import { useChatContext } from '@/contexts/ChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const HomePage = () => {
  const { setCurrentChat, setSidebarExpanded } = useChatContext();
  const isMobile = useIsMobile();

  // Clear current chat and hide sidebar when coming to home page
  useEffect(() => {
    setCurrentChat('');
    setSidebarExpanded(false);
  }, [setCurrentChat, setSidebarExpanded]);

  return (
    <div className="flex flex-col h-full">
      <div className={cn(
        "flex-1 flex flex-col items-center",
        isMobile ? "justify-start pt-16" : "justify-center"
      )}>
        <div className="text-claude-orange text-3xl mb-4">*</div>
        <h1 className="text-3xl font-normal mb-8">Good evening, Clarity</h1>
        <div className="w-full max-w-[95%] px-4 mx-auto">
          <ChatInput placeholder="How can I help you today?" className="relative" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
