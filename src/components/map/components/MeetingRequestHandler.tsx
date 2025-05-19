
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
  // Component state tracking
  const mountedRef = useRef(false);
  const lastRenderedCardType = useRef<'none' | 'request' | 'pending' | 'active'>('none');
  
  // Get actions from our custom hook
  const {
    handleSendRequest,
    handleCancelRequest,
    handleCancelMeeting,
    findExistingRequest,
    isUserInMeetingState,
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
  
  // CRITICAL FIX: Reset meeting state when selectedUser changes
  useEffect(() => {
    // Mark component as mounted
    mountedRef.current = true;
    
    console.log(`MeetingRequestHandler mounted/updated for user: ${selectedUser}`);
    console.log("Moving users set:", Array.from(movingUsers));
    console.log("Completed moves set:", Array.from(completedMoves));
    
    // Critical cleanup: When user selection changes, ensure they're not in meeting state
    if (selectedUser && (selectedUser !== lastSelectedUserRef.current)) {
      console.log(`User selection changed from ${lastSelectedUserRef.current} to ${selectedUser}`);
      lastSelectedUserRef.current = selectedUser;
      
      // Clear the user from both sets - this is the key fix
      setMovingUsers(prev => {
        const next = new Set(prev);
        if (next.has(selectedUser)) {
          console.log(`Removing ${selectedUser} from movingUsers on selection change`);
          next.delete(selectedUser);
        }
        return next;
      });
      
      setCompletedMoves(prev => {
        const next = new Set(prev);
        if (next.has(selectedUser)) {
          console.log(`Removing ${selectedUser} from completedMoves on selection change`);
          next.delete(selectedUser);
        }
        return next;
      });
      
      // Force a re-render through empty state update to ensure UI consistency
      setTimeout(() => {
        console.log("Forcing UI refresh after state updates");
        setMovingUsers(prev => new Set(prev));
      }, 0);
    }
    
    return () => {
      // Reset on unmount
      lastRenderedCardType.current = 'none';
    };
  }, [selectedUser, setMovingUsers, setCompletedMoves]);
  
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
  
  // CRITICAL FIX: Use direct set membership checks for maximum reliability
  // These direct checks are more reliable than derived state
  const userInMovingSet = movingUsers.has(selectedUser);
  const userInCompletedSet = completedMoves.has(selectedUser);
  
  console.log("Direct set membership check for", user.name);
  console.log("- In movingUsers:", userInMovingSet);
  console.log("- In completedMoves:", userInCompletedSet);
  
  // Determine which card to show based on direct set membership checks
  let cardType: 'request' | 'pending' | 'active';
  
  if (userInMovingSet || userInCompletedSet) {
    cardType = 'active';
  } else if (existingRequest) {
    cardType = 'pending';
  } else {
    cardType = 'request';
  }
  
  // Log card type changes for debugging
  if (lastRenderedCardType.current !== cardType) {
    console.log(`Card changed from ${lastRenderedCardType.current} to ${cardType}`);
    lastRenderedCardType.current = cardType;
  }
  
  // Render appropriate card based on determined type
  if (cardType === 'active') {
    return (
      <RequestCardContainer selectedUser={selectedUser} stopPropagation={stopPropagation}>
        <ActiveMeetingCard 
          user={user} 
          isMoving={userInMovingSet} 
          onCancel={handleCancelMeeting}
          stopPropagation={stopPropagation} 
        />
      </RequestCardContainer>
    );
  }
  
  if (cardType === 'pending') {
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
  
  // Default - show the normal request card with time options
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
