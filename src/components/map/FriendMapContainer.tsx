
import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

// Import custom hooks
import { useMapInitialization } from './hooks/useMapInitialization';
import { useMapUIState } from './hooks/useMapUIState';
import { usePrivacyMode } from './hooks/usePrivacyMode';
import { useUserDetailsDrawer } from './hooks/useUserDetailsDrawer';
import { useMeetingStateCleanup } from './hooks/useMeetingStateCleanup';
import { useTrackingModeEvents } from './hooks/useTrackingModeEvents';
import { useMobileDrawer } from './hooks/useMobileDrawer';

// Import refactored components
import MapContainer from './components/MapContainer';
import MapFeatures from './components/MapFeatures';
import LocationHandling from './components/LocationHandling';
import MeetingHandler from './components/MeetingHandler';
import MapControlPanel from './components/MapControlPanel';
import MapControls from './components/MapControls';
import { MapSidePanel } from './components/side-panel';
import UserDetailsDrawerContainer from './components/UserDetailsDrawerContainer';
import { MobileDrawer, DrawerHandle } from './components/mobile-drawer';

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

  // User details drawer management
  const {
    drawerSelectedUser,
    handleUserSelect,
    handleStartChat,
    handleCloseDrawer
  } = useUserDetailsDrawer();

  // Mobile drawer management
  const {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    isMobile
  } = useMobileDrawer();

  // Handle meeting state cleanup when user is selected
  useMeetingStateCleanup({
    selectedUser,
    setMovingUsers,
    setCompletedMoves
  });

  // Handle tracking mode events
  useTrackingModeEvents(isTracking);
  
  // Debug state on render
  console.log("[FriendMapContainer] Current state:");
  console.log("- selectedUser:", selectedUser);
  console.log("- movingUsers:", Array.from(movingUsers));
  console.log("- completedMoves:", Array.from(completedMoves));

  // Create side panel content
  const sidePanelContent = (
    <MapSidePanel
      users={nearbyUsers}
      currentUser={currentUser}
      radiusInKm={radiusInKm}
      onUserSelect={handleUserSelect}
    />
  );

  // Filter online users for count
  const onlineUsers = nearbyUsers.filter(user => 
    user.id !== currentUser?.id && 
    user.isOnline === true &&
    user.id && 
    !String(user.id).includes('test') && 
    !String(user.id).includes('mock')
  );

  // Create mobile drawer
  const mobileDrawer = (
    <>
      <DrawerHandle 
        onClick={toggleDrawer}
        userCount={onlineUsers.length}
      />
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      >
        {sidePanelContent}
      </MobileDrawer>
    </>
  );

  return (
    <>
      <MapContainer 
        showSidePanel={true} 
        sidePanel={sidePanelContent}
        mobileDrawer={mobileDrawer}
      >
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
      <UserDetailsDrawerContainer
        user={drawerSelectedUser}
        isOpen={!!drawerSelectedUser}
        onClose={handleCloseDrawer}
        onStartChat={handleStartChat}
      />
    </>
  );
};

export default FriendMapContainer;
