import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

interface PrePrompt {
  id: string;
  name: string;
  content: string;
}

interface PrePromptManagerProps {
  prePrompts: PrePrompt[];
  onSave: (prePrompts: PrePrompt[]) => void;
  enabled: boolean;
}

export const PrePromptManager = ({ prePrompts, onSave, enabled }: PrePromptManagerProps) => {
  const [prompts, setPrompts] = useState<PrePrompt[]>(prePrompts);
  const [isAdding, setIsAdding] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ name: '', content: '' });

  const handleAddPrompt = () => {
    if (!enabled) return;
    if (newPrompt.name.trim() && newPrompt.content.trim()) {
      const prompt: PrePrompt = {
        id: Date.now().toString(),
        name: newPrompt.name.trim(),
        content: newPrompt.content.trim(),
      };
      setPrompts([...prompts, prompt]);
      setNewPrompt({ name: '', content: '' });
      setIsAdding(false);
      onSave([...prompts, prompt]);
    }
  };

  const handleDeletePrompt = (id: string) => {
    if (!enabled) return;
    const updatedPrompts = prompts.filter(p => p.id !== id);
    setPrompts(updatedPrompts);
    onSave(updatedPrompts);
  };

  return (
    <div className={`space-y-4 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pre-prompts</h3>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Pre-prompt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Pre-prompt</DialogTitle>
              <DialogDescription>
                Create a new pre-prompt that will be available for your chats.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  value={newPrompt.name}
                  onChange={(e) => setNewPrompt({ ...newPrompt, name: e.target.value })}
                  placeholder="Enter a name for this pre-prompt"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <Textarea
                  id="content"
                  value={newPrompt.content}
                  onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
                  placeholder="Enter the pre-prompt content"
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPrompt}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="flex items-start justify-between p-4 border rounded-lg"
          >
            <div className="space-y-1">
              <h4 className="font-medium">{prompt.name}</h4>
              <p className="text-sm text-gray-500">{prompt.content}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700"
              onClick={() => handleDeletePrompt(prompt.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {prompts.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No pre-prompts yet. Add your first one!
          </div>
        )}
      </div>
    </div>
  );
}; 