
import { useState, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { AppUser, FriendRequest } from '@/context/types';
import { cancelFriendRequest } from '@/services/friend-requests';

export const useMeetingRequestActions = (
  selectedUser: string | null,
  movingUsers: Set<string>,
  completedMoves: Set<string>,
  setMovingUsers: React.Dispatch<React.SetStateAction<Set<string>>>,
  setCompletedMoves: React.Dispatch<React.SetStateAction<Set<string>>>,
  onCancel: () => void
) => {
  const { currentUser, friendRequests, setFriendRequests } = useAppContext();
  const { toast } = useToast();
  
  // Handle sending a request
  const handleSendRequest = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from reaching map
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to send friend requests",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedUser) return;
    
    // This is a placeholder - the actual sending happens in the parent component
    console.log("Request sending action triggered in hook");
  };

  // Check if the selected user is in a meeting state
  const getUserMeetingState = (userId: string | null) => {
    if (!userId) return { isUserMoving: false, hasUserMoved: false };
    
    // Check directly against the sets for accurate state determination
    const isUserMoving = movingUsers.has(userId);
    const hasUserMoved = completedMoves.has(userId);
    
    console.log(`getUserMeetingState for ${userId}: moving=${isUserMoving}, moved=${hasUserMoved}`);
    return { isUserMoving, hasUserMoved };
  };

  // Handle cancelling an existing request
  const handleCancelRequest = async (request: FriendRequest, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent map click propagation
    try {
      const success = await cancelFriendRequest(request.id);
      
      if (success) {
        // Remove request from state
        setFriendRequests(friendRequests.filter(req => req.id !== request.id));
        
        toast({
          title: "Request Cancelled",
          description: `Your catch-up request has been cancelled.`,
        });
        
        // Close the request panel
        onCancel();
      } else {
        throw new Error("Failed to cancel request");
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast({
        title: "Error",
        description: "Failed to cancel request. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle cancelling active movement
  const handleCancelMeeting = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent map click propagation
    if (selectedUser) {
      console.log(`Cancelling meeting for user ${selectedUser}`);
      
      // Remove from moving and completed sets
      setMovingUsers(prev => {
        const next = new Set(prev);
        next.delete(selectedUser);
        return next;
      });
      
      setCompletedMoves(prev => {
        const next = new Set(prev);
        next.delete(selectedUser);
        return next;
      });
      
      toast({
        title: "Meeting Cancelled",
        description: `You've cancelled the meeting.`,
      });
      
      // Close the request panel
      onCancel();
    }
  };

  // Find existing request for the selected user
  const findExistingRequest = (userId: string | null): FriendRequest | null => {
    if (!userId || !currentUser) return null;
    
    const existingRequest = friendRequests.find(req => 
      req.status === 'pending' && 
      req.receiverId === userId && 
      req.senderId === currentUser.id
    ) || null;
    
    console.log(`Existing request for ${userId}:`, existingRequest ? 'Found' : 'None');
    return existingRequest;
  };

  return {
    handleSendRequest,
    handleCancelRequest,
    handleCancelMeeting,
    getUserMeetingState,
    findExistingRequest
  };
};
