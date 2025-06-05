
import React from 'react';
import ChatList from './ChatList';

interface ChatSidebarProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  activeRequestsTab: string;
  setActiveRequestsTab: React.Dispatch<React.SetStateAction<string>>;
  pendingFriendRequests: number;
  pendingMeetupRequests: number;
}

const ChatSidebar: React.FC<ChatSidebarProps> = () => {
  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold px-4 py-2">Messages</h2>
      </div>
      
      <div className="h-[calc(100%-60px)] overflow-hidden rounded-md border">
        <div className="border rounded-lg bg-background shadow-sm h-full overflow-hidden">
          <ChatList />
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
