
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import UserRequestCard from './UserRequestCard';
import { AppUser, FriendRequest } from '@/context/types';
import { Button } from '@/components/ui/button';
import { X, MapPin } from 'lucide-react';
import { cancelFriendRequest } from '@/services/friendRequestService';

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
  
  const handleSendRequest = () => {
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
  const handleCancelRequest = async (request: FriendRequest) => {
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
  const handleCancelMeeting = () => {
    if (selectedUser) {
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

  // If no user is selected, don't render the request card
  if (!selectedUser) return null;

  // Find the selected user
  const user = nearbyUsers.find(u => u.id === selectedUser);
  if (!user) return null;
  
  // If the user is currently moving to a meeting or has already moved
  if (isUserMoving || hasUserMoved) {
    return (
      <div className="mt-4 p-4 bg-white border rounded-lg shadow-md animate-slide-in-bottom">
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
          onClick={handleCancelMeeting}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel Meeting
        </Button>
      </div>
    );
  }
  
  // If there's an existing pending request, show cancellation option
  if (existingRequest) {
    return (
      <div className="mt-4 p-4 bg-white border rounded-lg shadow-md animate-slide-in-bottom">
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
          onClick={() => handleCancelRequest(existingRequest)}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel Request
        </Button>
      </div>
    );
  }
  
  // Otherwise, show the normal request card
  return (
    <UserRequestCard 
      user={user}
      selectedDuration={selectedDuration}
      setSelectedDuration={setSelectedDuration}
      onSendRequest={handleSendRequest}
      onCancel={onCancel}
    />
  );
};

export default MeetingRequestHandler;
