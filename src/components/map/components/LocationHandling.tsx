
import React, { useEffect, useCallback, useState } from 'react';
import { AppUser, Location } from '@/context/types';
// Fix the import path to use the correct location of the useGeolocation hook
import { useGeolocation } from '@/components/map/hooks/useGeolocation';
import Map from 'ol/Map';

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
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  
  // Create a simplified version of the geolocation hook that works with our component
  const {
    getUserLocation,
    locationError,
    startLocationTracking,
    stopLocationTracking,
    isTracking: isCurrentlyTracking
  } = useGeolocation(map, currentUser, updateUserLocation, setCurrentUser);
  
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
      
      // Update user location - make sure we only pass the arguments that are expected
      updateUserLocation(currentUser.id, location);
      
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
      
      // Also dispatch a privacy-changed event when privacy mode changes
      window.dispatchEvent(new CustomEvent('privacy-mode-changed', { 
        detail: { isPrivacyEnabled: isPrivacyModeEnabled } 
      }));
    }
  }, [currentUser, updateUserLocation, setCurrentUser, isPrivacyModeEnabled]);
  
  // Update location when currentLocation changes
  useEffect(() => {
    if (currentLocation && !isManualMode) {
      console.log("Geolocation updated:", currentLocation);
      handleLocationUpdate(currentLocation);
    }
  }, [currentLocation, isManualMode, handleLocationUpdate]);
  
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

  // Handle privacy mode changes
  useEffect(() => {
    console.log("Privacy mode changed:", isPrivacyModeEnabled);
    // If current user exists and has location, update markers when privacy changes
    if (currentUser?.location) {
      // Dispatch privacy mode changed event
      window.dispatchEvent(new CustomEvent('privacy-mode-changed', { 
        detail: { isPrivacyEnabled: isPrivacyModeEnabled } 
      }));
      // Also update user location to reflect changes immediately
      window.dispatchEvent(new CustomEvent('user-location-changed'));
    }
  }, [isPrivacyModeEnabled, currentUser]);

  return null; // This component doesn't render any UI elements
};

export default LocationHandling;
