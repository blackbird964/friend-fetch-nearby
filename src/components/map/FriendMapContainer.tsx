
import React from 'react';
import { useAppContext } from '@/context/AppContext';

// Import custom hooks
import { useMapInitialization } from './hooks/useMapInitialization';
import { useMapUIState } from './hooks/useMapUIState';
import { usePrivacyMode } from './hooks/usePrivacyMode';

// Import refactored components
import MapContainer from './components/MapContainer';
import MapFeatures from './components/MapFeatures';
import LocationHandling from './components/LocationHandling';
import MeetingHandler from './components/MeetingHandler';
import MapControlPanel from './components/MapControlPanel';
import MapControls from './components/MapControls';

interface FriendMapContainerProps {
  isManualMode: boolean;
  isTracking: boolean;
  isPrivacyModeEnabled: boolean;
}

const FriendMapContainer: React.FC<FriendMapContainerProps> = ({
  isManualMode,
  isTracking,
  isPrivacyModeEnabled: initialPrivacyEnabled
}) => {
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
  
  // Initialize map with references
  const { 
    mapContainer, 
    map, 
    vectorSource, 
    vectorLayer, 
    routeLayer, 
    mapLoaded,
    WYNYARD_COORDS
  } = useMapInitialization();

  // Privacy mode management
  const { isPrivacyModeEnabled, togglePrivacyMode } = usePrivacyMode({
    currentUser,
    setCurrentUser,
    updateUserLocation,
    initialPrivacyEnabled
  });
  
  // Map UI state management
  const {
    selectedUser, 
    setSelectedUser,
    selectedDuration, 
    setSelectedDuration,
    movingUsers,
    setMovingUsers,
    completedMoves,
    setCompletedMoves
  } = useMapUIState();

  // Debug when selectedUser changes
  React.useEffect(() => {
    console.log("FriendMapContainer - selectedUser changed:", selectedUser);
    console.log("FriendMapContainer - movingUsers:", Array.from(movingUsers));
    console.log("FriendMapContainer - completedMoves:", Array.from(completedMoves));
  }, [selectedUser, movingUsers, completedMoves]);

  // Dispatch tracking mode event when isTracking changes
  React.useEffect(() => {
    console.log("FriendMapContainer - isTracking changed:", isTracking);
    const event = new CustomEvent('tracking-mode-changed', { 
      detail: { isTracking } 
    });
    window.dispatchEvent(event);
  }, [isTracking]);

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
      
      {/* Keep MeetingHandler for long-term state management, but now MapFeatures handles the UI */}
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

      <MapControlPanel
        radiusInKm={radiusInKm}
        setRadiusInKm={setRadiusInKm}
      />
    </MapContainer>
  );
};

export default FriendMapContainer;
