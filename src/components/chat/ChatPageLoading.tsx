
import React from 'react';
import { Loader2 } from 'lucide-react';

const ChatPageLoading: React.FC = () => {
  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
        <p className="text-gray-500">Loading conversations...</p>
      </div>
    </div>
  );
};

export default ChatPageLoading;
