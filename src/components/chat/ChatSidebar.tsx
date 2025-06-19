
import React from 'react';
import { MessageCircle } from 'lucide-react';
import ChatList from './ChatList';

const ChatSidebar: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Chats</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ChatList />
      </div>
    </div>
  );
};

export default ChatSidebar;
