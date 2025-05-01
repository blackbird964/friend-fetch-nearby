
import React from 'react';

const EmptyChatList: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
      <p>No chats yet</p>
      <p className="text-sm">Accept a friend request to start chatting</p>
    </div>
  );
};

export default EmptyChatList;
