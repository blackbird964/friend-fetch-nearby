
import { useRef } from 'react';
import { AppUser, FriendRequest } from '@/context/types';
import { Vector as VectorSource } from 'ol/source';
import Map from 'ol/Map';
import { useMarkerStyles } from './markers/useMarkerStyles';
import { useMarkerUpdater } from './markers/useMarkerUpdater';

export const useMapMarkers = (
  map: React.MutableRefObject<Map | null>,
  vectorSource: React.MutableRefObject<VectorSource | null>,
  nearbyUsers: AppUser[],
  currentUser: AppUser | null,
  selectedUser: string | null,
  movingUsers: Set<string>,
  completedMoves: Set<string>,
  mapLoaded: boolean,
  friendRequests: FriendRequest[],
  radiusInKm: number,
  isTracking: boolean = true
) => {
  // Get marker styles
  const { getMarkerStyle } = useMarkerStyles(selectedUser, movingUsers, completedMoves, friendRequests);
  
  // Update markers when data changes - make sure to pass radiusInKm and isTracking
  useMarkerUpdater(vectorSource, nearbyUsers, currentUser, mapLoaded, radiusInKm, isTracking);

  return { getMarkerStyle };
};
