
import React, { useEffect } from 'react';
import { AppUser, Location } from '@/context/types';
import { useGeolocation } from '@/components/map/hooks/useGeolocation';
import Map from 'ol/Map';
import { useLocationUpdater } from '../hooks/location/useLocationUpdater';
import { useRadiusHandler } from '../hooks/location/useRadiusHandler';
import { useManualLocationHandler } from '../hooks/location/useManualLocationHandler';
import { usePrivacyHandler } from '../hooks/location/usePrivacyHandler';

type LocationHandlingProps = {
  map: React.MutableRefObject<Map | null>;
  mapLoaded: boolean;
  currentUser: AppUser | null;
  updateUserLocation: (userId: string, location: Location) => Promise<void>;
  setCurrentUser: (user: AppUser) => void;
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
  isManualMode: boolean;
  isTracking: boolean;
  isPrivacyModeEnabled: boolean;
};

const LocationHandling: React.FC<LocationHandlingProps> = ({
  map,
  mapLoaded,
  currentUser,
  updateUserLocation,
  setCurrentUser,
  radiusInKm,
  setRadiusInKm,
  isManualMode,
  isTracking,
  isPrivacyModeEnabled
}) => {
  // Get location updater hook
  const { handleLocationUpdate } = useLocationUpdater({
    currentUser,
    updateUserLocation,
    setCurrentUser,
    isPrivacyModeEnabled,
    isManualMode
  });
  
  // Get radius handler hook
  const { handleRadiusChange } = useRadiusHandler({
    radiusInKm,
    setRadiusInKm
  });
  
  // Get geolocation hook
  const {
    getUserLocation,
    locationError,
    startLocationTracking,
    stopLocationTracking,
    isTracking: isCurrentlyTracking
  } = useGeolocation(map, currentUser, updateUserLocation, setCurrentUser);
  
  // Handle manual location updates
  useManualLocationHandler({
    isManualMode,
    currentUser,
    handleLocationUpdate
  });
  
  // Handle privacy mode changes
  usePrivacyHandler({
    isPrivacyModeEnabled,
    currentUser
  });
  
  // Start/stop geolocation based on tracking and manual mode
  useEffect(() => {
    if (mapLoaded) {
      if (isTracking && !isManualMode) {
        console.log("Starting geolocation tracking");
        startLocationTracking();
      } else {
        console.log("Stopping geolocation tracking");
        stopLocationTracking();
      }
    }
  }, [isTracking, isManualMode, mapLoaded, startLocationTracking, stopLocationTracking]);

  // Handle radius changes from external components
  useEffect(() => {
    const handleRadiusChangeFromEvent = (e: any) => {
      console.log("Radius change event detected:", e.detail);
      handleRadiusChange(e.detail);
    };
    
    window.addEventListener('radius-changed', handleRadiusChangeFromEvent);
    
    return () => {
      window.removeEventListener('radius-changed', handleRadiusChangeFromEvent);
    };
  }, [handleRadiusChange]);

  return null; // This component doesn't render any UI elements
};

export default LocationHandling;
