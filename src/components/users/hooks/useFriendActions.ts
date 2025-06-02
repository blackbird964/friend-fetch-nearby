
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { sendFriendRequest } from '@/services/friend-requests';
import { AppUser } from '@/context/types';
import { toast } from "sonner";

export const useFriendActions = () => {
  const { 
    currentUser, 
    friendRequests, 
    setFriendRequests,
    refreshFriendRequests
  } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async (user: AppUser) => {
    if (!currentUser) {
      toast.error("Not logged in", {
        description: "You need to be logged in to send friend requests"
      });
      return;
    }

    // Check if we already have a pending request with this user
    const existingRequest = friendRequests.find(req => 
      req.status === 'pending' && 
      ((req.receiverId === user.id && req.senderId === currentUser.id) ||
       (req.senderId === user.id && req.receiverId === currentUser.id))
    );

    // Check if we already have an accepted request with this user
    const alreadyFriends = friendRequests.find(req => 
      req.status === 'accepted' && 
      ((req.receiverId === user.id && req.senderId === currentUser.id) ||
       (req.senderId === user.id && req.receiverId === currentUser.id))
    );

    if (existingRequest) {
      toast.info("Request already sent", {
        description: `You already have a pending request with ${user.name}`
      });
      return;
    }

    if (alreadyFriends) {
      toast.info("Already friends", {
        description: `You are already friends with ${user.name}`
      });
      return;
    }

    try {
      setLoading(true);
      // Use the default 30 minutes duration as string
      const defaultDuration = "30";
      
      console.log("Sending friend request with data:", {
        currentUserId: currentUser.id, 
        currentUserName: currentUser.name, 
        profilePic: currentUser.profile_pic,
        userId: user.id, 
        userName: user.name
      });
      
      const request = await sendFriendRequest(
        currentUser.id,
        currentUser.name || 'User',
        currentUser.profile_pic || null,
        user.id,
        user.name || 'User',
        user.profile_pic || null,
        defaultDuration
      );
      
      if (request) {
        setFriendRequests([...friendRequests, request]);
        
        toast.success("Friend Request Sent!", {
          description: `You've sent a friend request to ${user.name}`
        });
        
        // Refresh friend requests to ensure our state is up-to-date
        await refreshFriendRequests();
      } else {
        throw new Error("Failed to send friend request");
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error("Error", {
        description: "Failed to send friend request. Please try again."
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
