
import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { AppUser } from '@/context/types';
import UserRequestCard from './UserRequestCard';
import { RequestCardContainer, ActiveMeetingCard, PendingRequestCard } from './meeting-cards';
import { useMeetingRequestActions } from '../hooks/useMeetingRequestActions';

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
  // Get actions from our custom hook
  const {
    handleSendRequest,
    handleCancelRequest,
    handleCancelMeeting,
    getUserMeetingState,
    findExistingRequest,
    isUserInMeeting
  } = useMeetingRequestActions(
    selectedUser, 
    movingUsers, 
    completedMoves, 
    setMovingUsers, 
    setCompletedMoves,
    onCancel
  );
  
  useEffect(() => {
    console.log("MeetingRequestHandler rendering with selectedUser:", selectedUser);
    console.log("Moving users:", Array.from(movingUsers));
    console.log("Completed moves:", Array.from(completedMoves));
  }, [selectedUser, movingUsers, completedMoves]);
  
  // Stop propagation on all click events to prevent deselection
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Find the existing request
  const existingRequest = selectedUser ? findExistingRequest(selectedUser) : null;

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
  
  // Check if user is in moving state
  const { isUserMoving, hasUserMoved } = getUserMeetingState(selectedUser);
  console.log("Is user moving:", isUserMoving, "Has user moved:", hasUserMoved);
  
  // FIX: The problem was here - using sets directly can cause issues with object equality
  // Explicitly check if the selected user ID is in the sets
  const userIsInMeeting = isUserInMeeting(selectedUser);
  
  console.log("User in meeting state:", userIsInMeeting);
  
  // Only show the active meeting card if the user is explicitly in a meeting state
  if (userIsInMeeting) {
    console.log("User is actively in a meeting - showing active meeting card");
    return (
      <RequestCardContainer selectedUser={selectedUser} stopPropagation={stopPropagation}>
        <ActiveMeetingCard 
          user={user} 
          isMoving={isUserMoving} 
          onCancel={handleCancelMeeting}
          stopPropagation={stopPropagation} 
        />
      </RequestCardContainer>
    );
  }
  
  // If there's an existing pending request, show cancellation option
  if (existingRequest) {
    console.log("Showing pending request card for existing request");
    return (
      <RequestCardContainer selectedUser={selectedUser} stopPropagation={stopPropagation}>
        <PendingRequestCard
          user={user}
          existingRequest={existingRequest}
          onCancelRequest={handleCancelRequest}
          stopPropagation={stopPropagation}
        />
      </RequestCardContainer>
    );
  }
  
  // Otherwise, show the normal request card with time options
  console.log("Showing standard request card with time options");
  return (
    <RequestCardContainer selectedUser={selectedUser} stopPropagation={stopPropagation}>
      <UserRequestCard 
        user={user}
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        onSendRequest={(e) => {
          e.stopPropagation();
          handleSendRequest(e);
          onSendRequest();
        }}
        onCancel={(e) => {
          e.stopPropagation();
          onCancel();
        }}
      />
    </RequestCardContainer>
  );
};

export default MeetingRequestHandler;
