
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import RequestsTabs from '@/components/chat/RequestsTabs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, UserPlus } from 'lucide-react';

const ChatPage: React.FC = () => {
  const { 
    selectedChat, 
    friendRequests, 
    meetupRequests 
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('chats');
  const [activeRequestsTab, setActiveRequestsTab] = useState('friends');

  // Calculate pending requests
  const pendingFriendRequests = friendRequests.filter(req => req.status === 'pending').length;
  const pendingMeetupRequests = meetupRequests.filter(req => req.status === 'pending').length;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile View */}
        <div className="flex-1 flex flex-col md:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
              <TabsTrigger value="chats" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>Chats</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="relative flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Requests</span>
                {(pendingFriendRequests + pendingMeetupRequests) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingFriendRequests + pendingMeetupRequests}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chats" className="flex-1 flex flex-col mt-4">
              {selectedChat ? (
                <ChatWindow />
              ) : (
                <div className="flex-1 p-4">
                  <ChatSidebar 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    activeRequestsTab={activeRequestsTab}
                    setActiveRequestsTab={setActiveRequestsTab}
                    pendingFriendRequests={pendingFriendRequests}
                    pendingMeetupRequests={pendingMeetupRequests}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests" className="flex-1 mt-4 p-4">
              <RequestsTabs
                activeRequestsTab={activeRequestsTab}
                setActiveRequestsTab={setActiveRequestsTab}
                pendingFriendRequests={pendingFriendRequests}
                pendingMeetupRequests={pendingMeetupRequests}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex flex-1">
          {/* Left Sidebar */}
          <div className="w-80 border-r bg-white flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 m-4">
                <TabsTrigger value="chats" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Chats</span>
                </TabsTrigger>
                <TabsTrigger value="requests" className="relative flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Requests</span>
                  {(pendingFriendRequests + pendingMeetupRequests) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingFriendRequests + pendingMeetupRequests}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chats" className="flex-1 p-4">
                <ChatSidebar 
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  activeRequestsTab={activeRequestsTab}
                  setActiveRequestsTab={setActiveRequestsTab}
                  pendingFriendRequests={pendingFriendRequests}
                  pendingMeetupRequests={pendingMeetupRequests}
                />
              </TabsContent>

              <TabsContent value="requests" className="flex-1 p-4 overflow-y-auto">
                <RequestsTabs
                  activeRequestsTab={activeRequestsTab}
                  setActiveRequestsTab={setActiveRequestsTab}
                  pendingFriendRequests={pendingFriendRequests}
                  pendingMeetupRequests={pendingMeetupRequests}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1">
            <ChatWindow />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
