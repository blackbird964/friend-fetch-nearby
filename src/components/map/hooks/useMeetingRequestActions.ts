
import { useRef } from 'react';
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
  
  // Debug references
  const initialRenderRef = useRef(true);
  const lastSelectedUserRef = useRef<string | null>(null);
  
  // Reset meeting states completely to ensure clean slate
  const resetMeetingStates = () => {
    console.log("RESET: Clearing all meeting states");
    
    if (selectedUser) {
      console.log(`RESET: Explicitly removing ${selectedUser} from all meeting states`);
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
    }
  };
  
  // Handle sending a request - just initiating the action
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
    
    // CRITICAL: Make sure we're starting with a clean slate
    resetMeetingStates();
    
    console.log("Request sending action triggered in hook");
  };

  // This is now a simple function that definitively returns false
  // We want to ONLY show the booking card, never the "in meeting" card
  const isUserInMeetingState = (): boolean => {
    // Force false to ensure we only show the booking card
    return false;
  };

  // Find existing request for the selected user
  const findExistingRequest = (userId: string | null): FriendRequest | null => {
    if (!userId || !currentUser) return null;
    
    const existingRequest = friendRequests.find(req => 
      req.status === 'pending' && 
      req.receiverId === userId && 
      req.senderId === currentUser.id
    ) || null;
    
    return existingRequest;
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
      resetMeetingStates();
      
      toast({
        title: "Meeting Cancelled",
        description: `You've cancelled the meeting.`,
      });
      
      // Close the request panel
      onCancel();
    }
  };

  // Return a clean object
  return {
    handleSendRequest,
    handleCancelRequest,
    handleCancelMeeting,
    findExistingRequest,
    isUserInMeetingState,
    resetMeetingStates,
    initialRenderRef,
    lastSelectedUserRef
  };
};
