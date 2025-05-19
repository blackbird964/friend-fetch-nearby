
import React, { useEffect } from 'react';
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
  // Debug selected user changes
  useEffect(() => {
    console.log("MapFeatures - selectedUser changed:", selectedUser);
    console.log("MapFeatures - movingUsers:", Array.from(movingUsers));
    console.log("MapFeatures - completedMoves:", Array.from(completedMoves));
    
    // Debug to see if user is actually in the sets
    if (selectedUser) {
      console.log("Is selected user in movingUsers?", movingUsers.has(selectedUser));
      console.log("Is selected user in completedMoves?", completedMoves.has(selectedUser));
    }
  }, [selectedUser, movingUsers, completedMoves]);

  // State for meeting request duration
  const [selectedDuration, setSelectedDuration] = React.useState<number>(30);

  // Apply marker features
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
          onSendRequest={() => {
            console.log("Sending request to user:", selectedUser, "for duration:", selectedDuration);
          }}
          onCancel={() => {
            console.log("Cancelling request, deselecting user:", selectedUser);
            setSelectedUser(null);
          }}
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
