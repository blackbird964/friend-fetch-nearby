
import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

const EmptyChatList: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4 py-8">
      <MessageSquarePlus className="h-12 w-12 text-gray-400 mb-3" />
      <p className="font-medium">No chats yet</p>
      <p className="text-sm text-center">Accept a friend request to start chatting</p>
    </div>
  );
};

export default EmptyChatList;
