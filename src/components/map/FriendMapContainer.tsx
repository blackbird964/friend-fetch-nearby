
import React from 'react';
import { useFriendMapContainer } from './hooks/useFriendMapContainer';
import MapContainer from './components/MapContainer';
import { MapSidePanel } from './components/side-panel';
import UserDetailsDrawerContainer from './components/UserDetailsDrawerContainer';
import MobileDrawerContainer from './components/MobileDrawerContainer';
// Import DrawerHandle for mobile button!
import { DrawerHandle } from './components/mobile-drawer';

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
  const {
    // App context
    currentUser,
    nearbyUsers,
    radiusInKm,
    setRadiusInKm,
    setCurrentUser,
    updateUserLocation,
    friendRequests,
    
    // Map refs
    map,
    vectorSource,
    vectorLayer,
    routeLayer,
    mapLoaded,
    WYNYARD_COORDS,
    
    // Privacy
    isPrivacyModeEnabled: currentPrivacyMode,
    
    // UI state
    selectedUser,
    setSelectedUser,
    selectedDuration,
    setSelectedDuration,
    movingUsers,
    setMovingUsers,
    completedMoves,
    setCompletedMoves,
    
    // User details drawer
    drawerSelectedUser,
    handleUserSelect,
    handleCloseDrawer,
    
    // Mobile drawer
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    isMobile
  } = useFriendMapContainer({
    isManualMode,
    isTracking,
    isPrivacyModeEnabled
  });

  // Create side panel content
  const sidePanelContent = (
    <MapSidePanel
      users={nearbyUsers}
      currentUser={currentUser}
      radiusInKm={radiusInKm}
      onUserSelect={handleUserSelect}
    />
  );

  // Create mobile drawer
  const mobileDrawer = (
    <MobileDrawerContainer
      nearbyUsers={nearbyUsers}
      currentUser={currentUser}
      radiusInKm={radiusInKm}
      onUserSelect={handleUserSelect}
      isDrawerOpen={isDrawerOpen}
      onToggleDrawer={toggleDrawer}
      onCloseDrawer={closeDrawer}
    />
  );

  // Exclude currentUser from count for DrawerHandle!
  const userCount = currentUser
    ? nearbyUsers.filter(user => user.id !== currentUser.id).length
    : nearbyUsers.length;

  return (
    <>
      {/* DrawerHandle button for mobile: floating button to open people drawer */}
      {isMobile && (
        <DrawerHandle userCount={userCount} onClick={openDrawer} />
      )}

      <MapContainer 
        showSidePanel={true} 
        sidePanel={sidePanelContent}
        mobileDrawer={mobileDrawer}
      >
        <MapContentContainer
          map={map}
          vectorSource={vectorSource}
          vectorLayer={vectorLayer}
          routeLayer={routeLayer}
          mapLoaded={mapLoaded}
          WYNYARD_COORDS={WYNYARD_COORDS as [number, number]}
          currentUser={currentUser}
          nearbyUsers={nearbyUsers}
          friendRequests={friendRequests}
          radiusInKm={radiusInKm}
          setRadiusInKm={setRadiusInKm}
          isManualMode={isManualMode}
          isTracking={isTracking}
          isPrivacyModeEnabled={currentPrivacyMode}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          movingUsers={movingUsers}
          setMovingUsers={setMovingUsers}
          completedMoves={completedMoves}
          setCompletedMoves={setCompletedMoves}
          updateUserLocation={updateUserLocation}
          setCurrentUser={setCurrentUser}
        />
      </MapContainer>

      {/* User Details Drawer */}
      <UserDetailsDrawerContainer
        user={drawerSelectedUser}
        isOpen={!!drawerSelectedUser}
        onClose={handleCloseDrawer}
      />
    </>
  );
};

export default FriendMapContainer;

