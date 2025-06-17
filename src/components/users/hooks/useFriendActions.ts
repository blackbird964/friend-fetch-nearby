
import { useState } from 'react';
import { sendFriendRequest } from '@/services/friend-requests';
import { useAuthContext } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';
import { AppUser } from '@/context/types';
import { toast } from 'sonner';

export const useFriendActions = () => {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuthContext();
  const { refreshFriendRequests } = useAppContext();

  const handleAddFriend = async (friend: AppUser, duration: number = 30) => {
    if (!currentUser) {
      console.error('No current user found');
      return;
    }

    setLoading(true);

    try {
      // Check if request already exists
      const existingRequest = friend.friendRequest;
      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          toast.error('Friend request already pending');
          return;
        }
        
        if (existingRequest.status === 'accepted') {
          toast.error('Already friends with this user');
          return;
        }
      }

      console.log(`Sending friend request to ${friend.name} for ${duration} minutes`);

      const result = await sendFriendRequest(
        currentUser.id,
        currentUser.name,
        currentUser.profile_pic || null,
        friend.id,
        friend.name,
        friend.profile_pic || null
      );

      if (result) {
        console.log('Friend request sent successfully:', result);
        toast.success(`Friend request sent to ${friend.name}!`);
        
        // Refresh friend requests to update UI
        await refreshFriendRequests();
      } else {
        console.error('Failed to send friend request');
        toast.error('Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Error sending friend request');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleAddFriend,
    loading
  };
};
