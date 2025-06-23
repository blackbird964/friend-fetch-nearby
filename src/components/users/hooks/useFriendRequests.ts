
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { 
  fetchFriendRequests, 
  updateFriendRequestStatus, 
  cancelFriendRequest 
} from '@/services/friend-requests';
import { createFriendship } from '@/services/friendships';
import { toast } from 'sonner';
import { FriendRequest } from '@/context/types';

export function useFriendRequests() {
  const { 
    friendRequests, 
    setFriendRequests, 
    currentUser, 
    refreshFriendRequests 
  } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);

  // Filter requests
  const pendingRequests = friendRequests.filter(
    req => req.receiverId === currentUser?.id && req.status === 'pending'
  );
  
  const sentRequests = friendRequests.filter(
    req => req.senderId === currentUser?.id && req.status === 'pending'
  );

  const handleAccept = async (requestId: string, senderId: string) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      console.log('Accepting friend request:', requestId);
      
      // Update the friend request status
      const success = await updateFriendRequestStatus(
        requestId, 
        'accepted', 
        currentUser.id, 
        currentUser.name
      );
      
      if (success) {
        // Create friendship record
        await createFriendship(senderId);
        
        // Remove from local state with proper typing
        const updatedRequests = friendRequests.filter(req => req.id !== requestId);
        setFriendRequests(updatedRequests);
        
        toast.success('Friend request accepted!');
        
        // Refresh the friend requests list
        await refreshFriendRequests();
      } else {
        toast.error('Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      console.log('Rejecting friend request:', requestId);
      
      const success = await updateFriendRequestStatus(
        requestId, 
        'rejected', 
        currentUser.id, 
        currentUser.name
      );
      
      if (success) {
        // Remove from local state with proper typing
        const updatedRequests = friendRequests.filter(req => req.id !== requestId);
        setFriendRequests(updatedRequests);
        
        toast.success('Friend request rejected');
        
        // Refresh the friend requests list
        await refreshFriendRequests();
      } else {
        toast.error('Failed to reject friend request');
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Failed to reject friend request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (requestId: string) => {
    setIsLoading(true);
    try {
      console.log('Canceling friend request:', requestId);
      
      const success = await cancelFriendRequest(requestId);
      
      if (success) {
        // Remove from local state with proper typing
        const updatedRequests = friendRequests.filter(req => req.id !== requestId);
        setFriendRequests(updatedRequests);
        
        toast.success('Friend request canceled');
        
        // Refresh the friend requests list
        await refreshFriendRequests();
      } else {
        toast.error('Failed to cancel friend request');
      }
    } catch (error) {
      console.error('Error canceling friend request:', error);
      toast.error('Failed to cancel friend request');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pendingRequests,
    sentRequests,
    isLoading,
    handleAccept,
    handleReject,
    handleCancel
  };
}
