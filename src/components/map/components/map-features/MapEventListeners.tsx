
import React, { useEffect } from 'react';
import { AppUser, FriendRequest } from '@/context/types';
import Map from 'ol/Map';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';

// Import custom hooks
import { useMapEvents } from '../../hooks/useMapEvents';

interface MapEventListenersProps {
  map: React.MutableRefObject<Map | null>;
  mapLoaded: boolean;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  movingUsers: Set<string>;
  completedMoves: Set<string>;
  vectorLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>;
  friendRequests: FriendRequest[];
  currentUser: AppUser | null;
}

const MapEventListeners: React.FC<MapEventListenersProps> = ({
  map,
  mapLoaded,
  selectedUser,
  setSelectedUser,
  movingUsers,
  completedMoves,
  vectorLayer,
  friendRequests,
  currentUser
}) => {
  // Add map click handlers for user interactions
  useMapEvents(
    map,
    mapLoaded,
    selectedUser,
    setSelectedUser,
    movingUsers,
    completedMoves,
    vectorLayer,
    friendRequests,
    currentUser
  );

  return null;
};

export default MapEventListeners;
