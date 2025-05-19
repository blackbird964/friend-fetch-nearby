
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
  onCancel,
  nearbyUsers,
  movingUsers,
  completedMoves,
  setMovingUsers,
  setCompletedMoves
}) => {
  // Component state tracking
  const mountedRef = useRef(false);
  const cardTypeRef = useRef<'request' | 'pending' | 'active'>('request');
  
  // Get actions from our custom hook
  const {
    handleCancelRequest,
    findExistingRequest,
    resetMeetingStates,
    initialRenderRef,
    lastSelectedUserRef
  } = useMeetingRequestActions(
    selectedUser, 
    movingUsers, 
    completedMoves, 
    setMovingUsers, 
    setCompletedMoves,
    onCancel
  );
  
  // CRITICAL FIX: On mount and when selectedUser changes, 
  // ensure we reset all meeting states
  useEffect(() => {
    // Mark component as mounted
    if (!mountedRef.current) {
      mountedRef.current = true;
      console.log("MeetingRequestHandler mounted for first time");
    }
    
    console.log(`MeetingRequestHandler updated for user: ${selectedUser}`);
    console.log("Moving users set:", Array.from(movingUsers));
    console.log("Completed moves set:", Array.from(completedMoves));
    
    // Critical cleanup: When user selection changes, reset all meeting states
    if (selectedUser && (selectedUser !== lastSelectedUserRef.current)) {
      console.log(`User selection changed from ${lastSelectedUserRef.current} to ${selectedUser}`);
      lastSelectedUserRef.current = selectedUser;
      
      // IMPORTANT: Always reset states when component mounts or user changes
      resetMeetingStates();
      
      // Hard-code the card type to always be 'request'
      cardTypeRef.current = 'request';
    }
    
    return () => {
      // Reset on unmount
      console.log("MeetingRequestHandler unmounted");
    };
  }, [selectedUser, resetMeetingStates]);
  
  // CRITICAL FIX: Additional cleanup effect to run on every render
  useEffect(() => {
    // This runs on every render to force the correct card type
    cardTypeRef.current = 'request';
    
    // Force clear all meeting states
    if (selectedUser) {
      resetMeetingStates();
    }
  });
  
  // Stop propagation on all click events to prevent deselection
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // If no user is selected, don't render anything
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
  
  // Find any existing request
  const existingRequest = findExistingRequest(selectedUser);
  
  // CRITICAL FIX: Override automatic card type determination
  // Always show the request card unless there's a pending request
  let cardType: 'request' | 'pending' | 'active';
  
  if (existingRequest) {
    cardType = 'pending';
  } else {
    // FORCE request card type, never show active
    cardType = 'request';
  }
  
  console.log(`Determined card type: ${cardType}`);
  cardTypeRef.current = cardType;
  
  // Handle explicit cancel action
  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel();
  };
  
  // Render appropriate card based on determined type
  if (cardType === 'pending' && existingRequest) {
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
  
  // Default - show the normal request card with time options
  return (
    <RequestCardContainer selectedUser={selectedUser} stopPropagation={stopPropagation}>
      <UserRequestCard 
        user={user}
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        onCancel={handleCancel}
      />
    </RequestCardContainer>
  );
};

export default MeetingRequestHandler;
