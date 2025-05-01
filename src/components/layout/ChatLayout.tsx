import { useChatContext } from '@/contexts/ChatContext';
import { Sidebar } from './Sidebar';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ChatLayout = () => {
  const { currentChatId, chats, sendMessage } = useChatContext();
  const currentChat = chats.find(chat => chat.id === currentChatId);
  const isNewChat = !currentChat?.messages?.length;
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (message.trim()) {
      const chatId = sendMessage(message);
      setMessage('');
      navigate(`/chat/${chatId}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-screen bg-[#F0EDE6]">
      <Sidebar />
      
      <main className="flex-1 relative flex flex-col">
        {isNewChat ? (
          <>
            <div className="flex flex-col items-center pt-[22vh]">
              <div className="mb-4 text-[#E07A5F]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-10 fill-current">
                  <path d="m19.6 66.5 19.7-11 .3-1-.3-.5h-1l-3.3-.2-11.2-.3L14 53l-9.5-.5-2.4-.5L0 49l.2-1.5 2-1.3 2.9.2 6.3.5 9.5.6 6.9.4L38 49.1h1.6l.2-.7-.5-.4-.4-.4L29 41l-10.6-7-5.6-4.1-3-2-1.5-2-.6-4.2 2.7-3 3.7.3.9.2 3.7 2.9 8 6.1L37 36l1.5 1.2.6-.4.1-.3-.7-1.1L33 25l-6-10.4-2.7-4.3-.7-2.6c-.3-1-.4-2-.4-3l3-4.2L28 0l4.2.6L33.8 2l2.6 6 4.1 9.3L47 29.9l2 3.8 1 3.4.3 1h.7v-.5l.5-7.2 1-8.7 1-11.2.3-3.2 1.6-3.8 3-2L61 2.6l2 2.9-.3 1.8-1.1 7.7L59 27.1l-1.5 8.2h.9l1-1.1 4.1-5.4 6.9-8.6 3-3.5L77 13l2.3-1.8h4.3l3.1 4.7-1.4 4.9-4.4 5.6-3.7 4.7-5.3 7.1-3.2 5.7.3.4h.7l12-2.6 6.4-1.1 7.6-1.3 3.5 1.6.4 1.6-1.4 3.4-8.2 2-9.6 2-14.3 3.3-.2.1.2.3 6.4.6 2.8.2h6.8l12.6 1 3.3 2 1.9 2.7-.3 2-5.1 2.6-6.8-1.6-16-3.8-5.4-1.3h-.8v.4l4.6 4.5 8.3 7.5L89 80.1l.5 2.4-1.3 2-1.4-.2-9.2-7-3.6-3-8-6.8h-.5v.7l1.8 2.7 9.8 14.7.5 4.5-.7 1.4-2.6 1-2.7-.6-5.8-8-6-9-4.7-8.2-.5.4-2.9 30.2-1.3 1.5-3 1.2-2.5-2-1.4-3 1.4-6.2 1.6-8 1.3-6.4 1.2-7.9.7-2.6v-.2H49L43 72l-9 12.3-7.2 7.6-1.7.7-3-1.5.3-2.8L24 86l10-12.8 6-7.9 4-4.6-.1-.5h-.3L17.2 77.4l-4.7.6-2-2 .2-3 1-1 8-5.5Z"></path>
                </svg>
              </div>
              <h1 className="text-[32px] text-center font-serif text-[#333333] mb-16">Evening, Clarity</h1>
            </div>
        
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col bg-white border border-gray-300 mx-auto items-stretch transition-all duration-200 shadow-md hover:shadow-lg focus-within:shadow-lg hover:border-gray-400 focus-within:border-gray-400 cursor-text rounded-2xl w-[672px]">
                <div className="flex flex-col gap-3.5 p-3.5">
                  <div className="relative">
                    <div className="max-h-96 w-full overflow-y-auto break-words min-h-[124px]">
                      {!message && (
                        <div className="absolute top-[14px] left-[14px] text-gray-500 pointer-events-none text-[15px] leading-[1.4]">
                          How can I help you today?
                        </div>
                      )}
                      <div 
                        contentEditable="true" 
                        translate="no" 
                        enterKeyHint="enter" 
                        tabIndex={0} 
                        className="outline-none break-words whitespace-pre-wrap min-h-[124px] text-[15px] leading-[1.4] p-[14px]"
                        role="textbox"
                        aria-multiline="true"
                        onInput={(e) => setMessage(e.currentTarget.textContent || '')}
                        onKeyDown={handleKeyDown}
                        suppressContentEditableWarning={true}
                      >
                        {message}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2.5 w-full items-center">
                    <div className="relative flex-1 flex items-center gap-2 shrink min-w-0">
                      <button className="inline-flex items-center justify-center relative shrink-0 can-focus select-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none border-0.5 transition-all h-8 min-w-8 rounded-lg flex items-center px-[7.5px] group !pointer-events-auto text-text-300 border-border-300 active:scale-[0.98] hover:text-text-200/90 hover:bg-bg-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="h-7 text-gray-800 ml-1.5 inline-flex items-center gap-[0.175em] rounded-md text-sm hover:bg-gray-100 px-2 py-1">
                        <span className="whitespace-nowrap tracking-tight select-none">Claude 3.7 Sonnet</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" className="text-gray-500">
                          <path d="M213.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                        </svg>
                      </button>
                      
                      <button 
                        onClick={handleSubmit}
                        disabled={!message.trim()}
                        className={`inline-flex items-center justify-center relative shrink-0 font-medium transition-colors h-8 w-8 rounded-lg active:scale-95 ${message.trim() ? 'bg-[#E07A5F] text-white hover:bg-[#E07A5F]/90' : 'bg-gray-100 text-gray-400'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Chat messages will go here */}
            <div className="mt-auto mb-8">
              <div className="w-[672px] bg-white border border-gray-300 rounded-2xl shadow-lg">
                <div className="relative flex flex-col min-h-[200px]">
                  <div className="flex-1 min-h-[200px] p-4">
                    {!message && (
                      <div className="absolute top-4 left-4 text-gray-500 pointer-events-none text-[15px]">
                        How can I help you today?
                      </div>
                    )}
                    <div 
                      contentEditable="true" 
                      className="w-full h-full min-h-[200px] outline-none text-[15px]"
                      onInput={(e) => setMessage(e.currentTarget.textContent || '')}
                      onKeyDown={handleKeyDown}
                      suppressContentEditableWarning={true}
                    >
                      {message}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border-t">
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                        </svg>
                      </button>
                      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24A16,16,0,1,1,88,80,16,16,0,0,1,104,64ZM216,168H199a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h97a32,32,0,0,0,62,0h17a8,8,0,0,0,0-16Zm-48,24a16,16,0,1,1,16-16A16,16,0,0,1,168,192Z"></path>
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="h-7 text-gray-800 ml-1.5 inline-flex items-center gap-[0.175em] rounded-md text-sm hover:bg-gray-100 px-2 py-1">
                        <span className="whitespace-nowrap tracking-tight select-none">Claude 3.7 Sonnet</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" className="text-gray-500">
                          <path d="M213.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                        </svg>
                      </button>
                      
                      <button 
                        onClick={handleSubmit}
                        disabled={!message.trim()}
                        className={`inline-flex items-center justify-center relative shrink-0 font-medium transition-colors h-8 w-8 rounded-lg active:scale-95 ${message.trim() ? 'bg-[#E07A5F] text-white hover:bg-[#E07A5F]/90' : 'bg-gray-100 text-gray-400'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}; 