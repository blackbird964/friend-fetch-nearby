
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatHeader from '@/components/chat/ChatHeader';
import FriendRequestList from '@/components/users/FriendRequestList';
import MeetupRequestsList from '@/components/users/meet-requests/MeetupRequestsList';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Loader2, UserPlus, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ChatPage: React.FC = () => {
  const { 
    friendRequests, 
    meetupRequests, 
    selectedChat, 
    setSelectedChat, 
    loading, 
    refreshFriendRequests, 
    refreshMeetupRequests 
  } = useAppContext();
  const [activeTab, setActiveTab] = useState('chats');
  const [activeRequestsTab, setActiveRequestsTab] = useState('friends');
  const isMobile = useIsMobile();
  
  const pendingFriendRequests = friendRequests.filter(r => 
    r.status === 'pending' && r.receiverId === friendRequests[0]?.receiverId
  ).length;

  const pendingMeetupRequests = meetupRequests.filter(r => 
    r.status === 'pending' && r.receiverId === meetupRequests[0]?.receiverId
  ).length;

  // Reset selected chat when navigating away on mobile
  useEffect(() => {
    return () => {
      if (isMobile) {
        setSelectedChat(null);
      }
    };
  }, [isMobile, setSelectedChat]);
  
  // Refresh requests when component mounts
  useEffect(() => {
    refreshFriendRequests();
    refreshMeetupRequests();
  }, [refreshFriendRequests, refreshMeetupRequests]);

  // Prevent viewport scaling on mobile
  useEffect(() => {
    if (isMobile) {
      const metaViewport = document.querySelector('meta[name=viewport]');
      if (metaViewport) {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
      
      return () => {
        const metaViewport = document.querySelector('meta[name=viewport]');
        if (metaViewport) {
          metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
      };
    }
  }, [isMobile]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl flex flex-col h-[calc(100vh-130px)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>
      
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-hidden">
          {/* On mobile: Show chat list when no chat is selected, hide when viewing a chat */}
          {(!selectedChat || !isMobile) && (
            <div className={`${isMobile ? 'h-full w-full' : 'md:w-1/3'} overflow-hidden flex-shrink-0`}>
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
                  <Tabs
                    defaultValue="friends"
                    value={activeRequestsTab}
                    onValueChange={setActiveRequestsTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="friends" className="relative">
                        <div className="flex items-center gap-1">
                          <UserPlus className="h-4 w-4" />
                          <span>Friend</span>
                        </div>
                        {pendingFriendRequests > 0 && (
                          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {pendingFriendRequests}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="meetups" className="relative">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Meetups</span>
                        </div>
                        {pendingMeetupRequests > 0 && (
                          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {pendingMeetupRequests}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="friends">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xl flex items-center">
                            <UserPlus className="mr-2 h-5 w-5 text-primary" />
                            Friend Requests
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <FriendRequestList />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="meetups">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xl flex items-center">
                            <Calendar className="mr-2 h-5 w-5 text-primary" />
                            Meetup Requests
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <MeetupRequestsList />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {/* Show the chat window if a chat is selected */}
          {selectedChat && (
            <div className={`${isMobile ? 'fixed inset-0 z-20 bg-background pt-0' : 'md:w-2/3 relative'} flex-grow overflow-hidden`}>
              <div className={`${isMobile ? 'h-full' : 'border rounded-lg shadow-sm h-full'} bg-background flex flex-col`}>
                <ChatHeader 
                  participantName={selectedChat.participantName}
                  profilePic={selectedChat.profilePic}
                  onBack={() => setSelectedChat(null)}
                  showBackButton={isMobile}
                  isOnline={selectedChat.isOnline}
                />
                <ChatWindow />
              </div>
            </div>
          )}
          
          {/* Show a placeholder if no chat is selected (desktop only) */}
          {!selectedChat && !isMobile && activeTab === 'chats' && (
            <div className="hidden md:flex md:w-2/3 md:items-center md:justify-center h-full">
              <div className="border rounded-lg h-full w-full bg-background shadow-sm flex flex-col items-center justify-center text-gray-500">
                <p>Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
