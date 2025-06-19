
import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import useChat from '@/hooks/useChat';
import { useFriendActions } from '@/components/users/hooks/useFriendActions';
import { Loader2 } from 'lucide-react';

const ChatWindow: React.FC = () => {
  const { selectedChat, setSelectedChat, friendRequests } = useAppContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { handleAddFriend } = useFriendActions();
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  
  const { message, setMessage, isLoading, fetchError, handleSendMessage } = useChat(selectedChat?.id || null);

  // Check if friend request already exists for this participant
  const hasPendingRequest = selectedChat ? 
    friendRequests.some(req => 
      (req.receiverId === selectedChat.participantId && req.status === 'pending') ||
      (req.senderId === selectedChat.participantId && req.status === 'pending')
    ) : false;

  // Focus textarea when chat is selected and not loading
  useEffect(() => {
    if (selectedChat && textareaRef.current && !isLoading) {
      // Short delay to ensure UI is ready
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [selectedChat, isLoading]);

  // Reset friend request sent state when chat changes
  useEffect(() => {
    setFriendRequestSent(false);
  }, [selectedChat?.id]);

  // Prevent viewport zooming on mobile
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

  const handleBack = () => {
    if (isMobile) {
      setSelectedChat(null);
    } else {
      navigate('/home');
    }
  };

  const handleSendFriendRequest = async () => {
    if (!selectedChat || friendRequestSent || hasPendingRequest) return;
    
    const friendUser = {
      id: selectedChat.participantId,
      name: selectedChat.participantName,
      profile_pic: selectedChat.profilePic,
      email: '',
      interests: [],
      isOnline: false,
      bio: null,
      age: null,
      gender: null,
      location: null,
      preferredHangoutDuration: null,
      todayActivities: [],
      blockedUsers: [],
      blocked_users: []
    };

    await handleAddFriend(friendUser);
    setFriendRequestSent(true);
  };

  if (!selectedChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        participantName={selectedChat.participantName}
        profilePic={selectedChat.profilePic}
        onBack={handleBack}
        showBackButton={isMobile}
        isOnline={false}
        onSendFriendRequest={handleSendFriendRequest}
        isFriend={false}
        participantId={selectedChat.participantId}
        hasPendingRequest={hasPendingRequest || friendRequestSent}
      />
      
      <div className="flex-grow overflow-hidden">
        {isLoading && selectedChat.messages.length === 0 ? (
          <div className="flex-grow flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
              <p className="text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : (
          <MessageList 
            messages={selectedChat.messages}
            isLoading={isLoading}
            fetchError={fetchError}
          />
        )}
      </div>
      
      {/* Always show the message input when a chat is selected */}
      <MessageInput 
        message={message}
        isLoading={isLoading}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
        textareaRef={textareaRef}
      />
    </div>
  );
};

export default ChatWindow;
