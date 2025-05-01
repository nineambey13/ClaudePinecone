import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DownloadQueue } from '@/components/ui/DownloadQueue';

const DownloadQueuePage = () => {
  const navigate = useNavigate();

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
        
        <DownloadQueue />
      </div>
    </div>
  );
};

export default DownloadQueuePage; 