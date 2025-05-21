
import React from 'react';
import { AppUser } from '@/context/types';
import UserRequestCard from './UserRequestCard';
import RequestCardContainer from './meeting-cards/RequestCardContainer';

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
  // Find the selected user's data
  const userDetails = React.useMemo(() => {
    if (!selectedUser) return null;
    console.log("Looking for user with ID:", selectedUser);
    console.log("Available users:", nearbyUsers.map(u => ({ id: u.id, name: u.name })));
    const user = nearbyUsers.find(user => user.id === selectedUser);
    console.log("Found user:", user ? user.name : "Not found");
    return user;
  }, [selectedUser, nearbyUsers]);

  // Handle click to prevent propagation to map
  const stopPropagation = (e: React.MouseEvent) => {
    console.log("Stopping propagation on request card container");
    e.stopPropagation();
  };
  
  // Handle cancel with proper event handling
  const handleCancel = (e: React.MouseEvent) => {
    console.log("Cancel handler called in MeetingRequestHandler");
    e.stopPropagation();
    onCancel();
  };

  // Don't render if no user is selected or user details not found
  if (!selectedUser || !userDetails) {
    console.log("Not rendering card - no selectedUser or userDetails not found");
    return null;
  }

  return (
    <RequestCardContainer 
      selectedUser={selectedUser}
      stopPropagation={stopPropagation}
    >
      <UserRequestCard
        user={userDetails}
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        onCancel={handleCancel}
      />
    </RequestCardContainer>
  );
};

export default MeetingRequestHandler;
