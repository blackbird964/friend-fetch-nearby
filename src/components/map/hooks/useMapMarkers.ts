
import { useRef } from 'react';
import { AppUser } from '@/context/types';
import { Vector as VectorSource } from 'ol/source';
import Map from 'ol/Map';
import { useMarkerStyles } from './markers/useMarkerStyles';
import { useMarkerUpdater } from './markers/useMarkerUpdater';
import { WYNYARD_COORDS } from './useMapInitialization';

export const useMapMarkers = (
  map: React.MutableRefObject<Map | null>,
  vectorSource: React.MutableRefObject<VectorSource | null>,
  nearbyUsers: AppUser[],
  currentUser: AppUser | null,
  selectedUser: string | null,
  movingUsers: Set<string>,
  completedMoves: Set<string>,
  mapLoaded: boolean
) => {
  // Get marker styles
  const { getMarkerStyle } = useMarkerStyles(selectedUser, movingUsers, completedMoves);
  
  // Update markers when data changes
  useMarkerUpdater(vectorSource, nearbyUsers, currentUser, mapLoaded);

  return { getMarkerStyle, WYNYARD_COORDS };
};
