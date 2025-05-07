import React, { useEffect, useCallback } from 'react';
import { AppUser, Location } from '@/context/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import Map from 'ol/Map';

type LocationHandlingProps = {
  map: React.MutableRefObject<Map | null>;
  mapLoaded: boolean;
  currentUser: AppUser | null;
  updateUserLocation: (userId: string, location: Location, options?: any) => Promise<void>;
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
  const { location, error, startGeolocation, stopGeolocation } = useGeolocation();
  
  // Start/stop geolocation based on tracking and manual mode
  useEffect(() => {
    if (mapLoaded) {
      if (isTracking && !isManualMode) {
        console.log("Starting geolocation tracking");
        startGeolocation();
      } else {
        console.log("Stopping geolocation tracking");
        stopGeolocation();
      }
    }
  }, [isTracking, isManualMode, mapLoaded, startGeolocation, stopGeolocation]);
  
  // Update radius based on user interaction
  const handleRadiusChange = useCallback((newRadius: number) => {
    console.log("LocationHandling - Radius changed to:", newRadius);
    setRadiusInKm(newRadius);
    
    // Dispatch event to notify radius changed
    window.dispatchEvent(new CustomEvent('radius-changed', { detail: newRadius }));
  }, [setRadiusInKm]);
  
  // Update user location in context
  const handleLocationUpdate = useCallback((location: Location) => {
    if (location && location.lat && location.lng && currentUser?.id) {
      console.log("Updating location with privacy:", isPrivacyModeEnabled);
      
      // Update user with location and privacy setting
      updateUserLocation(currentUser.id, location, {
        // Pass privacy setting to be saved with location update
        hideExactLocation: isPrivacyModeEnabled
      });
      
      // Update local user state with new privacy setting
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          location,
          locationSettings: {
            ...currentUser.locationSettings,
            hideExactLocation: isPrivacyModeEnabled
          }
        };
        setCurrentUser(updatedUser);
      }
      
      // Dispatch custom event to notify location change
      window.dispatchEvent(new CustomEvent('user-location-changed'));
    }
  }, [currentUser, updateUserLocation, setCurrentUser, isPrivacyModeEnabled]);
  
  // Update location when geolocation changes (automatic mode)
  useEffect(() => {
    if (location && !isManualMode) {
      console.log("Geolocation updated:", location);
      handleLocationUpdate(location);
    }
  }, [location, isManualMode, handleLocationUpdate]);
  
  // Handle manual location updates
  useEffect(() => {
    const handleManualLocationUpdate = (event: any) => {
      if (isManualMode && event.detail) {
        console.log("Manual location update:", event.detail);
        handleLocationUpdate(event.detail);
      }
    };
    
    window.addEventListener('manual-location-update', handleManualLocationUpdate);
    
    return () => {
      window.removeEventListener('manual-location-update', handleManualLocationUpdate);
    };
  }, [isManualMode, handleLocationUpdate]);
  
  // Handle radius changes from slider or other components
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
