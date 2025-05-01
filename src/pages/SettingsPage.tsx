import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2, Download, Trash2 } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { PrePromptManager } from '@/components/ui/PrePromptManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const SettingsPage = () => {
  const { prePrompts, addPrePrompt, deletePrePrompt, updatePrePrompt, prePromptsEnabled, togglePrePrompts } = useChatContext();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // API Settings
  const [apiKey, setApiKey] = useState('');
  const [pineconeKey, setPineconeKey] = useState('');
  const [pineconeEnv, setPineconeEnv] = useState('');
  const [pineconeIndex, setPineconeIndex] = useState('');

  // Message Settings
  const [autoDeleteMessages, setAutoDeleteMessages] = useState(false);
  const [messageRetentionDays, setMessageRetentionDays] = useState(30);
  const [downloadFormat, setDownloadFormat] = useState('json');

  useEffect(() => {
    // Load existing values
    const savedApiKey = localStorage.getItem('claude_api_key') || '';
    const savedPineconeKey = localStorage.getItem('pinecone_api_key') || '';
    const savedPineconeEnv = localStorage.getItem('pinecone_environment') || '';
    const savedPineconeIndex = localStorage.getItem('pinecone_index') || '';
    const savedAutoDelete = localStorage.getItem('auto_delete_messages') === 'true';
    const savedRetentionDays = parseInt(localStorage.getItem('message_retention_days') || '30');
    const savedFormat = localStorage.getItem('download_format') || 'json';

    setApiKey(savedApiKey);
    setPineconeKey(savedPineconeKey);
    setPineconeEnv(savedPineconeEnv);
    setPineconeIndex(savedPineconeIndex);
    setAutoDeleteMessages(savedAutoDelete);
    setMessageRetentionDays(savedRetentionDays);
    setDownloadFormat(savedFormat);
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save API settings
      localStorage.setItem('claude_api_key', apiKey);
      localStorage.setItem('pinecone_api_key', pineconeKey);
      localStorage.setItem('pinecone_environment', pineconeEnv);
      localStorage.setItem('pinecone_index', pineconeIndex);
      
      // Save message settings
      localStorage.setItem('auto_delete_messages', autoDeleteMessages.toString());
      localStorage.setItem('message_retention_days', messageRetentionDays.toString());
      localStorage.setItem('download_format', downloadFormat);

      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
    <div className="h-screen overflow-auto bg-[#F9F3E5]">
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>
        
        <div className="max-w-2xl mx-auto w-full space-y-6 pb-8">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Management</CardTitle>
              <CardDescription>Configure how your chat messages are handled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-delete">Auto-delete old messages</Label>
                <Switch
                  id="auto-delete"
                  checked={autoDeleteMessages}
                  onCheckedChange={setAutoDeleteMessages}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention-days">Message Retention (days)</Label>
                <Input
                  id="retention-days"
                  type="number"
                  min={1}
                  max={365}
                  value={messageRetentionDays}
                  onChange={(e) => setMessageRetentionDays(parseInt(e.target.value))}
                  disabled={!autoDeleteMessages}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="download-format">Download Format</Label>
                <select
                  id="download-format"
                  className="w-full p-2 border rounded-md"
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                >
                  <option value="json">JSON</option>
                  <option value="txt">Plain Text</option>
                  <option value="md">Markdown</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export All Messages
                </Button>
                <Button className="flex items-center gap-2" variant="destructive">
                  <Trash2 className="w-4 h-4" />
                  Clear All Messages
                </Button>
            </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pre-prompts</CardTitle>
              <CardDescription>Manage your pre-prompts that can be used to start conversations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="pre-prompts-toggle">Enable Pre-prompts</Label>
                <Switch
                  id="pre-prompts-toggle"
                  checked={prePromptsEnabled}
                  onCheckedChange={togglePrePrompts}
                />
          </div>
              <PrePromptManager
                prePrompts={prePrompts}
                onSave={handleSavePrePrompts}
                enabled={prePromptsEnabled}
              />
            </CardContent>
          </Card>

          <Button 
            className="w-full" 
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Settings...
              </>
            ) : (
              'Save All Settings'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
