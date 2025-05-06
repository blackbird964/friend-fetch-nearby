
import React from 'react';
import { AppUser } from '@/context/types';
import { useMeetingAnimation } from '../hooks/useMeetingAnimation';
import { useMeetingRequestHandler } from '../hooks/useMeetingRequestHandler';
import MeetingRequestHandler from './MeetingRequestHandler';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';

type MeetingHandlerProps = {
  vectorSource: React.MutableRefObject<VectorSource | null>;
  routeLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
  movingUsers: Set<string>;
  setMovingUsers: (users: Set<string>) => void;
  completedMoves: Set<string>;
  setCompletedMoves: (users: Set<string>) => void;
  nearbyUsers: AppUser[];
  WYNYARD_COORDS: [number, number];
};

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
  // Handle meeting animations
  const { animateUserToMeeting } = useMeetingAnimation(
    vectorSource,
    routeLayer,
    setMovingUsers,
    setCompletedMoves,
    setSelectedUser,
    WYNYARD_COORDS
  );
  
  // Handle meeting request functionality
  const { handleSendRequest } = useMeetingRequestHandler({
    selectedUser,
    nearbyUsers,
    animateUserToMeeting
  });

  return (
    <MeetingRequestHandler
      selectedUser={selectedUser}
      selectedDuration={selectedDuration}
      setSelectedDuration={setSelectedDuration}
      onSendRequest={() => handleSendRequest(selectedDuration)}
      onCancel={() => setSelectedUser(null)}
      nearbyUsers={nearbyUsers}
      movingUsers={movingUsers}
      completedMoves={completedMoves}
      setMovingUsers={setMovingUsers}
      setCompletedMoves={setCompletedMoves}
    />
  );
};

export default MeetingHandler;
