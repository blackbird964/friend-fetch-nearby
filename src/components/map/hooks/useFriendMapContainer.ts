
import { useAppContext } from '@/context/AppContext';
import { useMapInitialization } from './useMapInitialization';
import { useMapUIState } from './useMapUIState';
import { usePrivacyMode } from './usePrivacyMode';
import { useUserDetailsDrawer } from './useUserDetailsDrawer';
import { useMeetingStateCleanup } from './useMeetingStateCleanup';
import { useTrackingModeEvents } from './useTrackingModeEvents';
import { useMobileDrawer } from './useMobileDrawer';

interface UseFriendMapContainerProps {
  isManualMode: boolean;
  isTracking: boolean;
  isPrivacyModeEnabled: boolean;
}

export const useFriendMapContainer = ({
  isManualMode,
  isTracking,
  isPrivacyModeEnabled: initialPrivacyEnabled
}: UseFriendMapContainerProps) => {
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

  return {
    // App context
    currentUser,
    nearbyUsers,
    radiusInKm,
    setRadiusInKm,
    setCurrentUser,
    updateUserLocation,
    refreshNearbyUsers,
    friendRequests,
    
    // Map refs
    mapContainer,
    map,
    vectorSource,
    vectorLayer,
    routeLayer,
    mapLoaded,
    WYNYARD_COORDS,
    
    // Privacy
    isPrivacyModeEnabled,
    togglePrivacyMode,
    
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
  };
};
