
import React, { useEffect, useState } from 'react';
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
import { MapSidePanel } from './components/side-panel';
import UserDetailsDrawer from '../users/nearby-users/UserDetailsDrawer';

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

  // State for user details drawer
  const [drawerSelectedUser, setDrawerSelectedUser] = useState(null);

  // Handle user selection from side panel
  const handleUserSelect = (user) => {
    console.log("[FriendMapContainer] User selected from side panel:", user.name);
    setDrawerSelectedUser(user);
  };

  // Important: Clear meeting state when a user is selected
  useEffect(() => {
    console.log(`[FriendMapContainer] selectedUser changed to: ${selectedUser}`);
    
    if (selectedUser) {
      // Immediately clear the selected user from meeting states
      setMovingUsers(prev => {
        const next = new Set(prev);
        if (next.has(selectedUser)) {
          console.log(`[FriendMapContainer] Removing ${selectedUser} from movingUsers`);
          next.delete(selectedUser);
        }
        return next;
      });
      
      setCompletedMoves(prev => {
        const next = new Set(prev);
        if (next.has(selectedUser)) {
          console.log(`[FriendMapContainer] Removing ${selectedUser} from completedMoves`);
          next.delete(selectedUser);
        }
        return next;
      });
    }
  }, [selectedUser, setMovingUsers, setCompletedMoves]);

  // Dispatch tracking mode event when isTracking changes
  useEffect(() => {
    console.log("FriendMapContainer - isTracking changed:", isTracking);
    const event = new CustomEvent('tracking-mode-changed', { 
      detail: { isTracking } 
    });
    window.dispatchEvent(event);
  }, [isTracking]);
  
  // Debug state on render
  console.log("[FriendMapContainer] Current state:");
  console.log("- selectedUser:", selectedUser);
  console.log("- movingUsers:", Array.from(movingUsers));
  console.log("- completedMoves:", Array.from(completedMoves));

  // Create side panel
  const sidePanel = (
    <MapSidePanel
      users={nearbyUsers}
      currentUser={currentUser}
      radiusInKm={radiusInKm}
      onUserSelect={handleUserSelect}
    />
  );

  return (
    <>
      <MapContainer showSidePanel={true} sidePanel={sidePanel}>
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
          WYNYARD_COORDS={WYNYARD_COORDS as [number, number]}
        />

        <MapControlPanel
          radiusInKm={radiusInKm}
          setRadiusInKm={setRadiusInKm}
        />
      </MapContainer>

      {/* User Details Drawer */}
      <UserDetailsDrawer
        user={drawerSelectedUser}
        isOpen={!!drawerSelectedUser}
        onClose={() => setDrawerSelectedUser(null)}
        onStartChat={() => {}} // Implement chat functionality if needed
      />
    </>
  );
};

export default FriendMapContainer;
