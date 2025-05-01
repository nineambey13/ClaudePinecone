import { useState } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import { PrePromptManager } from '@/components/ui/PrePromptManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Settings = () => {
  const { prePrompts, addPrePrompt, deletePrePrompt, updatePrePrompt } = useChatContext();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [pineconeKey, setPineconeKey] = useState('');
  const [pineconeEnv, setPineconeEnv] = useState('');
  const [pineconeIndex, setPineconeIndex] = useState('');

  const handleSavePrePrompts = (updatedPrompts: typeof prePrompts) => {
    updatedPrompts.forEach(prompt => {
      const existing = prePrompts.find(p => p.id === prompt.id);
      if (existing) {
        updatePrePrompt(prompt.id, { name: prompt.name, content: prompt.content });
      } else {
        addPrePrompt({ name: prompt.name, content: prompt.content });
      }
    });

    prePrompts.forEach(prompt => {
      if (!updatedPrompts.find(p => p.id === prompt.id)) {
        deletePrePrompt(prompt.id);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F3E5]">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            ← Back to chats
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure your API keys for Claude and Pinecone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="claude-key">Claude API Key</Label>
                <div className="relative">
                  <Input
                    id="claude-key"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Claude API key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pinecone-key">Pinecone API Key</Label>
                <Input
                  id="pinecone-key"
                  type="password"
                  value={pineconeKey}
                  onChange={(e) => setPineconeKey(e.target.value)}
                  placeholder="Enter your Pinecone API key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pinecone-env">Pinecone Environment</Label>
                <Input
                  id="pinecone-env"
                  value={pineconeEnv}
                  onChange={(e) => setPineconeEnv(e.target.value)}
                  placeholder="e.g., gcp-starter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pinecone-index">Pinecone Index</Label>
                <Input
                  id="pinecone-index"
                  value={pineconeIndex}
                  onChange={(e) => setPineconeIndex(e.target.value)}
                  placeholder="e.g., chat-embeddings"
                />
              </div>

              <Button className="mt-4">Save API Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pre-prompts</CardTitle>
              <CardDescription>Manage your pre-prompts that can be used to start conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <PrePromptManager
                prePrompts={prePrompts}
                onSave={handleSavePrePrompts}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 