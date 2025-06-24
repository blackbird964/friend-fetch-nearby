
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useAuthContext } from '@/context/AuthContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useFriendActions } from '@/components/users/hooks/useFriendActions';
import { useFriendships } from '@/hooks/useFriendships';

const ChatWindow: React.FC = () => {
  const { selectedChat, setSelectedChat, friendRequests } = useAppContext();
  const { currentUser } = useAuthContext();
  const { handleAddFriend, loading: addingFriend } = useFriendActions();
  const { friends } = useFriendships();

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No chat selected</h3>
          <p className="text-gray-500">Choose a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  // Check if this user is a friend
  const isFriend = friends.some(friend => friend.id === selectedChat.participantId);
  
  // Check if there's a pending friend request
  const hasPendingRequest = friendRequests.some(
    req => req.receiverId === selectedChat.participantId && 
           req.senderId === currentUser?.id && 
           req.status === 'pending'
  );

  const handleSendFriendRequest = async () => {
    if (!selectedChat.participantId) return;
    
    const friendUser = {
      id: selectedChat.participantId,
      name: selectedChat.participantName,
      profile_pic: selectedChat.profilePic || null,
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
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        participantName={selectedChat.participantName}
        profilePic={selectedChat.profilePic || ''}
        onBack={handleBack}
        showBackButton={true}
        isOnline={selectedChat.isOnline}
        onSendFriendRequest={handleSendFriendRequest}
        isFriend={isFriend}
        participantId={selectedChat.participantId}
        hasPendingRequest={hasPendingRequest}
      />
      
      <div className="flex-1 overflow-hidden">
        <MessageList chatId={selectedChat.id} />
      </div>
      
      <MessageInput chatId={selectedChat.id} />
    </div>
  );
};

export default ChatWindow;
