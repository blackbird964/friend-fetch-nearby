
import React, { useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import UserRequestCard from './UserRequestCard';
import { AppUser, FriendRequest } from '@/context/types';
import { Button } from '@/components/ui/button';
import { X, MapPin } from 'lucide-react';
import { cancelFriendRequest } from '@/services/friend-requests';

interface MeetingRequestHandlerProps {
  selectedUser: string | null;
  selectedDuration: number;
  setSelectedDuration: React.Dispatch<React.SetStateAction<number>>;
  onSendRequest: () => void;
  onCancel: () => void;
  nearbyUsers: AppUser[];
  movingUsers: Set<string>;
  completedMoves: Set<string>;
  setMovingUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  setCompletedMoves: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const MeetingRequestHandler: React.FC<MeetingRequestHandlerProps> = ({
  selectedUser,
  selectedDuration,
  setSelectedDuration,
  onSendRequest,
  onCancel,
  nearbyUsers,
  movingUsers,
  completedMoves,
  setMovingUsers,
  setCompletedMoves
}) => {
  const { currentUser, friendRequests, setFriendRequests } = useAppContext();
  const { toast } = useToast();
  const requestCardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    console.log("MeetingRequestHandler rendering with selectedUser:", selectedUser);
    console.log("Moving users:", Array.from(movingUsers));
    console.log("Completed moves:", Array.from(completedMoves));
  }, [selectedUser, movingUsers, completedMoves]);
  
  // Prevent card from disappearing by adding click capture
  useEffect(() => {
    if (!requestCardRef.current || !selectedUser) return;
    
    const handleDocumentClick = (e: MouseEvent) => {
      // If the click is inside the request card, prevent it from propagating
      if (requestCardRef.current && requestCardRef.current.contains(e.target as Node)) {
        e.stopPropagation();
      }
    };
    
    // Capture phase ensures our handler runs before the map click handler
    document.addEventListener('click', handleDocumentClick, { capture: true });
    
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, [selectedUser]);
  
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
    
    onSendRequest();
  };

  // Stop propagation on all click events to prevent deselection
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Check if we already have a pending request with this user
  const existingRequest = selectedUser ? 
    friendRequests.find(req => 
      req.status === 'pending' && 
      req.receiverId === selectedUser && 
      req.senderId === currentUser?.id
    ) : null;

  // Check if the selected user is currently moving to a meeting
  const isUserMoving = selectedUser ? movingUsers.has(selectedUser) : false;
  const hasUserMoved = selectedUser ? completedMoves.has(selectedUser) : false;

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
      // Remove from moving and completed sets
      if (setMovingUsers && typeof setMovingUsers === 'function') {
        setMovingUsers(prev => {
          const next = new Set(prev);
          next.delete(selectedUser);
          return next;
        });
      }
      
      if (setCompletedMoves && typeof setCompletedMoves === 'function') {
        setCompletedMoves(prev => {
          const next = new Set(prev);
          next.delete(selectedUser);
          return next;
        });
      }
      
      toast({
        title: "Meeting Cancelled",
        description: `You've cancelled the meeting.`,
      });
      
      // Close the request panel
      onCancel();
    }
  };

  // If no user is selected, don't render the request card
  if (!selectedUser) {
    console.log("No user selected, not rendering request card");
    return null;
  }

  // Find the selected user
  const user = nearbyUsers.find(u => u.id === selectedUser);
  if (!user) {
    console.log("Selected user not found in nearby users");
    return null;
  }
  
  console.log("Rendering request card for user:", user.name);
  console.log("Is user moving:", isUserMoving, "Has user moved:", hasUserMoved);
  
  // CRITICAL FIX: Only show the active meeting card if the user is actually moving or has moved
  if (isUserMoving || hasUserMoved) {
    return (
      <div 
        ref={requestCardRef}
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md"
        onClick={stopPropagation} // Stop click propagation at container level
      >
        <div className="mt-4 p-4 bg-white border rounded-lg shadow-md animate-fade-in user-popup-card">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Active Meeting</h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {isUserMoving ? 'In Progress' : 'At Destination'}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            {isUserMoving 
              ? `${user.name} is currently heading to the meeting point.` 
              : `${user.name} has arrived at the meeting point.`}
          </p>
          
          <Button 
            variant="destructive"
            className="w-full flex items-center justify-center"
            onClick={(e) => handleCancelMeeting(e)}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel Meeting
          </Button>
        </div>
      </div>
    );
  }
  
  // If there's an existing pending request, show cancellation option
  if (existingRequest) {
    return (
      <div 
        ref={requestCardRef}
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md"
        onClick={stopPropagation} // Stop click propagation at container level
      >
        <div className="mt-4 p-4 bg-white border rounded-lg shadow-md animate-fade-in user-popup-card">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Active Catch-up Request</h3>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              Pending
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            You already have a pending catch-up request with {user.name} for {existingRequest.duration} minutes.
          </p>
          
          <Button 
            variant="destructive"
            className="w-full flex items-center justify-center"
            onClick={(e) => handleCancelRequest(existingRequest, e)}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel Request
          </Button>
        </div>
      </div>
    );
  }
  
  // Otherwise, show the normal request card
  return (
    <div 
      ref={requestCardRef} 
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md user-popup-card"
      onClick={stopPropagation}
    >
      <UserRequestCard 
        user={user}
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        onSendRequest={handleSendRequest}
        onCancel={(e) => {
          e.stopPropagation();
          onCancel();
        }}
      />
    </div>
  );
};

export default MeetingRequestHandler;
