
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
import MapControlPanel from './components/MapControlPanel';

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
  const [togglePrivacy, setTogglePrivacy] = useState<boolean>(isPrivacyModeEnabled);

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
    radiusInKm,
    isTracking
  );

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

  // Update local state when prop changes or when user settings change
  useEffect(() => {
    // Check if current user has privacy settings and sync state
    if (currentUser?.locationSettings?.hideExactLocation !== undefined) {
      console.log("Syncing privacy toggle with user settings:", currentUser.locationSettings.hideExactLocation);
      setTogglePrivacy(currentUser.locationSettings.hideExactLocation);
    } else if (currentUser?.location_settings?.hide_exact_location !== undefined) {
      console.log("Syncing privacy toggle with user settings (snake_case):", currentUser.location_settings.hide_exact_location);
      setTogglePrivacy(currentUser.location_settings.hide_exact_location);
    } else {
      // If no settings, use prop value
      console.log("Using prop value for privacy toggle:", isPrivacyModeEnabled);
      setTogglePrivacy(isPrivacyModeEnabled);
    }
  }, [isPrivacyModeEnabled, currentUser?.locationSettings?.hideExactLocation, currentUser?.location_settings?.hide_exact_location]);

  // Listen for privacy mode changes
  useEffect(() => {
    const handlePrivacyChange = (e: CustomEvent) => {
      const { isPrivacyEnabled } = e.detail;
      console.log("Privacy change event detected:", isPrivacyEnabled);
      // Trigger marker updates based on the new privacy setting
      window.dispatchEvent(new CustomEvent('user-location-changed'));
    };
    
    window.addEventListener('privacy-mode-changed', handlePrivacyChange as EventListener);
    
    return () => {
      window.removeEventListener('privacy-mode-changed', handlePrivacyChange as EventListener);
    };
  }, []);

  // Function to toggle privacy mode - this will be used by the toggle in the MapPage component
  const togglePrivacyMode = () => {
    console.log("Privacy mode toggled, current value:", togglePrivacy, "changing to:", !togglePrivacy);
    const newPrivacyValue = !togglePrivacy;
    setTogglePrivacy(newPrivacyValue);
    
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        locationSettings: {
          ...currentUser.locationSettings || {},
          hideExactLocation: newPrivacyValue
        }
      };
      
      setCurrentUser(updatedUser);
      
      // Make sure to update in database
      if (currentUser.id && currentUser.location) {
        toast({
          title: newPrivacyValue ? "Privacy Mode Enabled" : "Privacy Mode Disabled",
          description: newPrivacyValue 
            ? "Your exact location is now hidden from others" 
            : "Your exact location is now visible to others",
          duration: 3000,
        });
        
        // Update with current location and new privacy setting
        updateUserLocation(currentUser.id, currentUser.location);
        
        // Dispatch privacy mode change event
        window.dispatchEvent(new CustomEvent('privacy-mode-changed', { 
          detail: { isPrivacyEnabled: newPrivacyValue } 
        }));
      }
    }
  };

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
        isPrivacyModeEnabled={togglePrivacy}
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

      {/* Map Control Panel with radius slider only, no privacy toggle */}
      <MapControlPanel
        radiusInKm={radiusInKm}
        setRadiusInKm={setRadiusInKm}
      />
    </MapContainer>
  );
};

export default FriendMapContainer;
