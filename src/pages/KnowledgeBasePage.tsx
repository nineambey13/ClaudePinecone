import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, ChevronDown, X, ArrowLeft, Search, Database,
  MessageCircle, Filter, BarChart2, Settings, Edit, Trash2,
  Download, Upload, Users, Globe, Lock, CheckCircle, Code,
  Clock, BookOpen, Brain, Tag, Bookmark, RefreshCw, Zap, Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { useNavigate } from 'react-router-dom';
import { KnowledgeEntryModal } from '@/components/knowledge/KnowledgeEntryModal';
import { ProjectMemoryModal } from '@/components/knowledge/ProjectMemoryModal';
import { 
  getKnowledgeEntries,
  getDecisionLogs,
  saveDecisionLog,
  deleteDecisionLog,
  getFeatureSpecs,
  saveFeatureSpec,
  deleteFeatureSpec
} from '@/lib/knowledgeStorage';
import { 
  PineconeEntry, 
  ContentType, 
  VisibilityType, 
  EntryStatus, 
  SortOption, 
  ViewMode,
  DecisionLog,
  FeatureSpec
} from '@/types/knowledge';
import { 
  searchKnowledgeBase,
  generateResultsSummary,
  saveKnowledgeEntry,
  deleteKnowledgeEntry
} from '@/lib/enhancedKnowledgeStorage';
import { isPineconeConfigured } from '@/lib/pineconeUtils';
import { isClaudeConfigured, isEmbeddingConfigured } from '@/lib/claudeApi';

// Advanced styles for the app
const knowledgeBaseStyles = `
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

const KnowledgeBasePage: React.FC = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // UI state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState('browse');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // Pinecone state
  const [pineconeEntries, setPineconeEntries] = useState<PineconeEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<PineconeEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<PineconeEntry | null>(null);
  const [isEntryDetailOpen, setIsEntryDetailOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  // Project memory related states
  const [projectTab, setProjectTab] = useState<'all' | 'decisions' | 'features' | 'architecture' | 'timeline'>('all');
  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
  const [featureSpecs, setFeatureSpecs] = useState<FeatureSpec[]>([]);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<DecisionLog | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureSpec | null>(null);

  // API status
  const [pineconeStatus, setPineconeStatus] = useState<'configured' | 'not_configured' | 'checking'>('checking');
  const [claudeStatus, setClaudeStatus] = useState<'configured' | 'not_configured' | 'checking'>('checking');
  const [embeddingStatus, setEmbeddingStatus] = useState<'configured' | 'not_configured' | 'checking'>('checking');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSummary, setSearchSummary] = useState<string | null>(null);

  // Load data from storage
  useEffect(() => {
    const entries = getKnowledgeEntries();
    setPineconeEntries(entries);
    setFilteredEntries(sortEntries(entries, sortOption));
    
    const decisions = getDecisionLogs();
    setDecisionLogs(decisions);
    
    const features = getFeatureSpecs();
    setFeatureSpecs(features);
  }, []);

  // Check for mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Check API configurations
  useEffect(() => {
    const checkServices = async () => {
      setPineconeStatus(isPineconeConfigured() ? 'configured' : 'not_configured');
      setClaudeStatus(isClaudeConfigured() ? 'configured' : 'not_configured');
      setEmbeddingStatus(isEmbeddingConfigured() ? 'configured' : 'not_configured');
    };
    
    checkServices();
  }, []);

  // Helper functions
  const sortEntries = (entries: PineconeEntry[], option: SortOption): PineconeEntry[] => {
    switch (option) {
      case 'newest':
        return [...entries].sort((a, b) => 
          new Date(b.metadata.created).getTime() - new Date(a.metadata.created).getTime()
        );
      case 'oldest':
        return [...entries].sort((a, b) => 
          new Date(a.metadata.created).getTime() - new Date(b.metadata.created).getTime()
        );
      case 'most_accessed':
        return [...entries].sort((a, b) => 
          (b.metadata.accessCount || 0) - (a.metadata.accessCount || 0)
        );
      case 'recently_accessed':
        return [...entries].sort((a, b) => {
          const dateA = a.metadata.lastAccessed ? new Date(a.metadata.lastAccessed) : new Date(a.metadata.created);
          const dateB = b.metadata.lastAccessed ? new Date(b.metadata.lastAccessed) : new Date(b.metadata.created);
          return dateB.getTime() - dateA.getTime();
        });
      case 'relevance':
      default:
        return entries; // In a real app, this would use vector similarity
    }
  };

  const getContentTypeColor = (type: ContentType): string => {
    switch (type) {
      case 'code':
        return 'bg-blue-400';
      case 'decision':
        return 'bg-purple-400';
      case 'feature':
        return 'bg-green-400';
      case 'knowledge':
        return 'bg-amber-400';
      case 'documentation':
        return 'bg-teal-400';
      case 'meeting':
        return 'bg-indigo-400';
      case 'question':
        return 'bg-rose-400';
      default:
        return 'bg-gray-400';
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
        return <Search size={16} />;
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
      case 'draft':
        return 'bg-gray-200 text-gray-700';
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'archived':
        return 'bg-blue-100 text-blue-700';
      case 'flagged':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getVisibilityIcon = (visibility: VisibilityType) => {
    switch (visibility) {
      case 'private':
        return <Lock size={14} />;
      case 'team':
        return <Users size={14} />;
      case 'organization':
        return <Globe size={14} />;
      case 'public':
        return <Globe size={14} />;
      default:
        return <Lock size={14} />;
    }
  };

  const formatDate = (date: Date | string): string => {
    const parsedDate = date instanceof Date ? date : new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - parsedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'Today';
    if (diffDays <= 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Event handlers for knowledge base interactions
  const handleBackToChat = () => {
    navigate('/chat');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    setIsSearching(true);
    setSearchSummary(null);
    
    try {
      // Use vector search if both Pinecone and Embedding API are configured
      const useVectorSearch = pineconeStatus === 'configured' && embeddingStatus === 'configured';
      const results = await searchKnowledgeBase(searchQuery, useVectorSearch);
      
      setFilteredEntries(sortEntries(results, sortOption));
      
      // Generate summary if Claude is configured
      if (claudeStatus === 'configured' && results.length > 0) {
        try {
          const summary = await generateResultsSummary(searchQuery, results);
          setSearchSummary(summary);
        } catch (summaryError) {
          console.error('Error generating summary:', summaryError);
        }
      }
    } catch (error) {
      console.error('Error searching knowledge base:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleEntryClick = (entry: PineconeEntry) => {
    // Update access count and last accessed date
    const updatedEntry = {
      ...entry,
      metadata: {
        ...entry.metadata,
        accessCount: (entry.metadata.accessCount || 0) + 1,
        lastAccessed: new Date()
      }
    };
    
    // Save to storage
    saveKnowledgeEntry(updatedEntry);
    
    // Update state
    setPineconeEntries(prev => 
      prev.map(e => e.id === entry.id ? updatedEntry : e)
    );
    setFilteredEntries(prev => 
      prev.map(e => e.id === entry.id ? updatedEntry : e)
    );
    
    // Set as selected entry and open modal for editing
    setSelectedEntry(updatedEntry);
    setIsEntryModalOpen(true);
  };

  const handleCreateNewEntry = () => {
    setSelectedEntry(null);
    setIsEntryModalOpen(true);
  };

  const handleSaveEntry = async (entry: Partial<PineconeEntry>) => {
    try {
      const savedEntry = await saveKnowledgeEntry(entry);
      
      // Update state
      if (entry.id) {
        // Update existing entry
        setPineconeEntries(prev => 
          prev.map(e => e.id === entry.id ? savedEntry : e)
        );
        setFilteredEntries(prev => 
          prev.map(e => e.id === entry.id ? savedEntry : e)
        );
      } else {
        // Add new entry
        setPineconeEntries(prev => [savedEntry, ...prev]);
        setFilteredEntries(prev => sortEntries([savedEntry, ...prev], sortOption));
      }
      
      // Close modal
      setIsEntryModalOpen(false);
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteKnowledgeEntry(entryId);
      
      // Update state
      setPineconeEntries(prev => prev.filter(e => e.id !== entryId));
      setFilteredEntries(prev => prev.filter(e => e.id !== entryId));
      
      setIsEntryModalOpen(false);
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  // Project memory handlers
  const handleAddDecisionLog = () => {
    setSelectedDecision(null);
    setIsDecisionModalOpen(true);
  };

  const handleSaveDecision = (decision: Partial<DecisionLog>) => {
    const savedDecision = saveDecisionLog(decision);
    
    // Update state
    if (decision.id) {
      // Update existing decision
      setDecisionLogs(prev => 
        prev.map(d => d.id === decision.id ? savedDecision : d)
      );
    } else {
      // Add new decision
      setDecisionLogs(prev => [savedDecision, ...prev]);
    }
    
    // Close modal
    setIsDecisionModalOpen(false);
  };

  const handleDecisionClick = (decision: DecisionLog) => {
    setSelectedDecision(decision);
    setIsDecisionModalOpen(true);
  };

  const handleDeleteDecision = (decisionId: string) => {
    // Delete from storage
    deleteDecisionLog(decisionId);
    
    // Update state
    setDecisionLogs(prev => prev.filter(d => d.id !== decisionId));
    
    setIsDecisionModalOpen(false);
  };

  const handleAddFeatureSpec = () => {
    setSelectedFeature(null);
    setIsFeatureModalOpen(true);
  };

  const handleSaveFeature = (feature: Partial<FeatureSpec>) => {
    const savedFeature = saveFeatureSpec(feature);
    
    // Update state
    if (feature.id) {
      // Update existing feature
      setFeatureSpecs(prev => 
        prev.map(f => f.id === feature.id ? savedFeature : f)
      );
    } else {
      // Add new feature
      setFeatureSpecs(prev => [savedFeature, ...prev]);
    }
    
    // Close modal
    setIsFeatureModalOpen(false);
  };

  const handleFeatureClick = (feature: FeatureSpec) => {
    setSelectedFeature(feature);
    setIsFeatureModalOpen(true);
  };

  const handleDeleteFeature = (featureId: string) => {
    // Delete from storage
    deleteFeatureSpec(featureId);
    
    // Update state
    setFeatureSpecs(prev => prev.filter(f => f.id !== featureId));
    
    setIsFeatureModalOpen(false);
  };

  const handleChangeSortOption = (option: SortOption) => {
    setSortOption(option);
    setFilteredEntries(sortEntries(filteredEntries, option));
  };

  return (
    <div 
      className="h-full w-full relative overflow-hidden"
      style={{ backgroundColor: '#FEF8EC' }}
    >
      {/* Add a style tag for custom styles */}
      <style>{knowledgeBaseStyles}</style>
      
      {/* Header Bar */}
      <div className="flex items-center h-14 px-4 border-b border-gray-200 bg-[#FEF8EC] shadow-sm">
        {isMobile && (
          <button 
            className="mr-2 p-1"
            onClick={handleBackToChat}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-xl font-['Lora'] font-medium text-gray-800">Knowledge Base</h1>
        
        <div className="ml-auto flex items-center gap-2">
          {/* Sort Options */}
          <Select 
            value={sortOption} 
            onValueChange={(value) => handleChangeSortOption(value as SortOption)}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most_accessed">Most Accessed</SelectItem>
              <SelectItem value="recently_accessed">Recently Accessed</SelectItem>
            </SelectContent>
          </Select>
          
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
                <path d="M3 3H10V10H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 3H21V10H14V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 14H10V21H3V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 14H21V21H14V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          {/* Filter Button */}
          <button 
            className={cn(
              "p-1.5 rounded-md", 
              isFilterPanelOpen ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
            )}
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          >
            <Filter size={16} />
          </button>
        </div>
      </div>
      
      {/* Main Content - Tabs */}
      <div className="h-[calc(100%-3.5rem)] w-full overflow-hidden">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full h-full"
        >
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="project">Project Memory</TabsTrigger>
            <TabsTrigger value="chat-history">Chat History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Browse Tab - Knowledge Base Content */}
          <TabsContent value="browse" className="h-full overflow-hidden">
            <div className="h-full flex flex-col overflow-hidden px-4">
              {/* Search Bar */}
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
                
                {/* Search Summary */}
                {searchSummary && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm text-blue-700">
                    {searchSummary}
                  </div>
                )}
                
                {/* Search Status */}
                {isSearching && (
                  <div className="mt-2 text-center">
                    <RefreshCw size={16} className="animate-spin inline mr-2" />
                    <span className="text-sm text-gray-500">Searching...</span>
                  </div>
                )}
              </div>
              
              {/* Knowledge Entries */}
              <div className="overflow-y-auto flex-1 pb-4">
                {/* Render entries based on viewMode */}
                <div className={cn(
                  viewMode === 'list' ? 'list-view' : 'grid-view',
                )}>
                  {filteredEntries.map(entry => (
                    <div 
                      key={entry.id}
                      className="knowledge-card p-3 cursor-pointer"
                      onClick={() => handleEntryClick(entry)}
                    >
                      <div className="flex">
                        <div className={cn(
                          "type-indicator mr-2",
                          getContentTypeColor(entry.metadata.type)
                        )} />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium truncate-1-line">
                              {entry.metadata.title}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap ml-2">
                              <span>{formatDate(entry.metadata.created)}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 truncate-2-lines">
                            {entry.content}
                          </p>
                          
                          <div className="flex flex-wrap mt-2 gap-1">
                            {entry.metadata.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="knowledge-tag">
                                {tag}
                              </span>
                            ))}
                            {entry.metadata.tags.length > 3 && (
                              <span className="knowledge-tag">
                                +{entry.metadata.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredEntries.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <Database size={32} className="mx-auto opacity-30 mb-2" />
                    <p>No entries found. Click the + button to add your first entry.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Project Memory Tab - New Feature */}
          <TabsContent value="project" className="h-full overflow-hidden">
            <div className="h-full flex flex-col overflow-hidden px-4">
              {/* Project Memory Tabs */}
              <div className="flex border-b border-gray-200 mt-2">
                <button 
                  className={cn(
                    "px-3 py-2 text-sm font-medium",
                    projectTab === 'all' ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"
                  )}
                  onClick={() => setProjectTab('all')}
                >
                  All
                </button>
                <button 
                  className={cn(
                    "px-3 py-2 text-sm font-medium",
                    projectTab === 'decisions' ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"
                  )}
                  onClick={() => setProjectTab('decisions')}
                >
                  Decisions
                </button>
                <button 
                  className={cn(
                    "px-3 py-2 text-sm font-medium",
                    projectTab === 'features' ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"
                  )}
                  onClick={() => setProjectTab('features')}
                >
                  Features
                </button>
              </div>
              
              {/* Project Memory Content */}
              <div className="overflow-y-auto flex-1 pt-4 pb-4">
                {/* Decision Logs */}
                {(projectTab === 'all' || projectTab === 'decisions') && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">Decision Log</h3>
                      <button 
                        className="text-blue-600 text-sm flex items-center"
                        onClick={handleAddDecisionLog}
                      >
                        <Plus size={16} className="mr-1" />
                        Add Decision
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {decisionLogs.map(decision => (
                        <div 
                          key={decision.id}
                          className="knowledge-card p-3 cursor-pointer"
                          onClick={() => handleDecisionClick(decision)}
                        >
                          <div className="flex">
                            <div className="flex items-center justify-center p-2 bg-purple-100 rounded-md text-purple-600 mr-3">
                              <CheckCircle size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium">
                                  {decision.title}
                                </h4>
                                <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap ml-2">
                                  <span>{formatDate(decision.created)}</span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mt-1 truncate-2-lines">
                                {decision.content}
                              </p>
                              
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                  {decision.metadata.impact} impact
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {decisionLogs.length === 0 && (
                        <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
                          <p>No decision logs recorded yet. Click "Add Decision" to create one.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Feature Specs */}
                {(projectTab === 'all' || projectTab === 'features') && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">Feature Specifications</h3>
                      <button 
                        className="text-blue-600 text-sm flex items-center"
                        onClick={handleAddFeatureSpec}
                      >
                        <Plus size={16} className="mr-1" />
                        Add Feature
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {featureSpecs.map(feature => (
                        <div 
                          key={feature.id}
                          className="knowledge-card p-3 cursor-pointer"
                          onClick={() => handleFeatureClick(feature)}
                        >
                          <div className="flex">
                            <div className="flex items-center justify-center p-2 bg-green-100 rounded-md text-green-600 mr-3">
                              <Zap size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium">
                                  {feature.title}
                                </h4>
                                <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap ml-2">
                                  <span>{feature.metadata.status.replace('_', ' ')}</span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mt-1 truncate-2-lines">
                                {feature.content}
                              </p>
                              
                              <div className="flex items-center mt-2 text-xs space-x-2">
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  {feature.metadata.priority} priority
                                </span>
                                <span className="text-gray-500">
                                  Target: v{feature.metadata.targetVersion}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {featureSpecs.length === 0 && (
                        <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
                          <p>No feature specifications recorded yet. Click "Add Feature" to create one.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Chat History Tab - New Feature */}
          <TabsContent value="chat-history" className="h-full overflow-hidden">
            <div className="h-full flex justify-center items-center px-4">
              <div className="text-center max-w-md">
                <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Chat History Coming Soon</h3>
                <p className="text-gray-500">
                  This feature will allow you to browse past conversations semantically 
                  and extract valuable information to your knowledge base.
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Analytics Tab - Placeholder */}
          <TabsContent value="analytics" className="h-full overflow-hidden">
            <div className="h-full flex justify-center items-center px-4">
              <div className="text-center max-w-md">
                <BarChart2 size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-500">
                  Analytics will help you track usage patterns, knowledge growth, 
                  and discover insights about your knowledge base.
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Settings Tab - Placeholder */}
          <TabsContent value="settings" className="h-full overflow-hidden px-4 py-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-medium mb-6">Knowledge Base Settings</h2>
              
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2">API Configuration Status</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Claude API</p>
                        <p className="text-sm text-gray-500">For AI summaries and tag extraction</p>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        claudeStatus === 'configured' ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      )}>
                        {claudeStatus === 'configured' ? 'Configured' : 'Not Configured'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Embedding API (OpenAI)</p>
                        <p className="text-sm text-gray-500">For vector embeddings</p>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        embeddingStatus === 'configured' ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      )}>
                        {embeddingStatus === 'configured' ? 'Configured' : 'Not Configured'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pinecone</p>
                        <p className="text-sm text-gray-500">For vector storage and search</p>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        pineconeStatus === 'configured' ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      )}>
                        {pineconeStatus === 'configured' ? 'Configured' : 'Not Configured'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm bg-blue-50 p-3 rounded">
                    <p>To configure API access, add your API keys to the <code>.env</code> file. See <code>KNOWLEDGE_BASE_SETUP.md</code> for detailed instructions.</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating Action Button - Add new entry */}
      <div className="absolute right-4 bottom-4">
        <button
          onClick={handleCreateNewEntry}
          className="bg-[#D35F44] h-12 w-12 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#c35540] active:bg-[#b24d39] transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Modals */}
      <KnowledgeEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={handleSaveEntry}
        editEntry={selectedEntry}
      />

      <ProjectMemoryModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        onSave={handleSaveDecision}
        type="decision_log"
        editItem={selectedDecision}
      />

      <ProjectMemoryModal
        isOpen={isFeatureModalOpen}
        onClose={() => setIsFeatureModalOpen(false)}
        onSave={handleSaveFeature}
        type="feature_spec"
        editItem={selectedFeature}
      />
    </div>
  );
};

export default KnowledgeBasePage; 