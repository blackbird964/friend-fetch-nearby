import React, { useEffect, useRef } from 'react';
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
  // Keep track of whether component has mounted
  const hasMounted = useRef(false);
  const lastRenderedCardType = useRef<'none' | 'request' | 'pending' | 'active'>('none');
  
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
    // Mark component as mounted
    hasMounted.current = true;
    
    console.log("MeetingRequestHandler rendering with selectedUser:", selectedUser);
    console.log("Moving users:", Array.from(movingUsers));
    console.log("Completed moves:", Array.from(completedMoves));
    
    // Make sure we're clearing any active meeting state for this user
    if (selectedUser && hasMounted.current) {
      console.log("Ensuring selected user is not in meeting state on mount");
    }
    
    return () => {
      // Clean up on unmount
      lastRenderedCardType.current = 'none';
    };
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
  
  // Standalone check for meeting state outside of the getUserMeetingState function
  // to avoid any potential state inconsistencies
  const userInMovingSet = movingUsers.has(selectedUser);
  const userInCompletedSet = completedMoves.has(selectedUser);
  const userIsInMeetingState = userInMovingSet || userInCompletedSet;
  
  console.log("Direct set membership check:");
  console.log("- User in movingUsers:", userInMovingSet);
  console.log("- User in completedMoves:", userInCompletedSet);
  console.log("- User in meeting state:", userIsInMeetingState);
  
  // Using the helper function for consistency
  const userIsInMeeting = isUserInMeeting(selectedUser);
  console.log("Hook check - User in meeting state:", userIsInMeeting);
  
  // Determine which card to show and log the decision
  let cardToRender: 'request' | 'pending' | 'active' = 'request'; // Default to request card
  
  if (userIsInMeeting) {
    cardToRender = 'active';
    console.log("DECISION: Showing active meeting card");
  } else if (existingRequest) {
    cardToRender = 'pending';
    console.log("DECISION: Showing pending request card");
  } else {
    cardToRender = 'request';
    console.log("DECISION: Showing standard request card");
  }
  
  // Track the rendered card type for debugging
  if (lastRenderedCardType.current !== cardToRender) {
    console.log(`Card type changed from ${lastRenderedCardType.current} to ${cardToRender}`);
    lastRenderedCardType.current = cardToRender;
  }
  
  // Only show the active meeting card if the user is explicitly in a meeting state
  // Use the direct set check for reliability
  if (cardToRender === 'active') {
    // Get the detailed meeting state for UI purposes
    const { isUserMoving, hasUserMoved } = getUserMeetingState(selectedUser);
    
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
  if (cardToRender === 'pending') {
    return (
      <RequestCardContainer selectedUser={selectedUser} stopPropagation={stopPropagation}>
        <PendingRequestCard
          user={user}
          existingRequest={existingRequest!}
          onCancelRequest={handleCancelRequest}
          stopPropagation={stopPropagation}
        />
      </RequestCardContainer>
    );
  }
  
  // Otherwise, show the normal request card with time options
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
