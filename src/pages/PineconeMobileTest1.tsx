import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, ChevronDown, X, Paperclip, Database, MessageCircle, 
  ArrowLeft, Settings, LogOut, Search, Tag, Clock, BookOpen, 
  Brain, Check, AlertCircle, Edit, Trash2, Filter, Download,
  Upload, BarChart2, Share2, Users, Globe, Lock, Zap, Bookmark,
  RefreshCw, CheckCircle, Code
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Icons (reusing from previous component)
const SquareIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg" 
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M2.5 3C1.67157 3 1 3.67157 1 4.5V15.5C1 16.3284 1.67157 17 2.5 17H17.5C18.3284 17 19 16.3284 19 15.5V4.5C19 3.67157 18.3284 3 17.5 3H2.5ZM2 4.5C2 4.22386 2.22386 4 2.5 4H6V16H2.5C2.22386 16 2 15.7761 2 15.5V4.5ZM7 16H17.5C17.7761 16 18 15.7761 18 15.5V4.5C18 4.22386 17.7761 4 17.5 4H7V16Z"></path>
  </svg>
);

const RightArrowIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg" 
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M17.5 2C17.7761 2 18 2.22386 18 2.5V17.5C18 17.7761 17.7761 18 17.5 18C17.2239 18 17 17.7761 17 17.5V2.5C17 2.22386 17.2239 2 17.5 2ZM8.63003 4.66366C8.81578 4.45933 9.13201 4.44428 9.33634 4.63003L14.8363 9.63003C14.9406 9.72479 15 9.85913 15 10C15 10.1409 14.9406 10.2752 14.8363 10.37L9.33634 15.37C9.13201 15.5557 8.81578 15.5407 8.63003 15.3363C8.44428 15.132 8.45934 14.8158 8.66366 14.63L13.2067 10.5L2.5 10.5C2.22386 10.5 2 10.2761 2 10C2 9.72386 2.22386 9.5 2.5 9.5L13.2067 9.5L8.66366 5.36997C8.45934 5.18422 8.44428 4.86799 8.63003 4.66366Z"></path>
  </svg>
);

const LeftArrowIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg" 
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M5 10C5 9.85913 5.05943 9.72479 5.16366 9.63003L10.6637 4.63003C10.868 4.44428 11.1842 4.45933 11.37 4.66366C11.5557 4.86799 11.5407 5.18422 11.3363 5.36997L6.7933 9.5L17.5 9.5C17.7761 9.5 18 9.72386 18 10C18 10.2761 17.7761 10.5 17.5 10.5L6.7933 10.5L11.3363 14.63C11.5407 14.8158 11.5557 15.132 11.37 15.3363C11.1842 15.5407 10.868 15.5557 10.6637 15.37L5.16366 10.37C5.05943 10.2752 5 10.1409 5 10Z"></path>
    <path fillRule="evenodd" clipRule="evenodd" d="M2.5 2C2.77614 2 3 2.22386 3 2.5L3 17.5C3 17.7761 2.77614 18 2.5 18C2.22385 18 2 17.7761 2 17.5L2 2.5C2 2.22386 2.22386 2 2.5 2Z"></path>
  </svg>
);

// Pinecone related interfaces
interface PineconeEntry {
  id: string;
  content: string;
  metadata: {
    type: ContentType;
    tags: string[];
    created: Date;
    sourceMessageIds?: string[];
    title: string;
    lastAccessed?: Date;
    accessCount?: number;
    version?: number;
    collaborators?: string[];
    visibility: VisibilityType;
    status: EntryStatus;
    aiGenerated?: boolean;
    confidence?: number; // for auto-generated entries
  };
  embedding?: number[]; // Vector representation
  relatedEntries?: string[]; // IDs of related entries
}

// Enhanced types
type ContentType = 'code' | 'decision' | 'feature' | 'knowledge' | 'documentation' | 'meeting' | 'question';
type VisibilityType = 'private' | 'team' | 'organization' | 'public';
type EntryStatus = 'draft' | 'published' | 'archived' | 'flagged';
type SortOption = 'relevance' | 'newest' | 'oldest' | 'most_accessed' | 'recently_accessed';
type ViewMode = 'list' | 'grid' | 'compact' | 'graph';

// Sample tag options for Pinecone entries
const tagOptions = [
  'javascript', 'react', 'typescript', 'frontend', 'backend',
  'api', 'database', 'ui', 'ux', 'performance', 'security',
  'accessibility', 'mobile', 'desktop', 'architecture',
  'testing', 'deployment', 'design', 'analytics', 'machine-learning'
];

// Team members for collaboration
const teamMembers = [
  { id: '1', name: 'Alex Johnson', initials: 'AJ', role: 'Engineer' },
  { id: '2', name: 'Sarah Chen', initials: 'SC', role: 'Designer' },
  { id: '3', name: 'Miguel Garcia', initials: 'MG', role: 'Product Manager' },
  { id: '4', name: 'Priya Patel', initials: 'PP', role: 'Data Scientist' }
];

// Advanced styles for the app
const mobileAdvancedStyles = `
  .knowledge-card {
    background-color: #FFFFFF;
    border-radius: 8px;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .knowledge-card:hover {
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
  
  .knowledge-tag {
    background-color: #EDF2F7;
    color: #4A5568;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    margin-right: 4px;
    white-space: nowrap;
  }
  
  .truncate-2-lines {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .truncate-1-line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .grid-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .list-view {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .compact-view {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .type-indicator {
    width: 4px;
    border-radius: 2px;
  }

  .analytics-card {
    background-color: #F8FAFC;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
`;

// Enhanced mock Pinecone data for demonstration
const mockPineconeData: PineconeEntry[] = [
  {
    id: '1',
    content: 'We decided to use React with TypeScript for the frontend to ensure type safety.',
    metadata: {
      type: 'decision',
      tags: ['react', 'typescript', 'frontend', 'architecture'],
      created: new Date('2023-07-15'),
      sourceMessageIds: ['msg123', 'msg124'],
      title: 'Frontend Tech Stack Decision',
      lastAccessed: new Date('2023-10-12'),
      accessCount: 23,
      version: 1,
      visibility: 'team',
      status: 'published'
    },
    relatedEntries: ['2', '3']
  },
  {
    id: '2',
    content: 'const fetchData = async () => {\n  try {\n    const response = await api.get(\'/data\');\n    return response.data;\n  } catch (error) {\n    console.error(\'Error fetching data:\', error);\n    return null;\n  }\n};',
    metadata: {
      type: 'code',
      tags: ['javascript', 'api', 'async'],
      created: new Date('2023-07-20'),
      sourceMessageIds: ['msg789'],
      title: 'API Data Fetching Function',
      lastAccessed: new Date('2023-11-05'),
      accessCount: 17,
      version: 2,
      collaborators: ['1', '3'],
      visibility: 'team',
      status: 'published'
    }
  },
  {
    id: '3',
    content: 'The mobile sidebar should appear from the left edge and overlay the content with a semi-transparent backdrop.',
    metadata: {
      type: 'feature',
      tags: ['ui', 'mobile', 'sidebar'],
      created: new Date('2023-08-05'),
      sourceMessageIds: ['msg456', 'msg457'],
      title: 'Mobile Sidebar Design',
      lastAccessed: new Date('2023-09-30'),
      accessCount: 12,
      visibility: 'organization',
      status: 'published'
    }
  }
];

// Main component
const PineconeMobileTest1: React.FC = () => {
  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // Pinecone state
  const [pineconeEntries, setPineconeEntries] = useState<PineconeEntry[]>(mockPineconeData);
  const [filteredEntries, setFilteredEntries] = useState<PineconeEntry[]>(mockPineconeData);
  const [selectedEntry, setSelectedEntry] = useState<PineconeEntry | null>(null);
  const [isEntryDetailOpen, setIsEntryDetailOpen] = useState(false);
  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutomatedUpsertEnabled, setIsAutomatedUpsertEnabled] = useState(true);
  const [activeFilters, setActiveFilters] = useState<{
    types: ContentType[];
    tags: string[];
    dateRange: { start: Date | null; end: Date | null };
    visibility: VisibilityType[];
    status: EntryStatus[];
  }>({
    types: [],
    tags: [],
    dateRange: { start: null, end: null },
    visibility: [],
    status: []
  });
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [pendingAutomatedEntries, setPendingAutomatedEntries] = useState<PineconeEntry[]>([]);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    totalEntries: mockPineconeData.length,
    byType: {
      code: 1,
      decision: 1,
      feature: 1,
      knowledge: 0,
      documentation: 0,
      meeting: 0,
      question: 0
    },
    topTags: ['react', 'typescript', 'frontend', 'ui', 'mobile'],
    knowledgeGrowth: [
      { date: '2023-07', count: 2 },
      { date: '2023-08', count: 3 },
      { date: '2023-09', count: 5 },
      { date: '2023-10', count: 8 },
      { date: '2023-11', count: 12 }
    ],
    accessStats: {
      mostAccessed: {
        id: '1',
        title: 'Frontend Tech Stack Decision',
        count: 23
      },
      recentlyAccessed: [
        { id: '2', title: 'API Data Fetching Function', date: new Date('2023-11-05') },
        { id: '1', title: 'Frontend Tech Stack Decision', date: new Date('2023-10-12') },
        { id: '3', title: 'Mobile Sidebar Design', date: new Date('2023-09-30') }
      ]
    },
    gapAreas: ['testing', 'deployment', 'performance']
  });
  
  // Collaboration state
  const [teamAccess, setTeamAccess] = useState({
    members: teamMembers,
    accessLevels: {
      '1': 'edit',
      '2': 'view',
      '3': 'admin',
      '4': 'edit'
    }
  });
  
  // User profile
  const userProfile = {
    id: 'current-user',
    initials: 'CW',
    name: 'ClarityAI',
    role: 'Creator',
    preferences: {
      autoSave: true,
      defaultVisibility: 'team' as VisibilityType,
      notificationsEnabled: true
    }
  };
  
  // New upsert state
  const [upsertFormData, setUpsertFormData] = useState<{
    title: string;
    content: string;
    type: ContentType;
    tags: string[];
    visibility: VisibilityType;
    status: EntryStatus;
    collaborators: string[];
    aiAssisted: boolean;
  }>({
    title: '',
    content: '',
    type: 'knowledge',
    tags: [],
    visibility: 'team',
    status: 'published',
    collaborators: [],
    aiAssisted: true
  });
  
  // Ref for search input
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Reset showRightArrow on initial page load
  useEffect(() => {
    setShowRightArrow(false);
  }, []);

  // Handle clicks anywhere on the page to reset right arrow visibility
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Check if click is not on the sidebar toggle button
      const toggleButton = document.getElementById('sidebar-toggle');
      if (toggleButton && !toggleButton.contains(e.target as Node) && !isSidebarOpen) {
        setShowRightArrow(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isSidebarOpen]);
  
  // Filter entries based on search and active filters
  useEffect(() => {
    let result = [...mockPineconeData];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(entry => 
        entry.metadata.title.toLowerCase().includes(query) || 
        entry.content.toLowerCase().includes(query) ||
        entry.metadata.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply type filters
    if (activeFilters.types.length > 0) {
      result = result.filter(entry => activeFilters.types.includes(entry.metadata.type));
    }
    
    // Apply tag filters
    if (activeFilters.tags.length > 0) {
      result = result.filter(entry => 
        entry.metadata.tags.some(tag => activeFilters.tags.includes(tag))
      );
    }
    
    // Apply date range filter
    if (activeFilters.dateRange.start || activeFilters.dateRange.end) {
      result = result.filter(entry => {
        const entryDate = new Date(entry.metadata.created);
        
        if (activeFilters.dateRange.start && activeFilters.dateRange.end) {
          return entryDate >= activeFilters.dateRange.start && entryDate <= activeFilters.dateRange.end;
        } else if (activeFilters.dateRange.start) {
          return entryDate >= activeFilters.dateRange.start;
        } else if (activeFilters.dateRange.end) {
          return entryDate <= activeFilters.dateRange.end;
        }
        
        return true;
      });
    }
    
    // Apply visibility filter
    if (activeFilters.visibility.length > 0) {
      result = result.filter(entry => activeFilters.visibility.includes(entry.metadata.visibility));
    }
    
    // Apply status filter
    if (activeFilters.status.length > 0) {
      result = result.filter(entry => activeFilters.status.includes(entry.metadata.status));
    }
    
    // Apply sorting
    result = sortEntries(result, sortOption);
    
    setFilteredEntries(result);
  }, [searchQuery, activeFilters, sortOption, mockPineconeData]);
  
  // Generate mock pending automated entries
  useEffect(() => {
    if (isAutomatedUpsertEnabled) {
      // Simulate detection of knowledge in conversations
      const mockPendingEntries: PineconeEntry[] = [
        {
          id: 'pending-1',
          content: 'Use environment variables for API keys and sensitive configuration in both development and production.',
          metadata: {
            type: 'knowledge',
            tags: ['security', 'api', 'deployment'],
            created: new Date(),
            title: 'API Security Best Practice',
            visibility: 'team',
            status: 'draft',
            aiGenerated: true,
            confidence: 0.89
          }
        },
        {
          id: 'pending-2',
          content: 'The performance issue with the image carousel was resolved by implementing lazy loading and optimizing asset sizes.',
          metadata: {
            type: 'decision',
            tags: ['performance', 'ui', 'optimization'],
            created: new Date(),
            title: 'Image Carousel Performance Fix',
            visibility: 'team',
            status: 'draft',
            aiGenerated: true,
            confidence: 0.76
          }
        }
      ];
      
      setPendingAutomatedEntries(mockPendingEntries);
    } else {
      setPendingAutomatedEntries([]);
    }
  }, [isAutomatedUpsertEnabled]);
  
  // Utility functions
  const sortEntries = (entries: PineconeEntry[], option: SortOption): PineconeEntry[] => {
    const sorted = [...entries];
    
    switch (option) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.metadata.created).getTime() - new Date(a.metadata.created).getTime()
        );
      case 'oldest':
        return sorted.sort((a, b) => 
          new Date(a.metadata.created).getTime() - new Date(b.metadata.created).getTime()
        );
      case 'most_accessed':
        return sorted.sort((a, b) => 
          (b.metadata.accessCount || 0) - (a.metadata.accessCount || 0)
        );
      case 'recently_accessed':
        return sorted.sort((a, b) => {
          const dateA = a.metadata.lastAccessed ? new Date(a.metadata.lastAccessed).getTime() : 0;
          const dateB = b.metadata.lastAccessed ? new Date(b.metadata.lastAccessed).getTime() : 0;
          return dateB - dateA;
        });
      default:
        return sorted;
    }
  };
  
  const getContentTypeColor = (type: ContentType): string => {
    switch (type) {
      case 'code':
        return '#3B82F6'; // blue
      case 'decision':
        return '#8B5CF6'; // purple
      case 'feature':
        return '#10B981'; // green
      case 'knowledge':
        return '#F59E0B'; // amber
      case 'documentation':
        return '#EC4899'; // pink
      case 'meeting':
        return '#6366F1'; // indigo
      case 'question':
        return '#F97316'; // orange
      default:
        return '#6B7280'; // gray
    }
  };

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'code':
        return <Code size={16} />;
      case 'decision':
        return <CheckCircle size={16} />;
      case 'feature':
        return <Zap size={16} />;
      case 'knowledge':
        return <Brain size={16} />;
      case 'documentation':
        return <BookOpen size={16} />;
      case 'meeting':
        return <Users size={16} />;
      case 'question':
        return <MessageCircle size={16} />;
      default:
        return <Database size={16} />;
    }
  };

  const getContentTypeLabel = (type: ContentType): string => {
    switch (type) {
      case 'code':
        return 'Code';
      case 'decision':
        return 'Decision';
      case 'feature':
        return 'Feature';
      case 'knowledge':
        return 'Knowledge';
      case 'documentation':
        return 'Documentation';
      case 'meeting':
        return 'Meeting';
      case 'question':
        return 'Question';
      default:
        return 'Unknown';
    }
  };
  
  const getStatusColor = (status: EntryStatus): string => {
    switch (status) {
      case 'published':
        return '#10B981'; // green
      case 'draft':
        return '#6B7280'; // gray
      case 'archived':
        return '#9CA3AF'; // gray-400
      case 'flagged':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };
  
  const getVisibilityIcon = (visibility: VisibilityType) => {
    switch (visibility) {
      case 'private':
        return <Lock size={14} />;
      case 'team':
        return <Users size={14} />;
      case 'organization':
        return <Database size={14} />;
      case 'public':
        return <Globe size={14} />;
      default:
        return <Lock size={14} />;
    }
  };
  
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Event handlers
  const toggleSidebar = () => {
    if (isSidebarOpen) {
      // When closing sidebar, show right arrow
      setShowRightArrow(true);
    }
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already applied via useEffect
  };
  
  const handleEntryClick = (entry: PineconeEntry) => {
    setSelectedEntry(entry);
    setIsEntryDetailOpen(true);
    
    // Update access count and last accessed date
    const updatedEntries = pineconeEntries.map(e => {
      if (e.id === entry.id) {
        return {
          ...e,
          metadata: {
            ...e.metadata,
            accessCount: (e.metadata.accessCount || 0) + 1,
            lastAccessed: new Date()
          }
        };
      }
      return e;
    });
    
    setPineconeEntries(updatedEntries);
  };
  
  const handleCreateNewEntry = () => {
    setUpsertFormData({
      title: '',
      content: '',
      type: 'knowledge',
      tags: [],
      visibility: userProfile.preferences.defaultVisibility,
      status: 'draft',
      collaborators: [],
      aiAssisted: true
    });
    setIsUpsertModalOpen(true);
  };
  
  const handleSaveEntry = () => {
    const newEntry: PineconeEntry = {
      id: Date.now().toString(),
      content: upsertFormData.content,
      metadata: {
        type: upsertFormData.type,
        tags: upsertFormData.tags,
        created: new Date(),
        title: upsertFormData.title,
        visibility: upsertFormData.visibility,
        status: upsertFormData.status,
        version: 1,
        collaborators: upsertFormData.collaborators,
        aiGenerated: false
      }
    };
    
    setPineconeEntries([newEntry, ...pineconeEntries]);
    setIsUpsertModalOpen(false);
    
    // Optionally show a success toast
  };
  
  const handleDeleteEntry = (entryId: string) => {
    setPineconeEntries(pineconeEntries.filter(entry => entry.id !== entryId));
    if (selectedEntry?.id === entryId) {
      setSelectedEntry(null);
      setIsEntryDetailOpen(false);
    }
  };
  
  const handleEditEntry = (entry: PineconeEntry) => {
    setUpsertFormData({
      title: entry.metadata.title,
      content: entry.content,
      type: entry.metadata.type,
      tags: entry.metadata.tags,
      visibility: entry.metadata.visibility,
      status: entry.metadata.status,
      collaborators: entry.metadata.collaborators || [],
      aiAssisted: false
    });
    setIsUpsertModalOpen(true);
  };
  
  const handleApproveAutomatedEntry = (entry: PineconeEntry) => {
    // Add the approved entry to our collection
    const approvedEntry = {
      ...entry,
      metadata: {
        ...entry.metadata,
        status: 'published' as EntryStatus
      }
    };
    
    setPineconeEntries([approvedEntry, ...pineconeEntries]);
    setPendingAutomatedEntries(pendingAutomatedEntries.filter(e => e.id !== entry.id));
  };
  
  const handleDismissAutomatedEntry = (entryId: string) => {
    setPendingAutomatedEntries(pendingAutomatedEntries.filter(entry => entry.id !== entryId));
  };

  return (
    <div 
      className="h-screen w-screen relative overflow-hidden"
      style={{ backgroundColor: '#F9F3E5' }}
    >
      {/* Add a style tag for custom mobile styles */}
      <style>{mobileAdvancedStyles}</style>
      
      {/* Mobile Sidebar */}
      <div 
        className={cn(
          "fixed top-0 left-0 h-full bg-[#F9F3E5] w-[330px] z-40 transition-transform duration-300 shadow-lg overflow-y-auto flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center h-14 px-2">
          <div className="flex items-center h-full">
            {/* Sidebar toggle button inside sidebar - aligned with other icons */}
            <div className="flex items-center justify-center w-7 h-7 cursor-pointer" onClick={toggleSidebar}>
              <ArrowLeft size={18} />
            </div>
            <span className="ml-2 font-['Lora'] font-semibold text-gray-800 text-[17.5px]">ClarityAI</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Knowledge Base Features */}
          <div className="flex flex-col">
            <button
              onClick={handleCreateNewEntry}
              className="flex items-center w-full h-[40px] px-3"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="rounded-full bg-[#D35F44] text-white p-1.5 flex items-center justify-center hover:shadow-md hover:-rotate-2 hover:scale-105 active:rotate-3 active:scale-[0.98] active:shadow-none transition-all duration-150 ease-in-out">
                  <Plus size={14} strokeWidth={2.5} />
                </div>
              </div>
              <span className="ml-2 text-[#E07A5F] font-bold text-[14px] tracking-tight">
                New Entry
              </span>
            </button>
            
            {/* Knowledge Base Link */}
            <button className="flex items-center w-full h-[40px] px-3 bg-gray-100">
              <div className="w-6 h-6 flex items-center justify-center">
                <Database size={16} className="text-gray-700" />
              </div>
              <span className="ml-2 text-gray-800 font-medium text-[13px] tracking-tight">
                Knowledge Base
              </span>
            </button>
            
            {/* Analytics Link */}
            <button 
              className="flex items-center w-full h-[40px] px-3"
              onClick={() => setActiveTab('analytics')}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <BarChart2 size={16} className="text-gray-700" />
              </div>
              <span className="ml-2 text-gray-700 text-[13px] tracking-tight">
                Analytics
              </span>
            </button>
            
            {/* Settings Link */}
            <button 
              className="flex items-center w-full h-[40px] px-3"
              onClick={() => setActiveTab('settings')}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <Settings size={16} className="text-gray-700" />
              </div>
              <span className="ml-2 text-gray-700 text-[13px] tracking-tight">
                Settings
              </span>
            </button>
          </div>

          {/* Content Types Section */}
          <div className="px-2 mt-5">
            <p className="text-xs text-gray-500 px-2 py-1 mb-0.5">Content Types</p>
            
            <div className="space-y-1">
              {(['code', 'decision', 'feature', 'knowledge', 'documentation', 'meeting', 'question'] as ContentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setActiveFilters({
                      ...activeFilters,
                      types: activeFilters.types.includes(type)
                        ? activeFilters.types.filter(t => t !== type)
                        : [...activeFilters.types, type]
                    });
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "flex items-center w-full px-3 py-1.5 rounded-md text-[13px]",
                    activeFilters.types.includes(type)
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getContentTypeColor(type) }}
                  />
                  {getContentTypeLabel(type)}
                  <div className="ml-auto text-xs text-gray-500">
                    {analyticsData.byType[type]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Popular Tags Section */}
          <div className="px-2 mt-5">
            <p className="text-xs text-gray-500 px-2 py-1 mb-0.5">Popular Tags</p>
            
            <div className="flex flex-wrap gap-1 px-2">
              {analyticsData.topTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setActiveFilters({
                      ...activeFilters,
                      tags: activeFilters.tags.includes(tag)
                        ? activeFilters.tags.filter(t => t !== tag)
                        : [...activeFilters.tags, tag]
                    });
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "knowledge-tag",
                    activeFilters.tags.includes(tag)
                      ? "bg-blue-100 text-blue-800"
                      : ""
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile Section - Fixed at bottom */}
        <div className="p-2 mt-auto border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex w-full items-center space-x-2 -translate-x-[2px] p-[6px] hover:bg-black/5 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm text-gray-700">{userProfile.initials}</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-700">{userProfile.name}</div>
                <div className="text-xs text-gray-500">{userProfile.role}</div>
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {isUserDropdownOpen && (
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
                  <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </button>
                  <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <LogOut size={16} className="mr-2" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Toggle Button - outside sidebar (visible when closed) */}
      {!isSidebarOpen && (
        <div
          id="sidebar-toggle"
          className="fixed top-0 left-0 z-50 m-3 w-7 h-7 flex items-center justify-center cursor-pointer"
          onClick={toggleSidebar}
        >
          <div className="relative w-[23px] h-[23px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gray-300/50 rounded-md"></div>
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out", 
              showRightArrow ? "opacity-100" : "opacity-0"
            )}>
              <RightArrowIcon />
            </div>
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out", 
              showRightArrow ? "opacity-0" : "opacity-100"
            )}>
              <SquareIcon />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="h-screen pt-14 pb-2 w-full overflow-hidden">
        {/* Header Bar */}
        <div className="fixed top-0 left-0 right-0 h-14 bg-[#F9F3E5] shadow-sm z-20 flex items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="text-xl font-['Lora'] font-medium text-gray-800 ml-7">Knowledge Base</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="bg-gray-100 rounded-md p-1 flex">
              <button 
                className={cn(
                  "p-1 rounded", 
                  viewMode === 'list' ? "bg-white shadow-sm" : ""
                )}
                onClick={() => setViewMode('list')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className={cn(
                  "p-1 rounded", 
                  viewMode === 'grid' ? "bg-white shadow-sm" : ""
                )}
                onClick={() => setViewMode('grid')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 5H5V10H10V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 5H14V10H19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 14H5V19H10V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 14H14V19H19V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className={cn(
                  "p-1 rounded", 
                  viewMode === 'compact' ? "bg-white shadow-sm" : ""
                )}
                onClick={() => setViewMode('compact')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V7C5 8.10457 5.89543 9 7 9H9C10.1046 9 11 8.10457 11 7V7C11 5.89543 10.1046 5 9 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 15H7C5.89543 15 5 15.8954 5 17V17C5 18.1046 5.89543 19 7 19H9C10.1046 19 11 18.1046 11 17V17C11 15.8954 10.1046 15 9 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 5H17C15.8954 5 15 5.89543 15 7V7C15 8.10457 15.8954 9 17 9H19C20.1046 9 21 8.10457 21 7V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 15H17C15.8954 15 15 15.8954 15 17V17C15 18.1046 15.8954 19 17 19H19C20.1046 19 21 18.1046 21 17V17C21 15.8954 20.1046 15 19 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {/* Filter Button */}
            <button 
              className={cn(
                "p-2 rounded-full", 
                isFilterPanelOpen || Object.values(activeFilters).some(filter => 
                  Array.isArray(filter) ? filter.length > 0 : false
                ) ? "bg-blue-100 text-blue-600" : "bg-gray-100"
              )}
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            >
              <Filter size={16} />
            </button>
          </div>
        </div>
        
        {/* Main Tabs Content */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full h-full"
        >
          <TabsList className="hidden">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Browse Tab - Knowledge Base Content */}
          <TabsContent value="browse" className="h-full overflow-hidden">
            <div className="h-full flex flex-col overflow-hidden px-4">
              {/* Search and Filter Bar */}
              <div className="py-2">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search knowledge base..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={16} />
                  </div>
                  
                  {searchQuery && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </form>
              </div>
              
              {/* Active Filters Display */}
              {Object.values(activeFilters).some(filter => 
                Array.isArray(filter) ? filter.length > 0 : false
              ) && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {activeFilters.types.map(type => (
                    <div 
                      key={`filter-type-${type}`} 
                      className="bg-gray-100 text-xs rounded-full px-2 py-1 flex items-center gap-1"
                    >
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: getContentTypeColor(type) }}
                      />
                      <span>{getContentTypeLabel(type)}</span>
                      <button 
                        className="ml-1 text-gray-400 hover:text-gray-600" 
                        onClick={() => setActiveFilters({
                          ...activeFilters,
                          types: activeFilters.types.filter(t => t !== type)
                        })}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {activeFilters.tags.map(tag => (
                    <div 
                      key={`filter-tag-${tag}`} 
                      className="bg-blue-50 text-blue-600 text-xs rounded-full px-2 py-1 flex items-center gap-1"
                    >
                      <Tag size={10} />
                      <span>{tag}</span>
                      <button 
                        className="ml-1 text-blue-400 hover:text-blue-600" 
                        onClick={() => setActiveFilters({
                          ...activeFilters,
                          tags: activeFilters.tags.filter(t => t !== tag)
                        })}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    className="text-xs text-gray-500 underline ml-1"
                    onClick={() => setActiveFilters({
                      types: [],
                      tags: [],
                      dateRange: { start: null, end: null },
                      visibility: [],
                      status: []
                    })}
                  >
                    Clear all
                  </button>
                </div>
              )}
              
              {/* Automated Entries Section */}
              {pendingAutomatedEntries.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-medium flex items-center gap-1">
                      <Brain size={14} className="text-[#D35F44]" />
                      <span>AI Suggested Entries</span>
                    </h2>
                    <button
                      className="text-xs text-gray-500"
                      onClick={() => setPendingAutomatedEntries([])}
                    >
                      Dismiss all
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {pendingAutomatedEntries.map(entry => (
                      <div 
                        key={entry.id} 
                        className="bg-white rounded-lg p-3 border border-amber-200 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            <div 
                              className="w-2 h-2 rounded-full mr-2" 
                              style={{ backgroundColor: getContentTypeColor(entry.metadata.type) }} 
                            />
                            <span className="font-medium text-sm">{entry.metadata.title}</span>
                          </div>
                          <div className="bg-amber-50 text-amber-600 text-xs px-1.5 py-0.5 rounded flex items-center">
                            <span>{(entry.metadata.confidence || 0) * 100}% match</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 truncate-2-lines">
                          {entry.content}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {entry.metadata.tags.map(tag => (
                            <span key={tag} className="knowledge-tag">{tag}</span>
                          ))}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button 
                            className="text-xs text-gray-500 px-2 py-1 rounded-md hover:bg-gray-100"
                            onClick={() => handleDismissAutomatedEntry(entry.id)}
                          >
                            Dismiss
                          </button>
                          <button 
                            className="text-xs bg-[#D35F44] text-white px-2 py-1 rounded-md flex items-center gap-1"
                            onClick={() => handleApproveAutomatedEntry(entry)}
                          >
                            <Check size={12} />
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sort Option */}
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-500">
                  {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                </div>
                
                <Select 
                  value={sortOption} 
                  onValueChange={(value) => setSortOption(value as SortOption)}
                >
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="most_accessed">Most Accessed</SelectItem>
                    <SelectItem value="recently_accessed">Recently Accessed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Knowledge Entries */}
              <div className={cn(
                "flex-1 overflow-y-auto pb-4",
                viewMode === 'grid' ? "grid-view" : 
                viewMode === 'list' ? "list-view" : "compact-view"
              )}>
                {filteredEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Database size={24} className="text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-1">No entries found</p>
                    <p className="text-sm text-gray-400 max-w-[250px]">
                      {searchQuery 
                        ? "Try a different search term or clear your filters" 
                        : "Start adding knowledge to your database"}
                    </p>
                  </div>
                ) : (
                  filteredEntries.map(entry => (
                    <div 
                      key={entry.id}
                      className={cn(
                        "knowledge-card border border-gray-100",
                        viewMode === 'compact' ? "p-2" : "p-3",
                        "cursor-pointer transition-all"
                      )}
                      onClick={() => handleEntryClick(entry)}
                    >
                      <div className="flex items-start">
                        {/* Type indicator */}
                        <div 
                          className="type-indicator h-full mr-2" 
                          style={{ backgroundColor: getContentTypeColor(entry.metadata.type) }} 
                        />
                        
                        <div className="flex-1 min-w-0">
                          {/* Header with title and type */}
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1 min-w-0">
                              <span className={cn(
                                "font-medium truncate-1-line", 
                                viewMode === 'compact' ? "text-xs" : "text-sm"
                              )}>
                                {entry.metadata.title}
                              </span>
                            </div>
                            
                            {viewMode !== 'compact' && (
                              <div className="flex items-center text-xs text-gray-500 whitespace-nowrap">
                                <Clock size={12} className="mr-1" />
                                {formatDate(entry.metadata.created)}
                              </div>
                            )}
                          </div>
                          
                          {/* Content preview - hide in compact view */}
                          {viewMode !== 'compact' && (
                            <p className="text-sm text-gray-600 mb-2 truncate-2-lines">
                              {entry.content}
                            </p>
                          )}
                          
                          {/* Footer with metadata */}
                          <div className="flex items-center justify-between">
                            {/* Tags - show fewer in compact view */}
                            <div className="flex flex-wrap gap-1">
                              {entry.metadata.tags
                                .slice(0, viewMode === 'compact' ? 2 : 4)
                                .map(tag => (
                                  <span 
                                    key={tag} 
                                    className={cn(
                                      "knowledge-tag",
                                      viewMode === 'compact' ? "text-[9px] px-1.5" : ""
                                    )}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              {entry.metadata.tags.length > (viewMode === 'compact' ? 2 : 4) && (
                                <span className="knowledge-tag bg-gray-50">
                                  +{entry.metadata.tags.length - (viewMode === 'compact' ? 2 : 4)}
                                </span>
                              )}
                            </div>
                            
                            {/* Status indicators */}
                            <div className="flex items-center gap-1">
                              {entry.metadata.aiGenerated && (
                                <span className="text-[9px] bg-purple-50 text-purple-600 px-1 py-0.5 rounded flex items-center gap-0.5">
                                  <Brain size={9} />
                                  <span>AI</span>
                                </span>
                              )}
                              
                              <span 
                                className="text-[9px] px-1 py-0.5 rounded flex items-center" 
                                style={{ 
                                  backgroundColor: `${getStatusColor(entry.metadata.status)}20`,
                                  color: getStatusColor(entry.metadata.status)
                                }}
                              >
                                {entry.metadata.status}
                              </span>
                              
                              {entry.metadata.visibility !== 'private' && (
                                <span className="text-[9px] text-gray-500">
                                  {getVisibilityIcon(entry.metadata.visibility)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="h-full overflow-hidden">
            <div className="h-full overflow-y-auto p-4">
              <h1 className="text-lg font-medium mb-4">Knowledge Analytics</h1>
              
              {/* Knowledge Growth */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h2 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <BarChart2 size={14} className="text-[#D35F44]" />
                  Knowledge Growth
                </h2>
                <div className="h-32 relative">
                  <div className="flex items-end justify-between h-24 mt-2 relative">
                    {analyticsData.knowledgeGrowth.map((item, index) => (
                      <div key={item.date} className="flex flex-col items-center">
                        <div 
                          className="w-8 bg-[#E07A5F] rounded-t-sm"
                          style={{ 
                            height: `${(item.count / 12) * 100}%`,
                            opacity: 0.6 + (index * 0.1)
                          }}
                        />
                        <div className="text-xs text-gray-500 mt-1">{item.date.split('-')[1]}</div>
                      </div>
                    ))}
                    
                    {/* Y-axis */}
                    <div className="absolute left-0 inset-y-0 flex flex-col justify-between">
                      <div className="text-xs text-gray-400">12</div>
                      <div className="text-xs text-gray-400">6</div>
                      <div className="text-xs text-gray-400">0</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content Types Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h2 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Brain size={14} className="text-[#D35F44]" />
                  Content Distribution
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['code', 'decision', 'feature', 'knowledge', 'documentation', 'meeting', 'question'] as ContentType[]).map((type) => (
                    <div 
                      key={type}
                      className="flex items-center rounded-lg border p-2"
                      style={{ borderColor: `${getContentTypeColor(type)}40` }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: getContentTypeColor(type) }}
                      />
                      <div>
                        <div className="text-xs font-medium">{getContentTypeLabel(type)}</div>
                        <div className="text-xs text-gray-500">{analyticsData.byType[type]} entries</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Most Accessed */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h2 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Clock size={14} className="text-[#D35F44]" />
                  Most Accessed
                </h2>
                <div className="space-y-2">
                  {analyticsData.accessStats.recentlyAccessed.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-2">
                      <div className="text-sm">{item.title}</div>
                      <div className="text-xs text-gray-500">{formatDate(item.date)}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Knowledge Gaps */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h2 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <AlertCircle size={14} className="text-[#D35F44]" />
                  Suggested Knowledge Areas
                </h2>
                <div className="space-y-2">
                  {analyticsData.gapAreas.map(area => (
                    <div key={area} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D35F44] mr-2" />
                        <div className="text-sm">{area}</div>
                      </div>
                      <button 
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                        onClick={() => {
                          setUpsertFormData({
                            ...upsertFormData,
                            tags: [...upsertFormData.tags, area]
                          });
                          setIsUpsertModalOpen(true);
                        }}
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="h-full overflow-hidden">
            <div className="h-full overflow-y-auto p-4">
              <h1 className="text-lg font-medium mb-4">Settings</h1>
              
              {/* Automated Knowledge */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h2 className="text-sm font-medium mb-2">AI-Assisted Knowledge Management</h2>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <div className="text-sm">Automated Knowledge Detection</div>
                    <div className="text-xs text-gray-500">AI will suggest relevant information to save</div>
                  </div>
                  <div 
                    className={cn(
                      "w-10 h-6 rounded-full relative cursor-pointer transition-colors",
                      isAutomatedUpsertEnabled ? "bg-green-500" : "bg-gray-300"
                    )}
                    onClick={() => setIsAutomatedUpsertEnabled(!isAutomatedUpsertEnabled)}
                  >
                    <div 
                      className={cn(
                        "absolute w-4 h-4 bg-white rounded-full top-1 transition-transform",
                        isAutomatedUpsertEnabled ? "translate-x-5" : "translate-x-1"
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <div className="text-sm">Knowledge Relationship Detection</div>
                    <div className="text-xs text-gray-500">Automatically link related entries</div>
                  </div>
                  <div 
                    className="w-10 h-6 rounded-full bg-green-500 relative cursor-pointer"
                  >
                    <div className="absolute w-4 h-4 bg-white rounded-full top-1 translate-x-5" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm">Scheduled Knowledge Maintenance</div>
                    <div className="text-xs text-gray-500">Weekly cleanup of outdated entries</div>
                  </div>
                  <div 
                    className="w-10 h-6 rounded-full bg-gray-300 relative cursor-pointer"
                  >
                    <div className="absolute w-4 h-4 bg-white rounded-full top-1 translate-x-1" />
                  </div>
                </div>
              </div>
              
              {/* Default Settings */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h2 className="text-sm font-medium mb-2">Default Settings</h2>
                
                <div className="mb-3">
                  <label className="text-sm text-gray-700 block mb-1">Default Visibility</label>
                  <select 
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                    value={userProfile.preferences.defaultVisibility}
                    onChange={() => {/* Would update user preferences */}}
                  >
                    <option value="private">Private</option>
                    <option value="team">Team</option>
                    <option value="organization">Organization</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="text-sm text-gray-700 block mb-1">Default Content Type</label>
                  <select 
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                    defaultValue="knowledge"
                  >
                    <option value="code">Code</option>
                    <option value="decision">Decision</option>
                    <option value="feature">Feature</option>
                    <option value="knowledge">Knowledge</option>
                    <option value="documentation">Documentation</option>
                    <option value="meeting">Meeting</option>
                    <option value="question">Question</option>
                  </select>
                </div>
              </div>
              
              {/* Team Management */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h2 className="text-sm font-medium mb-2 flex items-center justify-between">
                  <span>Team Access</span>
                  <button className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-700">
                    Manage
                  </button>
                </h2>
                
                <div className="space-y-2 mt-2">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {member.initials}
                        </div>
                        <div>
                          <div className="text-sm">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Export/Import */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h2 className="text-sm font-medium mb-2">Data Management</h2>
                
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-gray-100 text-gray-700 rounded-md py-2 text-sm flex items-center justify-center gap-1">
                    <Download size={14} />
                    Export Knowledge
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 rounded-md py-2 text-sm flex items-center justify-center gap-1">
                    <Upload size={14} />
                    Import
                  </button>
                </div>
                
                <button className="w-full mt-3 border border-red-200 text-red-500 rounded-md py-2 text-sm">
                  Reset Knowledge Base
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Filter Panel - Slide in from right */}
      {isFilterPanelOpen && (
        <div className="fixed right-0 top-0 h-full w-64 bg-white z-50 shadow-lg flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium">Filters</h2>
              <button 
                className="text-gray-500"
                onClick={() => setIsFilterPanelOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {/* Content Type Filter */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Content Type</h3>
              <div className="space-y-1">
                {(['code', 'decision', 'feature', 'knowledge', 'documentation', 'meeting', 'question'] as ContentType[]).map((type) => (
                  <div key={type} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`filter-type-${type}`}
                      checked={activeFilters.types.includes(type)}
                      onChange={() => {
                        setActiveFilters({
                          ...activeFilters,
                          types: activeFilters.types.includes(type)
                            ? activeFilters.types.filter(t => t !== type)
                            : [...activeFilters.types, type]
                        });
                      }}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={`filter-type-${type}`}
                      className="text-sm flex items-center"
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: getContentTypeColor(type) }}
                      />
                      {getContentTypeLabel(type)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Visibility Filter */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Visibility</h3>
              <div className="space-y-1">
                {(['private', 'team', 'organization', 'public'] as VisibilityType[]).map((visibility) => (
                  <div key={visibility} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`filter-visibility-${visibility}`}
                      checked={activeFilters.visibility.includes(visibility)}
                      onChange={() => {
                        setActiveFilters({
                          ...activeFilters,
                          visibility: activeFilters.visibility.includes(visibility)
                            ? activeFilters.visibility.filter(v => v !== visibility)
                            : [...activeFilters.visibility, visibility]
                        });
                      }}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={`filter-visibility-${visibility}`}
                      className="text-sm capitalize flex items-center gap-1"
                    >
                      {getVisibilityIcon(visibility)}
                      {visibility}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Status</h3>
              <div className="space-y-1">
                {(['draft', 'published', 'archived', 'flagged'] as EntryStatus[]).map((status) => (
                  <div key={status} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`filter-status-${status}`}
                      checked={activeFilters.status.includes(status)}
                      onChange={() => {
                        setActiveFilters({
                          ...activeFilters,
                          status: activeFilters.status.includes(status)
                            ? activeFilters.status.filter(s => s !== status)
                            : [...activeFilters.status, status]
                        });
                      }}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={`filter-status-${status}`}
                      className="text-sm capitalize"
                    >
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t">
            <button 
              className="w-full bg-gray-100 text-gray-700 rounded-md py-2 text-sm"
              onClick={() => {
                setActiveFilters({
                  types: [],
                  tags: [],
                  dateRange: { start: null, end: null },
                  visibility: [],
                  status: []
                });
              }}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Entry Detail Modal */}
      {isEntryDetailOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getContentTypeColor(selectedEntry.metadata.type) }}
                />
                <h2 className="text-lg font-medium truncate">{selectedEntry.metadata.title}</h2>
              </div>
              <button 
                className="text-gray-500"
                onClick={() => setIsEntryDetailOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* Content */}
              <div className="mb-4">
                <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-3 rounded-md">
                  {selectedEntry.content}
                </pre>
              </div>
              
              {/* Metadata */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getContentTypeColor(selectedEntry.metadata.type) }}
                      />
                      {getContentTypeLabel(selectedEntry.metadata.type)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span>{formatDate(selectedEntry.metadata.created)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Last accessed:</span>
                    <span>{selectedEntry.metadata.lastAccessed ? formatDate(selectedEntry.metadata.lastAccessed) : 'Never'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Access count:</span>
                    <span>{selectedEntry.metadata.accessCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span 
                      className="text-xs px-1.5 py-0.5 rounded" 
                      style={{ 
                        backgroundColor: `${getStatusColor(selectedEntry.metadata.status)}20`,
                        color: getStatusColor(selectedEntry.metadata.status) 
                      }}
                    >
                      {selectedEntry.metadata.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Visibility:</span>
                    <span className="flex items-center gap-1 capitalize">
                      {getVisibilityIcon(selectedEntry.metadata.visibility)}
                      {selectedEntry.metadata.visibility}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedEntry.metadata.tags.map(tag => (
                    <span key={tag} className="knowledge-tag">{tag}</span>
                  ))}
                </div>
              </div>
              
              {/* Related Entries */}
              {selectedEntry.relatedEntries && selectedEntry.relatedEntries.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Related Entries</h3>
                  <div className="space-y-2">
                    {selectedEntry.relatedEntries.map(entryId => {
                      const relatedEntry = pineconeEntries.find(e => e.id === entryId);
                      return relatedEntry ? (
                        <div 
                          key={entryId} 
                          className="p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                          onClick={() => {
                            setSelectedEntry(relatedEntry);
                          }}
                        >
                          <div className="flex items-center">
                            <div 
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: getContentTypeColor(relatedEntry.metadata.type) }}
                            />
                            <span className="text-sm">{relatedEntry.metadata.title}</span>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-between">
              <button 
                className="px-3 py-1.5 border border-red-200 text-red-500 rounded"
                onClick={() => {
                  handleDeleteEntry(selectedEntry.id);
                  setIsEntryDetailOpen(false);
                }}
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded"
                  onClick={() => setIsEntryDetailOpen(false)}
                >
                  Close
                </button>
                <button 
                  className="px-3 py-1.5 bg-blue-600 text-white rounded flex items-center gap-1"
                  onClick={() => {
                    handleEditEntry(selectedEntry);
                    setIsEntryDetailOpen(false);
                  }}
                >
                  <Edit size={14} />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Upsert Modal */}
      {isUpsertModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-medium">
                {upsertFormData.title ? 'Edit Entry' : 'Create New Entry'}
              </h2>
              <button 
                className="text-gray-500"
                onClick={() => setIsUpsertModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Title</label>
                  <input 
                    type="text"
                    value={upsertFormData.title}
                    onChange={(e) => setUpsertFormData({
                      ...upsertFormData,
                      title: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Entry title"
                  />
                </div>
                
                {/* Content */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Content</label>
                  <textarea 
                    value={upsertFormData.content}
                    onChange={(e) => setUpsertFormData({
                      ...upsertFormData,
                      content: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-32 font-mono"
                    placeholder="Content"
                  />
                </div>
                
                {/* Content Type */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Content Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['code', 'decision', 'feature', 'knowledge'] as ContentType[]).map(type => (
                      <button
                        key={type}
                        type="button"
                        className={cn(
                          "px-3 py-2 border rounded-md flex items-center gap-2",
                          upsertFormData.type === type 
                            ? `bg-${getContentTypeColor(type).replace('#', '')}/10 border-${getContentTypeColor(type).replace('#', '')}/30`
                            : "border-gray-300 text-gray-700"
                        )}
                        style={{
                          backgroundColor: upsertFormData.type === type 
                            ? `${getContentTypeColor(type)}10` 
                            : undefined,
                          borderColor: upsertFormData.type === type 
                            ? `${getContentTypeColor(type)}30` 
                            : undefined
                        }}
                        onClick={() => setUpsertFormData({
                          ...upsertFormData,
                          type
                        })}
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getContentTypeColor(type) }}
                        />
                        <span>{getContentTypeLabel(type)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {(['documentation', 'meeting', 'question'] as ContentType[]).map(type => (
                      <button
                        key={type}
                        type="button"
                        className={cn(
                          "px-3 py-2 border rounded-md flex items-center gap-2",
                          upsertFormData.type === type 
                            ? `bg-${getContentTypeColor(type).replace('#', '')}/10 border-${getContentTypeColor(type).replace('#', '')}/30`
                            : "border-gray-300 text-gray-700"
                        )}
                        style={{
                          backgroundColor: upsertFormData.type === type 
                            ? `${getContentTypeColor(type)}10` 
                            : undefined,
                          borderColor: upsertFormData.type === type 
                            ? `${getContentTypeColor(type)}30` 
                            : undefined
                        }}
                        onClick={() => setUpsertFormData({
                          ...upsertFormData,
                          type
                        })}
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getContentTypeColor(type) }}
                        />
                        <span>{getContentTypeLabel(type)}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {upsertFormData.tags.map(tag => (
                      <div 
                        key={tag} 
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center"
                      >
                        <span>{tag}</span>
                        <button 
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          onClick={() => setUpsertFormData({
                            ...upsertFormData,
                            tags: upsertFormData.tags.filter(t => t !== tag)
                          })}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 p-2 border border-gray-300 rounded-md max-h-[100px] overflow-y-auto">
                    {tagOptions.filter(tag => !upsertFormData.tags.includes(tag)).map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                        onClick={() => setUpsertFormData({
                          ...upsertFormData,
                          tags: [...upsertFormData.tags, tag]
                        })}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Visibility and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Visibility</label>
                    <select
                      value={upsertFormData.visibility}
                      onChange={(e) => setUpsertFormData({
                        ...upsertFormData,
                        visibility: e.target.value as VisibilityType
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="private">Private</option>
                      <option value="team">Team</option>
                      <option value="organization">Organization</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
                    <select
                      value={upsertFormData.status}
                      onChange={(e) => setUpsertFormData({
                        ...upsertFormData,
                        status: e.target.value as EntryStatus
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                      <option value="flagged">Flagged</option>
                    </select>
                  </div>
                </div>
                
                {/* AI Assistance */}
                {upsertFormData.content && (
                  <div className="bg-purple-50 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Brain size={16} className="text-purple-500" />
                        <h3 className="text-sm font-medium text-purple-700">AI Suggestions</h3>
                      </div>
                      <div className="text-xs text-purple-600">Processing...</div>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div>
                        <h4 className="text-xs font-medium text-purple-700">Suggested Tags</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {['performance', 'security'].filter(tag => !upsertFormData.tags.includes(tag)).map(tag => (
                            <button
                              key={`ai-tag-${tag}`}
                              className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                              onClick={() => setUpsertFormData({
                                ...upsertFormData,
                                tags: [...upsertFormData.tags, tag]
                              })}
                            >
                              <Plus size={10} />
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-purple-700">Related Knowledge</h4>
                        <div className="text-xs text-purple-600">
                          Found 2 potentially related entries
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2">
              <button 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded"
                onClick={() => setIsUpsertModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleSaveEntry}
                disabled={!upsertFormData.title || !upsertFormData.content}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PineconeMobileTest1; 