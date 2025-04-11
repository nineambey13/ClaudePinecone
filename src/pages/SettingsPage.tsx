
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-claude-border p-4 flex items-center">
        <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2" size={20} />
          Back to chats
        </Link>
      </div>
      <div className="flex-1 p-8 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>
        
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Account Settings</h2>
            <p className="text-gray-500 mb-4">This is a placeholder for account settings.</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                In a fully implemented application, this section would contain:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                <li>Profile information</li>
                <li>API keys</li>
                <li>Notification preferences</li>
                <li>Appearance settings</li>
              </ul>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">AI Models</h2>
            <p className="text-gray-500 mb-4">Configure your default AI model and settings.</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                Placeholder for model selection and configuration options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
