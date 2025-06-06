import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { AppUser } from '@/context/types';
import MeetingRequestHandler from './MeetingRequestHandler';
import { useToast } from '@/hooks/use-toast';

interface MeetingHandlerProps {
  vectorSource: any;
  routeLayer: any;
  selectedUser: string | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<string | null>>;
  selectedDuration: number;
  setSelectedDuration: React.Dispatch<React.SetStateAction<number>>;
  movingUsers: Set<string>;
  setMovingUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  completedMoves: Set<string>;
  setCompletedMoves: React.Dispatch<React.SetStateAction<Set<string>>>;
  nearbyUsers: AppUser[];
  WYNYARD_COORDS: [number, number];
}

const MeetingHandler: React.FC<MeetingHandlerProps> = ({
  vectorSource,
  routeLayer,
  selectedUser,
  setSelectedUser,
  selectedDuration, 
  setSelectedDuration,
  movingUsers,
  setMovingUsers,
  completedMoves,
  setCompletedMoves,
  nearbyUsers,
  WYNYARD_COORDS
}) => {
  const { toast } = useToast();
  const { friendRequests } = useAppContext();
  const [requestSent, setRequestSent] = useState(false);

  // Handle cancel request
  const handleCancel = () => {
    console.log("Cancel request");
    setSelectedUser(null);
    setMovingUsers(new Set());
    setCompletedMoves(new Set());
  };

  return (
    <>
      {/* Request handler component for showing the user request UI */}
      <MeetingRequestHandler 
        selectedUser={selectedUser}
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        onCancel={handleCancel}
        nearbyUsers={nearbyUsers}
        movingUsers={movingUsers}
        completedMoves={completedMoves}
        setMovingUsers={setMovingUsers}
        setCompletedMoves={setCompletedMoves}
      />
    </>
  );
};

export default MeetingHandler;
