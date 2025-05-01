import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation } from 'react-router-dom';
import { useChatContext } from '@/contexts/ChatContext';

type MainLayoutProps = {
  children: ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { sidebarExpanded } = useChatContext();
  const isKnowledgePage = location.pathname === '/knowledge';

  return (
    <div className="flex h-screen overflow-hidden bg-[#FEF8EC]">
        {!isMobile && (
          <div className="relative">
            <Sidebar />
            <div className="absolute inset-y-0 right-0 -translate-x-[13px] w-[0.5px] bg-[#D4D4D4]"></div>
          </div>
        )}
      <main className={`flex-1 overflow-hidden flex flex-col ${!isMobile ? (sidebarExpanded && !isKnowledgePage ? 'ml-72' : 'ml-16') : ''}`}>
          {children}
        </main>
      </div>
  );
};
