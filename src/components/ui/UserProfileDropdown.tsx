
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Settings, LogOut, Check } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

export const UserProfileDropdown = () => {
  const { userProfile, sidebarExpanded } = useChatContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className={cn(
          "flex items-center w-full hover:bg-gray-100 rounded-md transition-all", 
          sidebarExpanded ? "p-2" : "justify-center p-2"
        )}
      >
        <div className="flex items-center justify-center bg-gray-300 rounded-full w-8 h-8 text-sm font-medium">
          {userProfile.initials}
        </div>
        
        {sidebarExpanded && (
          <>
            <div className="ml-3 text-left truncate">
              <div className="text-sm font-medium">{userProfile.name}</div>
              <div className="text-xs text-gray-500">{userProfile.role}</div>
            </div>
            <div className="ml-auto">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-1 left-0 right-0 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex items-center justify-center bg-gray-300 rounded-full w-8 h-8 text-sm font-medium">
                {userProfile.initials}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium flex items-center">
                  {userProfile.name}
                  <Check size={14} className="ml-1 text-green-500" />
                </div>
                <div className="text-xs text-gray-500">{userProfile.role}</div>
              </div>
            </div>
          </div>
          
          <Link
            to="/settings"
            className="flex items-center px-3 py-2 hover:bg-gray-100 text-sm"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={16} className="mr-2" />
            Settings
          </Link>
          
          <Link
            to="/logout"
            className="flex items-center px-3 py-2 hover:bg-gray-100 text-sm"
            onClick={() => setIsOpen(false)}
          >
            <LogOut size={16} className="mr-2" />
            Log out
          </Link>
        </div>
      )}
    </div>
  );
};
