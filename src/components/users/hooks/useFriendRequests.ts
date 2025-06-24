
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

  console.log("useFriendRequests: All friend requests:", friendRequests);
  console.log("useFriendRequests: Current user ID:", currentUser?.id);

  const [isLoading, setIsLoading] = useState(false);

  // Filter requests - incoming requests where current user is the receiver
  const pendingRequests = friendRequests.filter(
    req => req.receiverId === currentUser?.id && req.status === 'pending'
  );
  
  // Sent requests where current user is the sender
  const sentRequests = friendRequests.filter(
    req => req.senderId === currentUser?.id && req.status === 'pending'
  );

  console.log("useFriendRequests: Pending requests (incoming):", pendingRequests);
  console.log("useFriendRequests: Sent requests (outgoing):", sentRequests);

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
        const friendship = await createFriendship(senderId);
        console.log('Friendship created:', friendship);
        
        // Remove from local state with proper typing
        const updatedRequests = friendRequests.filter(req => req.id !== requestId);
        setFriendRequests(updatedRequests);
        
        toast.success('Friend request accepted!');
        
        // Refresh the friend requests list
        await refreshFriendRequests();
        
        // Force a page reload to refresh all friendship data
        window.location.reload();
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
      
      // First remove from local state immediately for instant UI feedback
      const updatedRequests = friendRequests.filter(req => req.id !== requestId);
      setFriendRequests(updatedRequests);
      
      const success = await cancelFriendRequest(requestId);
      
      if (success) {
        toast.success('Friend request canceled');
        console.log('Friend request canceled successfully');
        
        // Don't refresh - we already updated the local state
        // This prevents the race condition where the request reappears
      } else {
        console.error('Failed to cancel friend request - reverting local state');
        // If cancellation failed, revert the local state
        setFriendRequests(friendRequests);
        toast.error('Failed to cancel friend request');
      }
    } catch (error) {
      console.error('Error canceling friend request:', error);
      // Revert local state on error
      setFriendRequests(friendRequests);
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
