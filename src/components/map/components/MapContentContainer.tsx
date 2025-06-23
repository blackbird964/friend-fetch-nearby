
import React from 'react';
import Map from 'ol/Map';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { AppUser, FriendRequest } from '@/context/types';

// Import map components
import MapFeatures from './MapFeatures';
import MeetingHandler from './MeetingHandler';
import LocationHandling from './LocationHandling';

interface MapContentContainerProps {
  map: React.MutableRefObject<Map | null>;
  vectorSource: React.MutableRefObject<VectorSource | null>;
  vectorLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>;
  routeLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>;
  mapLoaded: boolean;
  WYNYARD_COORDS: [number, number];
  currentUser: AppUser | null;
  nearbyUsers: AppUser[];
  friendRequests: FriendRequest[];
  radiusInKm: number;
  isManualMode: boolean;
  isTracking: boolean;
  isPrivacyModeEnabled: boolean;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
  movingUsers: Set<string>;
  setMovingUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  completedMoves: Set<string>;
  setCompletedMoves: React.Dispatch<React.SetStateAction<Set<string>>>;
  updateUserLocation: (userId: string, location: { lng: number; lat: number }) => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
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
  return (
    <div className="relative w-full h-full">
      <div
        id="map"
        className="w-full h-full"
        style={{ background: '#f8f9fa' }}
      />
      
      {/* Map Features */}
      <MapFeatures
        map={map}
        vectorSource={vectorSource}
        vectorLayer={vectorLayer}
        routeLayer={routeLayer}
        mapLoaded={mapLoaded}
        currentUser={currentUser}
        nearbyUsers={nearbyUsers}
        friendRequests={friendRequests}
        radiusInKm={radiusInKm}
        isTracking={isTracking}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        movingUsers={movingUsers}
        setMovingUsers={setMovingUsers}
        completedMoves={completedMoves}
        setCompletedMoves={setCompletedMoves}
      />

      {/* Meeting Handler */}
      <MeetingHandler
        vectorSource={vectorSource}
        routeLayer={routeLayer}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        movingUsers={movingUsers}
        setMovingUsers={setMovingUsers}
        completedMoves={completedMoves}
        setCompletedMoves={setCompletedMoves}
        nearbyUsers={nearbyUsers}
        WYNYARD_COORDS={WYNYARD_COORDS}
      />

      {/* Location Handling */}
      <LocationHandling
        map={map}
        mapLoaded={mapLoaded}
        currentUser={currentUser}
        updateUserLocation={updateUserLocation}
        setCurrentUser={setCurrentUser}
        radiusInKm={radiusInKm}
        setRadiusInKm={() => {}} // No-op function since radius controls are removed
        isManualMode={isManualMode}
        isTracking={isTracking}
        isPrivacyModeEnabled={isPrivacyModeEnabled}
      />
    </div>
  );
};

export default MapContentContainer;
