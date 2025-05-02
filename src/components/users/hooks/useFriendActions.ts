
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { sendFriendRequest } from '@/services/friendRequestService';
import { AppUser } from '@/context/types';

export const useFriendActions = () => {
  const { 
    currentUser, 
    friendRequests, 
    setFriendRequests
  } = useAppContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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

  return {
    handleAddFriend,
    loading
  };
};
