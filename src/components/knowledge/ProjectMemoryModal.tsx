import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Zap, Share2, Clock } from 'lucide-react';
import { ProjectArtifactType, DecisionLog, FeatureSpec } from '@/types/knowledge';
import { cn } from '@/lib/utils';

interface ProjectMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<DecisionLog | FeatureSpec>) => void;
  type: 'decision_log' | 'feature_spec';
  editItem?: (DecisionLog | FeatureSpec) | null;
}

export const ProjectMemoryModal: React.FC<ProjectMemoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  type,
  editItem = null,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Decision log specific fields
  const [impact, setImpact] = useState<'high' | 'medium' | 'low'>('medium');
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [alternativeInput, setAlternativeInput] = useState('');
  const [rationale, setRationale] = useState('');
  const [stakeholders, setStakeholders] = useState<string[]>([]);
  const [stakeholderInput, setStakeholderInput] = useState('');
  
  // Feature spec specific fields
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [status, setStatus] = useState<'planned' | 'in_progress' | 'completed' | 'on_hold'>('planned');
  const [targetVersion, setTargetVersion] = useState('');
  const [complexity, setComplexity] = useState<'simple' | 'moderate' | 'complex'>('moderate');

  // Reset form when modal opens or editItem changes
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setTitle(editItem.title);
        setContent(editItem.content);
        
        if (type === 'decision_log' && 'alternatives' in editItem.metadata) {
          setImpact(editItem.metadata.impact);
          setAlternatives(editItem.metadata.alternatives);
          setRationale(editItem.metadata.rationale);
          setStakeholders(editItem.metadata.stakeholders);
        } else if (type === 'feature_spec' && 'priority' in editItem.metadata) {
          setPriority(editItem.metadata.priority);
          setStatus(editItem.metadata.status);
          setTargetVersion(editItem.metadata.targetVersion);
          setComplexity(editItem.metadata.complexity);
        }
      } else {
        setTitle('');
        setContent('');
        
        if (type === 'decision_log') {
          setImpact('medium');
          setAlternatives([]);
          setAlternativeInput('');
          setRationale('');
          setStakeholders([]);
          setStakeholderInput('');
        } else {
          setPriority('medium');
          setStatus('planned');
          setTargetVersion('');
          setComplexity('moderate');
        }
      }
    }
  }, [isOpen, editItem, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'decision_log') {
      const decision: Partial<DecisionLog> = {
        id: (editItem as DecisionLog)?.id,
        type: 'decision_log',
        title,
        content,
        created: editItem?.created || new Date(),
        lastModified: new Date(),
        status: editItem?.status || 'active',
        metadata: {
          impact,
          alternatives,
          rationale,
          stakeholders
        }
      };
      onSave(decision);
    } else {
      const feature: Partial<FeatureSpec> = {
        id: (editItem as FeatureSpec)?.id,
        type: 'feature_spec',
        title,
        content,
        created: editItem?.created || new Date(),
        lastModified: new Date(),
        status: editItem?.status || 'active',
        metadata: {
          priority,
          status,
          dependencies: (editItem as FeatureSpec)?.metadata.dependencies || [],
          targetVersion,
          complexity
        }
      };
      onSave(feature);
    }
  };

  const handleAddAlternative = () => {
    if (alternativeInput.trim() && !alternatives.includes(alternativeInput.trim())) {
      setAlternatives([...alternatives, alternativeInput.trim()]);
      setAlternativeInput('');
    }
  };

  const handleAlternativeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAlternative();
    }
  };

  const handleAddStakeholder = () => {
    if (stakeholderInput.trim() && !stakeholders.includes(stakeholderInput.trim())) {
      setStakeholders([...stakeholders, stakeholderInput.trim()]);
      setStakeholderInput('');
    }
  };

  const handleStakeholderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddStakeholder();
    }
  };

  const handleRemoveAlternative = (alternative: string) => {
    setAlternatives(alternatives.filter(a => a !== alternative));
  };

  const handleRemoveStakeholder = (stakeholder: string) => {
    setStakeholders(stakeholders.filter(s => s !== stakeholder));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium flex items-center gap-2">
            {type === 'decision_log' ? 
              <><CheckCircle size={18} /> {editItem ? 'Edit Decision' : 'Add Decision'}</> : 
              <><Zap size={18} /> {editItem ? 'Edit Feature' : 'Add Feature'}</>
            }
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder={type === 'decision_log' ? "Decision title" : "Feature title"}
              required
            />
          </div>

          {/* Content/Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'decision_log' ? 'Description' : 'Feature Description'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md h-24 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder={type === 'decision_log' ? "Describe the decision" : "Describe the feature"}
              required
            />
          </div>

          {/* Decision specific fields */}
          {type === 'decision_log' && (
            <>
              {/* Impact */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impact
                </label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((impactLevel) => (
                    <button
                      key={impactLevel}
                      type="button"
                      className={cn(
                        "flex-1 py-2 border rounded-md text-sm capitalize",
                        impact === impactLevel 
                          ? "border-purple-500 bg-purple-50 text-purple-700" 
                          : "border-gray-300 hover:bg-gray-50"
                      )}
                      onClick={() => setImpact(impactLevel as 'high' | 'medium' | 'low')}
                    >
                      {impactLevel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rationale */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rationale
                </label>
                <textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md h-16 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Why was this decision made?"
                />
              </div>

              {/* Alternatives */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternatives Considered
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {alternatives.map(alt => (
                    <div 
                      key={alt} 
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm flex items-center"
                    >
                      {alt}
                      <button 
                        type="button" 
                        className="ml-1 text-gray-500 hover:text-gray-700"
                        onClick={() => handleRemoveAlternative(alt)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={alternativeInput}
                    onChange={(e) => setAlternativeInput(e.target.value)}
                    onKeyDown={handleAlternativeKeyDown}
                    className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Add alternative"
                  />
                  <button
                    type="button"
                    onClick={handleAddAlternative}
                    className="bg-gray-100 px-3 rounded-r-md border border-l-0 border-gray-300"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Stakeholders */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stakeholders
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {stakeholders.map(sh => (
                    <div 
                      key={sh} 
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm flex items-center"
                    >
                      {sh}
                      <button 
                        type="button" 
                        className="ml-1 text-gray-500 hover:text-gray-700"
                        onClick={() => handleRemoveStakeholder(sh)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={stakeholderInput}
                    onChange={(e) => setStakeholderInput(e.target.value)}
                    onKeyDown={handleStakeholderKeyDown}
                    className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Add stakeholder"
                  />
                  <button
                    type="button"
                    onClick={handleAddStakeholder}
                    className="bg-gray-100 px-3 rounded-r-md border border-l-0 border-gray-300"
                  >
                    Add
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Feature specific fields */}
          {type === 'feature_spec' && (
            <>
              {/* Priority */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high', 'critical'].map((priorityLevel) => (
                    <button
                      key={priorityLevel}
                      type="button"
                      className={cn(
                        "flex-1 py-2 border rounded-md text-sm capitalize",
                        priority === priorityLevel 
                          ? "border-green-500 bg-green-50 text-green-700" 
                          : "border-gray-300 hover:bg-gray-50"
                      )}
                      onClick={() => setPriority(priorityLevel as 'critical' | 'high' | 'medium' | 'low')}
                    >
                      {priorityLevel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'planned' | 'in_progress' | 'completed' | 'on_hold')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              {/* Target Version */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Version
                </label>
                <input
                  type="text"
                  value={targetVersion}
                  onChange={(e) => setTargetVersion(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. 1.2.0"
                />
              </div>

              {/* Complexity */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complexity
                </label>
                <div className="flex gap-2">
                  {['simple', 'moderate', 'complex'].map((complexityLevel) => (
                    <button
                      key={complexityLevel}
                      type="button"
                      className={cn(
                        "flex-1 py-2 border rounded-md text-sm capitalize",
                        complexity === complexityLevel 
                          ? "border-blue-500 bg-blue-50 text-blue-700" 
                          : "border-gray-300 hover:bg-gray-50"
                      )}
                      onClick={() => setComplexity(complexityLevel as 'simple' | 'moderate' | 'complex')}
                    >
                      {complexityLevel}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </form>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            className={`px-4 py-2 text-white rounded-md ${type === 'decision_log' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {editItem ? 'Update' : type === 'decision_log' ? 'Add Decision' : 'Add Feature'}
          </button>
        </div>
      </div>
    </div>
  );
}; 