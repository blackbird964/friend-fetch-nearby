
import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatHeader from '@/components/chat/ChatHeader';
import FriendRequestList from '@/components/users/FriendRequestList';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatPage: React.FC = () => {
  const { friendRequests, selectedChat, setSelectedChat, loading } = useAppContext();
  const isMobile = useIsMobile();
  
  const pendingRequests = friendRequests.filter(r => r.status === 'pending').length;

  // Reset selected chat when navigating away on mobile
  useEffect(() => {
    return () => {
      if (isMobile) {
        setSelectedChat(null);
      }
    };
  }, [isMobile, setSelectedChat]);

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
      
      {pendingRequests > 0 && !selectedChat && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center">
                <Bell className="mr-2 h-5 w-5 text-primary" />
                Friend Requests
              </CardTitle>
              <span className="bg-primary text-white text-sm font-medium py-1 px-2 rounded-full">
                {pendingRequests} new
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <FriendRequestList />
          </CardContent>
        </Card>
      )}
      
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
              <div className="border rounded-lg bg-background shadow-sm h-full overflow-hidden">
                <ChatList />
              </div>
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
          {!selectedChat && !isMobile && (
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
