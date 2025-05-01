import { PineconeEntry, DecisionLog, FeatureSpec, ArchitectureSchema, TimelineEvent, ChatContext } from "@/types/knowledge";
import { v4 as uuidv4 } from "uuid";

// Storage keys
const KNOWLEDGE_ENTRIES_KEY = 'clarity_knowledge_entries';
const DECISION_LOGS_KEY = 'clarity_decision_logs';
const FEATURE_SPECS_KEY = 'clarity_feature_specs';
const ARCHITECTURE_SCHEMAS_KEY = 'clarity_architecture_schemas';
const TIMELINE_EVENTS_KEY = 'clarity_timeline_events';
const CHAT_CONTEXTS_KEY = 'clarity_chat_contexts';

// Helper to serialize and deserialize dates in JSON
const replacer = (_key: string, value: any) => {
  if (value instanceof Date) {
    return { __type: 'Date', value: value.toISOString() };
  }
  return value;
};

const reviver = (_key: string, value: any) => {
  if (typeof value === 'object' && value !== null && value.__type === 'Date') {
    return new Date(value.value);
  }
  return value;
};

// Knowledge Entries
export const getKnowledgeEntries = (): PineconeEntry[] => {
  const data = localStorage.getItem(KNOWLEDGE_ENTRIES_KEY);
  if (!data) return [];
  return JSON.parse(data, reviver);
};

export const saveKnowledgeEntry = (entry: Partial<PineconeEntry>): PineconeEntry => {
  const entries = getKnowledgeEntries();
  
  // For new entries, generate an ID
  if (!entry.id) {
    const newEntry: PineconeEntry = {
      id: uuidv4(),
      content: entry.content || '',
      metadata: {
        type: entry.metadata?.type || 'knowledge',
        tags: entry.metadata?.tags || [],
        created: entry.metadata?.created || new Date(),
        title: entry.metadata?.title || 'Untitled',
        visibility: entry.metadata?.visibility || 'private',
        status: entry.metadata?.status || 'published',
        accessCount: entry.metadata?.accessCount || 0,
        version: entry.metadata?.version || 1,
      },
      relatedEntries: entry.relatedEntries || [],
    };
    entries.unshift(newEntry);
    localStorage.setItem(KNOWLEDGE_ENTRIES_KEY, JSON.stringify(entries, replacer));
    return newEntry;
  } 
  // For existing entries, update
  else {
    const index = entries.findIndex(e => e.id === entry.id);
    if (index !== -1) {
      const updatedEntry = {
        ...entries[index],
        content: entry.content || entries[index].content,
        metadata: {
          ...entries[index].metadata,
          ...entry.metadata,
          lastAccessed: entry.metadata?.lastAccessed || entries[index].metadata.lastAccessed,
          accessCount: entry.metadata?.accessCount !== undefined 
            ? entry.metadata.accessCount 
            : entries[index].metadata.accessCount,
        },
        relatedEntries: entry.relatedEntries || entries[index].relatedEntries,
      };
      entries[index] = updatedEntry;
      localStorage.setItem(KNOWLEDGE_ENTRIES_KEY, JSON.stringify(entries, replacer));
      return updatedEntry;
    }
    throw new Error('Entry not found');
  }
};

export const deleteKnowledgeEntry = (id: string): void => {
  const entries = getKnowledgeEntries();
  const filtered = entries.filter(e => e.id !== id);
  localStorage.setItem(KNOWLEDGE_ENTRIES_KEY, JSON.stringify(filtered, replacer));
};

// Decision Logs
export const getDecisionLogs = (): DecisionLog[] => {
  const data = localStorage.getItem(DECISION_LOGS_KEY);
  if (!data) return [];
  return JSON.parse(data, reviver);
};

export const saveDecisionLog = (decision: Partial<DecisionLog>): DecisionLog => {
  const decisions = getDecisionLogs();
  
  // For new decisions, generate an ID
  if (!decision.id) {
    const newDecision: DecisionLog = {
      id: uuidv4(),
      type: 'decision_log',
      title: decision.title || 'Untitled Decision',
      content: decision.content || '',
      created: decision.created || new Date(),
      lastModified: new Date(),
      status: decision.status || 'active',
      relatedEntries: decision.relatedEntries || [],
      metadata: {
        impact: decision.metadata?.impact || 'medium',
        alternatives: decision.metadata?.alternatives || [],
        rationale: decision.metadata?.rationale || '',
        stakeholders: decision.metadata?.stakeholders || [],
      }
    };
    decisions.unshift(newDecision);
    localStorage.setItem(DECISION_LOGS_KEY, JSON.stringify(decisions, replacer));
    return newDecision;
  } 
  // For existing decisions, update
  else {
    const index = decisions.findIndex(d => d.id === decision.id);
    if (index !== -1) {
      const updatedDecision = {
        ...decisions[index],
        title: decision.title || decisions[index].title,
        content: decision.content || decisions[index].content,
        lastModified: new Date(),
        status: decision.status || decisions[index].status,
        relatedEntries: decision.relatedEntries || decisions[index].relatedEntries,
        metadata: {
          ...decisions[index].metadata,
          ...decision.metadata,
        }
      };
      decisions[index] = updatedDecision;
      localStorage.setItem(DECISION_LOGS_KEY, JSON.stringify(decisions, replacer));
      return updatedDecision;
    }
    throw new Error('Decision not found');
  }
};

export const deleteDecisionLog = (id: string): void => {
  const decisions = getDecisionLogs();
  const filtered = decisions.filter(d => d.id !== id);
  localStorage.setItem(DECISION_LOGS_KEY, JSON.stringify(filtered, replacer));
};

// Feature Specs
export const getFeatureSpecs = (): FeatureSpec[] => {
  const data = localStorage.getItem(FEATURE_SPECS_KEY);
  if (!data) return [];
  return JSON.parse(data, reviver);
};

export const saveFeatureSpec = (feature: Partial<FeatureSpec>): FeatureSpec => {
  const features = getFeatureSpecs();
  
  // For new features, generate an ID
  if (!feature.id) {
    const newFeature: FeatureSpec = {
      id: uuidv4(),
      type: 'feature_spec',
      title: feature.title || 'Untitled Feature',
      content: feature.content || '',
      created: feature.created || new Date(),
      lastModified: new Date(),
      status: feature.status || 'active',
      relatedEntries: feature.relatedEntries || [],
      metadata: {
        priority: feature.metadata?.priority || 'medium',
        status: feature.metadata?.status || 'planned',
        dependencies: feature.metadata?.dependencies || [],
        targetVersion: feature.metadata?.targetVersion || '',
        complexity: feature.metadata?.complexity || 'moderate',
      }
    };
    features.unshift(newFeature);
    localStorage.setItem(FEATURE_SPECS_KEY, JSON.stringify(features, replacer));
    return newFeature;
  } 
  // For existing features, update
  else {
    const index = features.findIndex(f => f.id === feature.id);
    if (index !== -1) {
      const updatedFeature = {
        ...features[index],
        title: feature.title || features[index].title,
        content: feature.content || features[index].content,
        lastModified: new Date(),
        status: feature.status || features[index].status,
        relatedEntries: feature.relatedEntries || features[index].relatedEntries,
        metadata: {
          ...features[index].metadata,
          ...feature.metadata,
        }
      };
      features[index] = updatedFeature;
      localStorage.setItem(FEATURE_SPECS_KEY, JSON.stringify(features, replacer));
      return updatedFeature;
    }
    throw new Error('Feature not found');
  }
};

export const deleteFeatureSpec = (id: string): void => {
  const features = getFeatureSpecs();
  const filtered = features.filter(f => f.id !== id);
  localStorage.setItem(FEATURE_SPECS_KEY, JSON.stringify(filtered, replacer));
}; 