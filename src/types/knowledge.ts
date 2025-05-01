// Knowledge Base Types
export type ContentType = 'code' | 'decision' | 'feature' | 'knowledge' | 'documentation' | 'meeting' | 'question';
export type VisibilityType = 'private' | 'team' | 'organization' | 'public';
export type EntryStatus = 'draft' | 'published' | 'archived' | 'flagged';
export type SortOption = 'relevance' | 'newest' | 'oldest' | 'most_accessed' | 'recently_accessed';
export type ViewMode = 'list' | 'grid' | 'compact' | 'graph';

// Enhanced types for project memory features
export type ProjectArtifactType = 'decision_log' | 'feature_spec' | 'architecture_schema' | 'timeline';
export type ChatHistoryStatus = 'referenced' | 'linked' | 'queued' | 'processed';

// Pinecone Entry interface
export interface PineconeEntry {
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
    confidence?: number; 
  };
  embedding?: number[];
  relatedEntries?: string[];
}

// Project memory related interfaces
export interface ProjectArtifact {
  id: string;
  type: ProjectArtifactType;
  title: string;
  content: string;
  created: Date;
  lastModified: Date;
  status: 'active' | 'archived';
  relatedEntries?: string[];
  metadata: Record<string, any>;
}

export interface DecisionLog extends ProjectArtifact {
  type: 'decision_log';
  metadata: {
    impact: 'high' | 'medium' | 'low';
    alternatives: string[];
    rationale: string;
    stakeholders: string[];
  };
}

export interface FeatureSpec extends ProjectArtifact {
  type: 'feature_spec';
  metadata: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
    dependencies: string[];
    targetVersion: string;
    complexity: 'simple' | 'moderate' | 'complex';
  };
}

export interface ArchitectureSchema extends ProjectArtifact {
  type: 'architecture_schema';
  metadata: {
    components: string[];
    diagramUrl?: string;
    version: string;
    dataFlow?: Record<string, any>[];
  };
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: Date;
  description: string;
  type: 'milestone' | 'release' | 'decision' | 'feature';
  relatedArtifactIds: string[];
}

// Chat continuity engine interfaces
export interface ChatContext {
  id: string;
  topic: string;
  lastActive: Date;
  messageCount: number;
  relatedEntries: string[];
  summary: string;
  status: ChatHistoryStatus;
  embedding?: number[];
} 