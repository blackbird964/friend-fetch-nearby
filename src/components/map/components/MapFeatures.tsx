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
  isTracking: boolean;
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
  friendRequests,
  isTracking
}) => {
  // Log tracking changes to debug the marker visibility issue
  useEffect(() => {
    console.log("MapFeatures - isTracking changed:", isTracking);
  }, [isTracking]);

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
    radiusInKm,
    isTracking
  );

  // Initialize radius circle with current radius value and make it responsive to changes
  const { radiusLayer, radiusFeature } = useRadiusCircle(
    map,
    vectorSource,
    currentUser,
    radiusInKm
  );
  
  // Listen for tracking changes to update markers visibility
  useEffect(() => {
    if (isTracking === false && vectorSource.current) {
      // When tracking is turned off, clear all user markers
      const features = vectorSource.current.getFeatures();
      features.forEach(feature => {
        const isCircle = feature.get('isCircle');
        const isUserMarker = feature.get('isCurrentUser') || feature.get('userId');
        if (!isCircle && isUserMarker) {
          vectorSource.current?.removeFeature(feature);
        }
      });
    }
  }, [isTracking, vectorSource]);

  // Listen for radius changes from slider or other components
  useEffect(() => {
    const handleRadiusChange = (e: any) => {
      console.log("Radius change event detected:", e.detail);
      // The useRadiusCircle hook will handle the update based on the radiusInKm prop
    };
    
    window.addEventListener('radius-changed', handleRadiusChange);
    
    return () => {
      window.removeEventListener('radius-changed', handleRadiusChange);
    };
  }, [radiusInKm]);
  
  // Listen for user location changes 
  useEffect(() => {
    const handleLocationChange = () => {
      console.log("User location changed event detected");
      // The radius circle will update based on the currentUser.location change
    };
    
    window.addEventListener('user-location-changed', handleLocationChange);
    
    return () => {
      window.removeEventListener('user-location-changed', handleLocationChange);
    };
  }, []);
  
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
