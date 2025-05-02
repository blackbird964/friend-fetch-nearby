
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { sendFriendRequest } from '@/services/friendRequestService';
import { Chat, AppUser } from '@/context/types';

export const useUserActions = () => {
  const { 
    currentUser, 
    chats, 
    setChats, 
    setSelectedChat, 
    friendRequests, 
    setFriendRequests,
    refreshNearbyUsers
  } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const startChat = (user: AppUser) => {
    if (!currentUser) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to chat",
        variant: "destructive"
      });
      return;
    }
    
    // Check if chat already exists
    const existingChat = chats.find(chat => chat.participantId === user.id);
    
    if (existingChat) {
      setSelectedChat(existingChat);
      toast({
        title: "Chat exists",
        description: `Opening your chat with ${user.name}`,
      });
    } else {
      // Create new chat with required properties
      const newChat: Chat = {
        id: `chat-${user.id}`,
        name: user.name || 'Chat',
        participants: [currentUser.id, user.id],
        participantId: user.id,
        participantName: user.name,
        profilePic: user.profile_pic || '',
        lastMessage: "Start chatting now",
        lastMessageTime: Date.now(),
        messages: [],
      };
      
      setChats([newChat, ...chats]);
      setSelectedChat(newChat);
      
      toast({
        title: "Chat created",
        description: `Started a new chat with ${user.name}`,
      });
    }
    
    // Navigate to chat page
    navigate('/chat');
  };

  const handleAddFriend = async (user: AppUser) => {
    if (!currentUser) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to send friend requests",
        variant: "destructive"
      });
      return;
    }

    // Check if we already have a pending request with this user
    const existingRequest = friendRequests.find(req => 
      req.status === 'pending' && 
      ((req.receiverId === user.id && req.senderId === currentUser.id) ||
       (req.senderId === user.id && req.receiverId === currentUser.id))
    );

    if (existingRequest) {
      toast({
        title: "Request already sent",
        description: `You already have a pending request with ${user.name}`,
        variant: "default"
      });
      return;
    }

    try {
      setLoading(true);
      // Use the default 30 minutes duration
      const defaultDuration = 30;
      const request = await sendFriendRequest(
        currentUser.id,
        currentUser.name || 'User',
        currentUser.profile_pic,
        user.id,
        user.name || 'User',
        user.profile_pic,
        defaultDuration
      );
      
      if (request) {
        setFriendRequests([...friendRequests, request]);
        
        toast({
          title: "Friend Request Sent!",
          description: `You've sent a friend request to ${user.name}`,
        });
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await refreshNearbyUsers(true);
      toast({
        title: "Refreshed",
        description: "Nearby users list has been updated.",
      });
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast({
        title: "Error",
        description: "Failed to refresh nearby users.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    startChat,
    handleAddFriend,
    handleRefresh,
    loading
  };
};
