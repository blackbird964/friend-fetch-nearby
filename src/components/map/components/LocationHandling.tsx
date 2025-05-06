
import React, { useEffect } from 'react';
import { AppUser } from '@/context/types';
import Map from 'ol/Map';
import { useGeolocation } from '../hooks/useGeolocation';
import { useLocationHandling } from '../hooks/useLocationHandling';
import { useUserProfile } from '@/hooks/useUserProfile';
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
};

const LocationHandling: React.FC<LocationHandlingProps> = ({
  map,
  mapLoaded,
  currentUser,
  updateUserLocation,
  setCurrentUser,
  radiusInKm,
  setRadiusInKm
}) => {
  const { updateUserProfile } = useUserProfile();
  
  // Handle geolocation
  const {
    getUserLocation,
    isLocating,
    locationError,
    permissionState,
    getSafariHelp,
    toggleLocationTracking,
    isTracking,
    isManualMode,
    toggleManualMode
  } = useGeolocation(map, currentUser, updateUserLocation, setCurrentUser);

  // Get the current privacy setting
  const isPrivacyModeEnabled = currentUser?.locationSettings?.hideExactLocation || 
                               currentUser?.location_settings?.hide_exact_location || 
                               false;

  // Function to toggle privacy mode
  const togglePrivacyMode = async () => {
    if (!currentUser) return;
    
    const currentPrivacySetting = currentUser.locationSettings?.hideExactLocation || 
                                 currentUser.location_settings?.hide_exact_location || 
                                 false;
    
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

  return (
    <>
      <MapControlPanel 
        radiusInKm={radiusInKm}
        setRadiusInKm={setRadiusInKm}
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
