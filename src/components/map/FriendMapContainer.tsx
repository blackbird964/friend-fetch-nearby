
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

// Import custom hooks
import { useMapInitialization } from './hooks/useMapInitialization';
import { useMapMarkers } from './hooks/useMapMarkers';

// Import refactored components
import MapContainer from './components/MapContainer';
import MapFeatures from './components/MapFeatures';
import LocationHandling from './components/LocationHandling';
import MeetingHandler from './components/MeetingHandler';

interface FriendMapContainerProps {
  isManualMode: boolean;
  isTracking: boolean;
  isPrivacyModeEnabled: boolean;
}

const FriendMapContainer: React.FC<FriendMapContainerProps> = ({
  isManualMode,
  isTracking,
  isPrivacyModeEnabled
}) => {
  const { toast } = useToast();
  const { 
    currentUser, 
    nearbyUsers, 
    radiusInKm, 
    setRadiusInKm, 
    setCurrentUser, 
    updateUserLocation,
    refreshNearbyUsers,
    friendRequests 
  } = useAppContext();
  
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [movingUsers, setMovingUsers] = useState<Set<string>>(new Set());
  const [completedMoves, setCompletedMoves] = useState<Set<string>>(new Set());

  // Initialize map with references
  const { 
    mapContainer, 
    map, 
    vectorSource, 
    vectorLayer, 
    routeLayer, 
    mapLoaded 
  } = useMapInitialization();

  // Get marker styles and handle marker updates
  const { WYNYARD_COORDS } = useMapMarkers(
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

  // Log radius changes to help with debugging
  useEffect(() => {
    console.log("FriendMapContainer - Current radiusInKm:", radiusInKm);
  }, [radiusInKm]);

  // Refresh nearby users when map is loaded and we have current user location
  useEffect(() => {
    if (mapLoaded && currentUser?.location) {
      console.log("Map loaded and user has location, refreshing nearby users");
      refreshNearbyUsers(false);
    }
  }, [mapLoaded, currentUser?.location, refreshNearbyUsers]);

  // Force a refresh when radiusInKm changes
  useEffect(() => {
    if (mapLoaded && currentUser?.location) {
      console.log("Radius changed to", radiusInKm, "km, refreshing nearby users");
      refreshNearbyUsers(false);
    }
  }, [radiusInKm, mapLoaded, currentUser?.location, refreshNearbyUsers]);
  
  // Force a refresh when manual mode changes
  useEffect(() => {
    console.log("Manual mode changed:", isManualMode);
  }, [isManualMode]);

  return (
    <MapContainer>
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
        WYNYARD_COORDS={WYNYARD_COORDS as [number, number]}
      />
    </MapContainer>
  );
};

export default FriendMapContainer;
