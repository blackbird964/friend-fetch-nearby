
import React from 'react';

const ChatPlaceholder: React.FC = () => {
  return (
    <div className="border rounded-lg h-full w-full bg-background shadow-sm flex flex-col items-center justify-center text-gray-500">
      <p>Select a chat to start messaging</p>
    </div>
  );
};

export default ChatPlaceholder;
