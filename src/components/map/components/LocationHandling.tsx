
import React, { useEffect } from 'react';
import { AppUser } from '@/context/types';
import Map from 'ol/Map';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation } from '../hooks/useGeolocation';
import { useLocationHandling } from '../hooks/useLocationHandling';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useManualLocation } from '../hooks/location/useManualLocation';
import MapControlPanel from './MapControlPanel';
import LocationErrorMessage from './LocationErrorMessage';

type LocationHandlingProps = {
  map: React.MutableRefObject<Map | null>;
  mapLoaded: boolean;
  currentUser: AppUser | null;
  updateUserLocation: (userId: string, location: { lat: number, lng: number }) => Promise<any>;
  setCurrentUser: (user: AppUser | null) => void;
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
  isManualMode?: boolean;
  isTracking?: boolean;
  isPrivacyModeEnabled?: boolean;
};

const LocationHandling: React.FC<LocationHandlingProps> = ({
  map,
  mapLoaded,
  currentUser,
  updateUserLocation,
  setCurrentUser,
  radiusInKm,
  setRadiusInKm,
  isManualMode: propIsManualMode,
  isTracking: propIsTracking,
  isPrivacyModeEnabled: propIsPrivacyModeEnabled
}) => {
  const { toast } = useToast();
  const { updateUserProfile } = useUserProfile();
  
  // Handle geolocation
  const {
    getUserLocation,
    isLocating,
    locationError,
    permissionState,
    getSafariHelp,
    toggleLocationTracking,
    isTracking: geoIsTracking,
    isManualMode: geoIsManualMode,
    toggleManualMode
  } = useGeolocation(map, currentUser, updateUserLocation, setCurrentUser);

  // Use props values if provided, otherwise use the values from useGeolocation
  const isManualMode = propIsManualMode !== undefined ? propIsManualMode : geoIsManualMode;
  const isTracking = propIsTracking !== undefined ? propIsTracking : geoIsTracking;

  // Get the current privacy setting
  const isPrivacyModeEnabled = propIsPrivacyModeEnabled !== undefined 
    ? propIsPrivacyModeEnabled
    : (currentUser?.locationSettings?.hideExactLocation || 
       currentUser?.location_settings?.hide_exact_location || 
       false);

  // Setup manual location mode handler
  const { setupManualLocationHandler } = useManualLocation(
    map,
    isManualMode,
    currentUser,
    updateUserLocation,
    setCurrentUser,
    toast,
    permissionState
  );

  // Function to toggle privacy mode
  const togglePrivacyMode = async () => {
    if (!currentUser) return;
    
    const currentPrivacySetting = currentUser.locationSettings?.hideExactLocation || 
                                 currentUser.location_settings?.hide_exact_location || 
                                 false;
    
    console.log("Toggling privacy mode from:", currentPrivacySetting, "to:", !currentPrivacySetting);
    
    try {
      await updateUserProfile(currentUser.id, {
        locationSettings: {
          ...currentUser.locationSettings,
          hideExactLocation: !currentPrivacySetting
        }
      });
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        locationSettings: {
          ...currentUser.locationSettings,
          hideExactLocation: !currentPrivacySetting
        }
      });
    } catch (error) {
      console.error('Error toggling privacy mode:', error);
    }
  };

  // Automatically get user location when map is loaded
  useEffect(() => {
    if (mapLoaded && !isManualMode && !isTracking && currentUser) {
      getUserLocation();
    }
  }, [mapLoaded, currentUser, getUserLocation, isManualMode, isTracking]);

  // Set up manual location handler when manual mode is enabled
  useEffect(() => {
    if (mapLoaded && isManualMode && currentUser) {
      console.log("Setting up manual location handler in LocationHandling component");
      const cleanup = setupManualLocationHandler();
      return cleanup;
    }
  }, [mapLoaded, isManualMode, currentUser, setupManualLocationHandler]);

  // Log radius changes to help with debugging
  useEffect(() => {
    console.log("LocationHandling - radiusInKm:", radiusInKm);
  }, [radiusInKm]);

  return (
    <>
      <MapControlPanel 
        radiusInKm={radiusInKm}
        setRadiusInKm={setRadiusInKm}
        // Still passing these props for type compatibility, but they won't be used for rendering
        toggleLocationTracking={toggleLocationTracking}
        isTracking={isTracking}
        isManualMode={isManualMode}
        toggleManualMode={toggleManualMode}
        isPrivacyModeEnabled={isPrivacyModeEnabled}
        togglePrivacyMode={togglePrivacyMode}
      />
      
      <LocationErrorMessage 
        locationError={locationError}
        permissionState={permissionState}
        getSafariHelp={getSafariHelp}
        isManualMode={isManualMode}
      />
    </>
  );
};

export default LocationHandling;
