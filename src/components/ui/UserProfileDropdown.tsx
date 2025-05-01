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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 -translate-x-[2px] p-[6px] hover:bg-black/5 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-sm text-gray-700">{userProfile.initials}</span>
        </div>
        {sidebarExpanded && (
          <>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-700">{userProfile.name}</div>
              <div className="text-xs text-gray-500">{userProfile.role}</div>
            </div>
            <ChevronDown size={16} className="text-gray-500" />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm text-gray-700">{userProfile.initials}</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{userProfile.name}</div>
                <div className="text-sm text-gray-500">{userProfile.role}</div>
              </div>
            </div>
          </div>
          <div className="py-2">
            <Link to="/settings" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
              <Settings size={16} className="mr-2" />
              Settings
            </Link>
            <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
              <LogOut size={16} className="mr-2" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
