
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
  onCancel,
  nearbyUsers
}) => {
  // Find the selected user's data
  const userDetails = React.useMemo(() => {
    console.log("MeetingRequestHandler - Looking for user with ID:", selectedUser);
    console.log("MeetingRequestHandler - Available users:", nearbyUsers.map(u => ({ id: u.id, name: u.name })));
    
    if (!selectedUser) return null;
    
    const user = nearbyUsers.find(user => user.id === selectedUser);
    console.log("MeetingRequestHandler - Found user:", user ? user.name : 'not found');
    return user;
  }, [selectedUser, nearbyUsers]);

  // Don't render if no user is selected
  if (!selectedUser) {
    console.log("MeetingRequestHandler - No selectedUser, not rendering");
    return null;
  }

  // Don't render if user details not found
  if (!userDetails) {
    console.log("MeetingRequestHandler - User details not found for ID:", selectedUser);
    return null;
  }

  console.log("MeetingRequestHandler - Rendering UserRequestCard for:", userDetails.name);

  return (
    <UserRequestCard
      user={userDetails}
      onClose={onCancel}
    />
  );
};

export default MeetingRequestHandler;
