
import React, { useEffect } from 'react';
import { AppUser, FriendRequest } from '@/context/types';
import Map from 'ol/Map';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';

// Import custom hooks
import { useMapMarkers } from '../hooks/useMapMarkers';
import { useMapStyles } from '../hooks/useMapStyles';
import { useRadiusCircle } from '../hooks/useRadiusCircle';
import { usePrivacyCircle } from '../hooks/usePrivacyCircle';
import { useMapEvents } from '../hooks/useMapEvents';

type MapFeaturesProps = {
  map: React.MutableRefObject<Map | null>;
  vectorSource: React.MutableRefObject<VectorSource | null>;
  vectorLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>;
  routeLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>;
  mapLoaded: boolean;
  currentUser: AppUser | null;
  nearbyUsers: AppUser[];
  radiusInKm: number;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  movingUsers: Set<string>;
  completedMoves: Set<string>;
  friendRequests: FriendRequest[];
};

const MapFeatures: React.FC<MapFeaturesProps> = ({
  map,
  vectorSource,
  vectorLayer,
  routeLayer,
  mapLoaded,
  currentUser,
  nearbyUsers,
  radiusInKm,
  selectedUser,
  setSelectedUser,
  movingUsers,
  completedMoves,
  friendRequests
}) => {
  // Log radius changes to help with debugging
  useEffect(() => {
    console.log("MapFeatures - radiusInKm changed:", radiusInKm);
  }, [radiusInKm]);

  // Initialize map layers and features
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
    radiusInKm
  );

  // Initialize radius circle - make sure we're passing the correct radiusInKm
  const { radiusLayer, radiusFeature } = useRadiusCircle(
    map,
    vectorSource,
    currentUser,
    radiusInKm
  );
  
  // Initialize privacy circle for the current user
  const { privacyLayer, privacyFeature } = usePrivacyCircle(
    map,
    vectorSource,
    currentUser
  );

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

  // Add map click handlers
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

  return null; // This component doesn't render any UI elements
};

export default MapFeatures;
