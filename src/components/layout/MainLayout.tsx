
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ChatProvider } from '@/contexts/ChatContext';

type MainLayoutProps = {
  children: ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden bg-claude-beige">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </ChatProvider>
  );
};
