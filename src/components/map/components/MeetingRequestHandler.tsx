
import React from 'react';
import { AppUser } from '@/context/types';
import UserRequestCard from './UserRequestCard';

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
  nearbyUsers
}) => {
  // Find the selected user's data
  const userDetails = React.useMemo(() => {
    console.log("Looking for user with ID:", selectedUser);
    console.log("Available users:", nearbyUsers.map(u => ({ id: u.id, name: u.name })));
    return nearbyUsers.find(user => user.id === selectedUser);
  }, [selectedUser, nearbyUsers]);

  // Handle cancel with proper event handling
  const handleCancel = (e: React.MouseEvent) => {
    console.log("Cancel handler called in MeetingRequestHandler");
    onCancel();
  };

  // Log when component renders
  React.useEffect(() => {
    console.log("MeetingRequestHandler rendered with selectedUser:", selectedUser);
    console.log("User details found:", userDetails ? userDetails.name : "Not found");
  }, [selectedUser, userDetails]);

  // Don't render if no user is selected or user details not found
  if (!selectedUser || !userDetails) {
    console.log("Not rendering card - no selectedUser or userDetails not found");
    return null;
  }

  return (
    <UserRequestCard
      user={userDetails}
      selectedDuration={selectedDuration}
      setSelectedDuration={setSelectedDuration}
      onCancel={handleCancel}
    />
  );
};

export default MeetingRequestHandler;
