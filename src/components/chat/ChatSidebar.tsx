
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatList from './ChatList';
import RequestsTabs from './RequestsTabs';

interface ChatSidebarProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  activeRequestsTab: string;
  setActiveRequestsTab: React.Dispatch<React.SetStateAction<string>>;
  pendingFriendRequests: number;
  pendingMeetupRequests: number;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  activeTab,
  setActiveTab,
  activeRequestsTab,
  setActiveRequestsTab,
  pendingFriendRequests,
  pendingMeetupRequests
}) => {
  return (
    <Tabs 
      defaultValue="chats" 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full h-full"
    >
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="chats">
          Chats
        </TabsTrigger>
        <TabsTrigger value="requests" className="relative">
          Requests
          {(pendingFriendRequests + pendingMeetupRequests) > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingFriendRequests + pendingMeetupRequests}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="chats" className="h-[calc(100%-48px)] overflow-hidden rounded-md border">
        <div className="border rounded-lg bg-background shadow-sm h-full overflow-hidden">
          <ChatList />
        </div>
      </TabsContent>
      
      <TabsContent value="requests" className="h-[calc(100%-48px)] space-y-4 overflow-y-auto p-4 rounded-md border">
        <RequestsTabs 
          activeRequestsTab={activeRequestsTab}
          setActiveRequestsTab={setActiveRequestsTab}
          pendingFriendRequests={pendingFriendRequests}
          pendingMeetupRequests={pendingMeetupRequests}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ChatSidebar;
