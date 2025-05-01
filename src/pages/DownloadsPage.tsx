import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';

const DownloadsPage = () => {
  const { downloadQueue, removeFromDownloadQueue } = useChatContext();
  const navigate = useNavigate();

  const handleDownload = (item: any) => {
    // Implement download logic here
    removeFromDownloadQueue(item.id);
  };

  const handleRemove = (id: string) => {
    removeFromDownloadQueue(id);
  };

  return (
    <div className="w-full h-full overflow-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-medium text-gray-800">Downloads</h1>
        </div>

        {downloadQueue.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No downloads in queue</p>
          </div>
        ) : (
          <div className="space-y-4">
            {downloadQueue.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(item)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadsPage; 