
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatPageLoading from '@/components/chat/ChatPageLoading';
import ChatPlaceholder from '@/components/chat/ChatPlaceholder';
import { useIsMobile } from '@/hooks/use-mobile';
import { useViewportConfig } from '@/hooks/useViewportConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFriendActions } from '@/components/users/hooks/useFriendActions';
import { AppUser } from '@/context/types';

const ChatPage: React.FC = () => {
  const { 
    selectedChat, 
    setSelectedChat, 
    loading, 
    chats,
    currentUser,
    friendRequests
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('chats');
  const [activeRequestsTab, setActiveRequestsTab] = useState('friends');
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { handleAddFriend } = useFriendActions();
  
  // Configure viewport for mobile devices
  useViewportConfig(isMobile);

  // Check if the current chat participant is already a friend
  const isFriend = selectedChat ? friendRequests.some(req => 
    req.status === 'accepted' && 
    ((req.receiverId === selectedChat.participantId && req.senderId === currentUser?.id) ||
     (req.senderId === selectedChat.participantId && req.receiverId === currentUser?.id))
  ) : false;

  const handleSendFriendRequest = () => {
    if (selectedChat && currentUser) {
      // Create a user object for the friend request
      const participant: AppUser = {
        id: selectedChat.participantId,
        name: selectedChat.participantName,
        profile_pic: selectedChat.profilePic,
        // Add default values for required fields
        bio: null,
        gender: null,
        age: null,
        interests: [],
        location: null,
        preferredHangoutDuration: '30',
        todayActivities: [],
        isOnline: selectedChat.isOnline || false,
        last_seen: new Date().toISOString(),
        is_over_18: false,
        blocked_users: [],
        blockedUsers: [],
        total_catchup_time: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active_priorities: []
      };
      
      handleAddFriend(participant);
    }
  };

  // Log when component mounts or chats change
  useEffect(() => {
    console.log("[ChatPage] Mounted or chats changed. Available chats:", chats.length);
    console.log("[ChatPage] Selected chat:", selectedChat?.id);
    console.log("[ChatPage] Route:", location.pathname);
    console.log("[ChatPage] Is mobile:", isMobile);
  }, [chats, selectedChat, location, isMobile]);
  
  // Reset selected chat when navigating away on mobile
  useEffect(() => {
    return () => {
      if (isMobile) {
        setSelectedChat(null);
      }
    };
  }, [isMobile, setSelectedChat]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl flex flex-col h-[calc(100vh-130px)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>
      
      {loading ? (
        <ChatPageLoading />
      ) : (
        <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-hidden">
          {/* Mobile: Show chat list when no chat is selected, show chat when one is selected */}
          {/* Desktop: Always show both sidebar and chat area */}
          {(!selectedChat || !isMobile) && (
            <div className={`${isMobile ? 'h-full w-full' : 'md:w-1/3'} overflow-hidden flex-shrink-0`}>
              <ChatSidebar 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeRequestsTab={activeRequestsTab}
                setActiveRequestsTab={setActiveRequestsTab}
                pendingFriendRequests={0}
                pendingMeetupRequests={0}
              />
            </div>
          )}
          
          {/* Show the chat window if a chat is selected */}
          {selectedChat && (
            <div className={`${isMobile ? 'fixed inset-0 z-20 bg-background' : 'md:w-2/3 relative'} flex-grow overflow-hidden`}>
              <div className={`${isMobile ? 'h-full' : 'border rounded-lg shadow-sm h-full'} bg-background flex flex-col`}>
                <ChatHeader 
                  participantName={selectedChat.participantName}
                  profilePic={selectedChat.profilePic}
                  onBack={() => setSelectedChat(null)}
                  showBackButton={isMobile}
                  isOnline={selectedChat.isOnline}
                  participantId={selectedChat.participantId}
                  isFriend={isFriend}
                  onSendFriendRequest={handleSendFriendRequest}
                />
                <ChatWindow />
              </div>
            </div>
          )}
          
          {/* Show a placeholder if no chat is selected (desktop only) */}
          {!selectedChat && !isMobile && (
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
