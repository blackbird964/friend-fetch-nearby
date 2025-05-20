
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatPageLoading from '@/components/chat/ChatPageLoading';
import ChatPlaceholder from '@/components/chat/ChatPlaceholder';
import { useIsMobile } from '@/hooks/use-mobile';
import { useViewportConfig } from '@/hooks/useViewportConfig';

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
  
  // Configure viewport for mobile devices
  useViewportConfig(isMobile);
  
  // Calculate pending requests counts
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl flex flex-col h-[calc(100vh-130px)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>
      
      {loading ? (
        <ChatPageLoading />
      ) : (
        <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-hidden">
          {/* On mobile: Show chat list when no chat is selected, hide when viewing a chat */}
          {(!selectedChat || !isMobile) && (
            <div className={`${isMobile ? 'h-full w-full' : 'md:w-1/3'} overflow-hidden flex-shrink-0`}>
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
              <ChatPlaceholder />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
