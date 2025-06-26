
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useAuthContext } from '@/context/AuthContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useFriendActions } from '@/components/users/hooks/useFriendActions';
import { useFriendships } from '@/hooks/useFriendships';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/context/types';

const ChatWindow: React.FC = () => {
  const { selectedChat, setSelectedChat, friendRequests } = useAppContext();
  const { currentUser } = useAuthContext();
  const { handleAddFriend, loading: addingFriend } = useFriendActions();
  const { friends } = useFriendships();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Load messages when selectedChat changes
  useEffect(() => {
    if (selectedChat && currentUser) {
      loadChatMessages();
    }
  }, [selectedChat?.id, currentUser?.id]);

  const loadChatMessages = async () => {
    if (!selectedChat || !currentUser) return;
    
    setIsLoadingMessages(true);
    try {
      console.log('Loading messages for chat:', selectedChat.id);
      
      // Fetch all messages between current user and the chat participant
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedChat.participantId}),and(sender_id.eq.${selectedChat.participantId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      console.log('Loaded messages:', messages);

      // Convert database messages to Message format
      const formattedMessages: Message[] = messages?.map(msg => {
        // Try to parse content as JSON for friend requests
        let messageContent = msg.content;
        let messageType = 'text';
        
        try {
          const parsedContent = JSON.parse(msg.content);
          if (parsedContent.type === 'friend_request') {
            messageType = 'friend_request';
            messageContent = parsedContent;
          }
        } catch {
          // Not JSON, treat as regular text
        }

        return {
          id: msg.id,
          senderId: msg.sender_id,
          content: messageType === 'friend_request' ? JSON.stringify(messageContent) : messageContent,
          text: messageType === 'friend_request' ? JSON.stringify(messageContent) : messageContent,
          timestamp: new Date(msg.created_at).getTime(),
          status: 'sent'
        };
      }) || [];

      setChatMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

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
    // Reload messages after sending friend request
    setTimeout(() => {
      loadChatMessages();
    }, 1000);
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual message sending logic
    console.log('Sending message:', message);
    setMessage('');
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
        <MessageList 
          messages={chatMessages} 
          isLoading={isLoadingMessages}
        />
      </div>
      
      <MessageInput 
        message={message}
        isLoading={false}
        onMessageChange={handleMessageChange}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatWindow;
