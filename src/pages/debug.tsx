import React, { useState, useEffect } from 'react';
import { chatService } from '@/services/chatService';

const Debug = () => {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get all environment variables that start with VITE_
        const vars: Record<string, string> = {};
        Object.keys(import.meta.env).forEach(key => {
          if (key.startsWith('VITE_')) {
            // Mask sensitive values
            if (key.includes('KEY') || key.includes('TOKEN') || key.includes('SECRET')) {
              vars[key] = import.meta.env[key].substring(0, 5) + '...' + import.meta.env[key].substring(import.meta.env[key].length - 5);
            } else {
              vars[key] = import.meta.env[key];
            }
          }
        });
        setEnvVars(vars);

        // Load chat messages
        const messages = await chatService.getAllMessages();
        setChatMessages(messages);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
        <div className="animate-pulse bg-gray-200 h-40 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 mb-6 rounded-md">
          <h2 className="text-red-600 font-semibold mb-2">Error</h2>
          <pre className="whitespace-pre-wrap bg-white p-2 rounded border text-sm">{error}</pre>
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <div className="bg-gray-50 p-4 rounded-md border">
          {Object.keys(envVars).length > 0 ? (
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(envVars, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500 italic">No environment variables found</p>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Chat Messages ({chatMessages.length})</h2>
        <div className="bg-gray-50 p-4 rounded-md border max-h-96 overflow-y-auto">
          {chatMessages.length > 0 ? (
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(chatMessages, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500 italic">No messages found</p>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Browser Information</h2>
        <div className="bg-gray-50 p-4 rounded-md border">
          <p><strong>User Agent:</strong> {navigator.userAgent}</p>
          <p><strong>Window Width:</strong> {window.innerWidth}px</p>
          <p><strong>Window Height:</strong> {window.innerHeight}px</p>
          <p><strong>Is Mobile (detected):</strong> {window.innerWidth <= 768 ? 'Yes' : 'No'}</p>
        </div>
      </section>

      <button 
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        onClick={() => window.location.href = '/'}
      >
        Back to Home
      </button>
    </div>
  );
};

export default Debug; 