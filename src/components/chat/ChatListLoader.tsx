
import React from 'react';
import { Loader2 } from 'lucide-react';

const ChatListLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p>Loading chats...</p>
    </div>
  );
};

export default ChatListLoader;
