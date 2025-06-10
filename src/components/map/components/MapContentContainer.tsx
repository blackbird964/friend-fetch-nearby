
import React from 'react';
import { AppUser, FriendRequest } from '@/context/types';
import Map from 'ol/Map';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import MapFeatures from './MapFeatures';
import LocationHandling from './LocationHandling';
import MapControls from './MapControls';
import MeetingHandler from './MeetingHandler';
import MapControlPanel from './MapControlPanel';

interface MapContentContainerProps {
  // Map refs
  map: React.MutableRefObject<Map | null>;
  vectorSource: React.MutableRefObject<VectorSource | null>;
  vectorLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>;
  routeLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>;
  mapLoaded: boolean;
  WYNYARD_COORDS: [number, number];
  
  // User data
  currentUser: AppUser | null;
  nearbyUsers: AppUser[];
  friendRequests: FriendRequest[];
  
  // Settings
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
  isManualMode: boolean;
  isTracking: boolean;
  isPrivacyModeEnabled: boolean;
  
  // UI state
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
  movingUsers: Set<string>;
  setMovingUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  completedMoves: Set<string>;
  setCompletedMoves: React.Dispatch<React.SetStateAction<Set<string>>>;
  
  // Functions
  updateUserLocation: (userId: string, location: { lat: number; lng: number }) => Promise<void>;
  setCurrentUser: (user: AppUser) => void;
}

const MapContentContainer: React.FC<MapContentContainerProps> = ({
  map,
  vectorSource,
  vectorLayer,
  routeLayer,
  mapLoaded,
  WYNYARD_COORDS,
  currentUser,
  nearbyUsers,
  friendRequests,
  radiusInKm,
  setRadiusInKm,
  isManualMode,
  isTracking,
  isPrivacyModeEnabled,
  selectedUser,
  setSelectedUser,
  selectedDuration,
  setSelectedDuration,
  movingUsers,
  setMovingUsers,
  completedMoves,
  setCompletedMoves,
  updateUserLocation,
  setCurrentUser
}) => {
  // Debug state on render
  console.log("[MapContentContainer] Current state:");
  console.log("- selectedUser:", selectedUser);
  console.log("- movingUsers:", Array.from(movingUsers));
  console.log("- completedMoves:", Array.from(completedMoves));

  return (
    <>
      <MapFeatures 
        map={map}
        vectorSource={vectorSource}
        vectorLayer={vectorLayer}
        routeLayer={routeLayer}
        mapLoaded={mapLoaded}
        currentUser={currentUser}
        nearbyUsers={nearbyUsers}
        radiusInKm={radiusInKm}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        movingUsers={movingUsers}
        completedMoves={completedMoves}
        friendRequests={friendRequests}
        isTracking={isTracking}
        setMovingUsers={setMovingUsers}
        setCompletedMoves={setCompletedMoves}
      />
      
      <LocationHandling 
        map={map}
        mapLoaded={mapLoaded}
        currentUser={currentUser}
        updateUserLocation={updateUserLocation}
        setCurrentUser={setCurrentUser}
        radiusInKm={radiusInKm}
        setRadiusInKm={setRadiusInKm}
        isManualMode={isManualMode}
        isTracking={isTracking}
        isPrivacyModeEnabled={isPrivacyModeEnabled}
      />
      
      <MapControls
        map={map}
        mapLoaded={mapLoaded}
        currentUser={currentUser}
        isManualMode={isManualMode}
        isTracking={isTracking}
        isPrivacyModeEnabled={isPrivacyModeEnabled}
        radiusInKm={radiusInKm}
        setRadiusInKm={setRadiusInKm}
        updateUserLocation={updateUserLocation}
        setCurrentUser={setCurrentUser}
      />
      
      {/* Modified to ONLY handle route visualization */}
      <MeetingHandler 
        vectorSource={vectorSource}
        routeLayer={routeLayer}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        movingUsers={new Set()} // IMPORTANT: Pass empty sets to prevent state changes
        setMovingUsers={(prev) => prev} // No-op function to prevent state changes
        completedMoves={new Set()} // IMPORTANT: Pass empty sets to prevent state changes
        setCompletedMoves={(prev) => prev} // No-op function to prevent state changes
        nearbyUsers={nearbyUsers}
        WYNYARD_COORDS={WYNYARD_COORDS}
      />

      <MapControlPanel
        radiusInKm={radiusInKm}
        setRadiusInKm={setRadiusInKm}
      />
    </>
  );
};

export default MapContentContainer;
