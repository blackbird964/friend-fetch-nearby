
import React, { useEffect, useRef } from 'react';
import { AppUser, FriendRequest } from '@/context/types';
import Map from 'ol/Map';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';

// Import refactored components
import {
  MapMarkerFeatures,
  MapCircleFeatures,
  MapEventListeners,
  RadiusChangeMonitor,
  LocationChangeMonitor
} from './map-features';
import MeetingRequestHandler from './MeetingRequestHandler';
import { WYNYARD_COORDS } from '../hooks/map/useMapConfig';

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
  setMovingUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  setCompletedMoves: React.Dispatch<React.SetStateAction<Set<string>>>;
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
  isTracking,
  setMovingUsers,
  setCompletedMoves
}) => {
  // Refs to track component lifecycle and selection changes
  const mountedRef = useRef(false);
  const prevSelectedUserRef = useRef<string | null>(null);
  
  // Log when component mounts or selectedUser changes
  useEffect(() => {
    const mounted = mountedRef.current;
    mountedRef.current = true;
    
    console.log(`[MapFeatures] selectedUser changed: ${selectedUser}, previously: ${prevSelectedUserRef.current}`);
    
    // If selectedUser changed, ensure they aren't in meeting state
    if (selectedUser !== prevSelectedUserRef.current) {
      console.log(`[MapFeatures] User selection changed - cleaning up meeting state`);
      
      // Reset meeting state for any previously selected user
      if (prevSelectedUserRef.current) {
        setMovingUsers(prev => {
          const next = new Set(prev);
          if (next.has(prevSelectedUserRef.current!)) {
            console.log(`[MapFeatures] Removing ${prevSelectedUserRef.current} from movingUsers`);
            next.delete(prevSelectedUserRef.current!);
          }
          return next;
        });
        
        setCompletedMoves(prev => {
          const next = new Set(prev);
          if (next.has(prevSelectedUserRef.current!)) {
            console.log(`[MapFeatures] Removing ${prevSelectedUserRef.current} from completedMoves`);
            next.delete(prevSelectedUserRef.current!);
          }
          return next;
        });
      }
      
      // Important: clear any possible route lines
      if (routeLayer.current?.getSource()) {
        routeLayer.current.getSource().clear();
      }
    }
    
    // Update previous selection ref
    prevSelectedUserRef.current = selectedUser;
    
    return () => {
      // Reset on unmount
      console.log("[MapFeatures] Component unmounting");
    };
  }, [selectedUser, setMovingUsers, setCompletedMoves, routeLayer]);

  // State for meeting request duration
  const [selectedDuration, setSelectedDuration] = React.useState<number>(30);
  
  // Handle canceling selection
  const handleCancel = React.useCallback(() => {
    console.log("[MapFeatures] Canceling selection, current selectedUser:", selectedUser);
    setSelectedUser(null);
  }, [selectedUser, setSelectedUser]);

  return (
    <>
      {/* Add marker features */}
      <MapMarkerFeatures
        map={map}
        vectorSource={vectorSource}
        vectorLayer={vectorLayer}
        routeLayer={routeLayer}
        mapLoaded={mapLoaded}
        currentUser={currentUser}
        nearbyUsers={nearbyUsers}
        selectedUser={selectedUser}
        movingUsers={movingUsers}
        completedMoves={completedMoves}
        friendRequests={friendRequests}
        radiusInKm={radiusInKm}
        isTracking={isTracking}
      />
      
      {/* Add circle features (radius & privacy) */}
      <MapCircleFeatures
        map={map}
        vectorSource={vectorSource}
        currentUser={currentUser}
        radiusInKm={radiusInKm}
        isTracking={isTracking}
      />
      
      {/* Add map event listeners */}
      <MapEventListeners
        map={map}
        mapLoaded={mapLoaded}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        movingUsers={movingUsers}
        completedMoves={completedMoves}
        vectorLayer={vectorLayer}
        friendRequests={friendRequests}
        currentUser={currentUser}
      />
      
      {/* Monitor radius changes */}
      <RadiusChangeMonitor radiusInKm={radiusInKm} />
      
      {/* Monitor location changes */}
      <LocationChangeMonitor />

      {/* Only render the MeetingRequestHandler when a user is selected */}
      {selectedUser && (
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
      )}
    </>
  );
};

export default MapFeatures;
