
import React, { useEffect } from 'react';
import { AppUser, FriendRequest } from '@/context/types';
import Map from 'ol/Map';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';

// Import custom hooks
import { useMapMarkers } from '../../hooks/useMapMarkers';
import { useMapStyles } from '../../hooks/useMapStyles';
import { useMarkerVisibility } from '../../hooks/markers/useMarkerVisibility';

interface MapMarkerFeaturesProps {
  map: React.MutableRefObject<Map | null>;
  vectorSource: React.MutableRefObject<VectorSource | null>;
  vectorLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>;
  routeLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>;
  mapLoaded: boolean;
  currentUser: AppUser | null;
  nearbyUsers: AppUser[];
  selectedUser: string | null;
  movingUsers: Set<string>;
  completedMoves: Set<string>;
  friendRequests: FriendRequest[];
  radiusInKm: number;
  isTracking: boolean;
}

const MapMarkerFeatures: React.FC<MapMarkerFeaturesProps> = ({
  map,
  vectorSource,
  vectorLayer,
  routeLayer,
  mapLoaded,
  currentUser,
  nearbyUsers,
  selectedUser,
  movingUsers,
  completedMoves,
  friendRequests,
  radiusInKm,
  isTracking
}) => {
  // Get marker styles
  const { getMarkerStyle, WYNYARD_COORDS } = useMapMarkers(
    map,
    vectorSource,
    nearbyUsers,
    currentUser,
    selectedUser,
    movingUsers,
    completedMoves,
    mapLoaded,
    friendRequests,
    radiusInKm,
    isTracking
  );
  
  // Handle tracking state changes for marker visibility
  useMarkerVisibility(vectorSource, isTracking, mapLoaded);
  
  // Apply styling to map layers
  useMapStyles(
    vectorLayer,
    routeLayer,
    getMarkerStyle,
    selectedUser,
    movingUsers,
    completedMoves,
    friendRequests
  );

  return { WYNYARD_COORDS };
};

export default MapMarkerFeatures;
