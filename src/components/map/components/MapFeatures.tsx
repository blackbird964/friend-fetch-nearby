
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
import { useMarkerVisibility } from '../hooks/markers/useMarkerVisibility';
import MeetingRequestHandler from './MeetingRequestHandler';

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
  // Debug selected user changes
  useEffect(() => {
    console.log("MapFeatures - selectedUser changed:", selectedUser);
  }, [selectedUser]);

  // Log tracking changes to debug the marker visibility issue
  useEffect(() => {
    console.log("MapFeatures - isTracking changed:", isTracking);
  }, [isTracking]);

  // State for meeting request duration
  const [selectedDuration, setSelectedDuration] = React.useState<number>(30);
  
  // Debug moving users
  useEffect(() => {
    console.log("MapFeatures - movingUsers:", Array.from(movingUsers));
    console.log("MapFeatures - completedMoves:", Array.from(completedMoves));
  }, [movingUsers, completedMoves]);

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
  // Pass isTracking to control visibility
  const { radiusLayer, radiusFeature } = useRadiusCircle(
    map,
    vectorSource,
    currentUser,
    radiusInKm,
    isTracking
  );
  
  // Handle tracking state changes for marker visibility
  useMarkerVisibility(vectorSource, isTracking, mapLoaded);
  
  // Listen for radius changes from slider or other components
  useEffect(() => {
    console.log("MapFeatures - radiusInKm changed:", radiusInKm);
    
    const handleRadiusChange = (e: any) => {
      const customEvent = e as CustomEvent;
      console.log("MapFeatures - Radius change event detected:", customEvent.detail);
    };
    
    window.addEventListener('radius-changed', handleRadiusChange);
    
    return () => {
      window.removeEventListener('radius-changed', handleRadiusChange);
    };
  }, [radiusInKm]);
  
  // Listen for user location changes 
  useEffect(() => {
    const handleLocationChange = () => {
      console.log("MapFeatures - User location changed event detected");
    };
    
    window.addEventListener('user-location-changed', handleLocationChange);
    
    return () => {
      window.removeEventListener('user-location-changed', handleLocationChange);
    };
  }, []);
  
  // Initialize privacy circle for the current user with improved visibility
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

  // Handle sending a meeting request
  const handleSendRequest = () => {
    console.log("Sending request to user:", selectedUser, "for duration:", selectedDuration);
    // Logic for sending a request will be handled by MeetingHandler
  };

  // Handle cancelling a request
  const handleCancelRequest = () => {
    console.log("Cancelling request, deselecting user:", selectedUser);
    setSelectedUser(null);
  };

  return (
    <>
      {/* Only render the MeetingRequestHandler when a user is selected */}
      {selectedUser && (
        <MeetingRequestHandler
          selectedUser={selectedUser}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          onSendRequest={handleSendRequest}
          onCancel={handleCancelRequest}
          nearbyUsers={nearbyUsers}
          movingUsers={movingUsers}
          completedMoves={completedMoves}
          // Make sure we pass functions that handle Set updates properly
          setMovingUsers={(newSet: React.SetStateAction<Set<string>>) => {
            console.log("Setting moving users to:", newSet);
            // This function is just a placeholder as we don't manage the sets here
          }}
          setCompletedMoves={(newSet: React.SetStateAction<Set<string>>) => {
            console.log("Setting completed moves to:", newSet);
            // This function is just a placeholder as we don't manage the sets here
          }}
        />
      )}
    </>
  );
};

export default MapFeatures;
