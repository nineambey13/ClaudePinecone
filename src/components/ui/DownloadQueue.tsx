import React from 'react';
import { Download, Trash2, CheckCircle } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';
import { useChatContext } from '@/contexts/ChatContext';

export type QueuedMessage = {
  id: string;
  title: string;
  timestamp: Date;
  downloaded: boolean;
};

export const DownloadQueue = () => {
  const { downloadQueue, clearDownloadQueue, downloadMessage, downloadAllAsPdf } = useChatContext();

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Download Queue</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{downloadQueue.length} Saved Messages</span>
            {downloadQueue.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearDownloadQueue}>
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {downloadQueue.map((item) => (
          <Card key={item.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    Updated {item.timestamp.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => downloadMessage(item.id)}
                className="text-blue-600"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {downloadQueue.length > 0 && (
        <div className="p-4 border-t">
          <Button className="w-full" onClick={downloadAllAsPdf}>
            <Download className="w-4 h-4 mr-2" />
            Download All as PDF
          </Button>
        </div>
      )}
    </div>
  );
}; 