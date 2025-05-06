
import { useCallback } from 'react';
import { fromLonLat } from 'ol/proj';
import { DEFAULT_LOCATION, useDefaultLocation } from './locationUtils';
import Map from 'ol/Map';
import { AppUser } from '@/context/types';

export const useSingleLocationUpdate = (
  isManualMode: boolean,
  isUpdatingRef: React.MutableRefObject<boolean>,
  lastUpdateTime: React.MutableRefObject<number>,
  setIsLocating: (isLocating: boolean) => void,
  setLocationError: (error: string | null) => void,
  setPermissionState: (state: string) => void,
  currentUser: AppUser | null,
  updateUserLocation: (userId: string, location: { lat: number, lng: number }) => Promise<any>,
  setCurrentUser: (user: AppUser | null) => void,
  map: React.MutableRefObject<Map | null>,
  isMobile: boolean,
  locationToastShown: React.MutableRefObject<boolean>,
  toast: any
) => {
  // Handle location error
  const handleLocationError = useCallback((error: GeolocationPositionError) => {
    console.error("Error getting location:", error);
    const errorMessage = formatLocationErrorMessage(error);
    
    if (error.code === 1) {
      // Permission denied
      setPermissionState('denied');
    }
    
    setLocationError(errorMessage);
    setIsLocating(false);
    isUpdatingRef.current = false;
    
    // Use default location
    useDefaultLocation(currentUser, updateUserLocation, setCurrentUser, locationToastShown, toast);
  }, [currentUser, updateUserLocation, setCurrentUser, setLocationError, setIsLocating, setPermissionState, locationToastShown, toast, isUpdatingRef]);

  // Format error messages for location errors
  const formatLocationErrorMessage = (error: GeolocationPositionError): string => {
    let errorMessage = "Unable to retrieve your location.";
    
    if (error.code === 1) {
      // Permission denied
      errorMessage = "Location permission denied. Please enable location services for this website in your browser settings.";
    } else if (error.code === 2) {
      // Position unavailable
      errorMessage = "Your location information is unavailable. Please check your device settings.";
    } else if (error.code === 3) {
      // Timeout
      errorMessage = "Location request timed out. Please try again.";
    }
    
    return errorMessage;
  };

  const getUserLocation = useCallback(() => {
    // If in manual mode, just show a toast instructing the user
    if (isManualMode) {
      toast({
        title: "Manual Location Mode",
        description: "Click anywhere on the map to set your location."
      });
      return;
    }
    
    // Prevent multiple simultaneous location requests
    if (isUpdatingRef.current) {
      console.log("Location update already in progress, ignoring request");
      return;
    }
    
    // Throttle location updates to prevent flickering
    const now = Date.now();
    const minimumUpdateInterval = 2000; // 2 seconds minimum between updates
    
    if (now - lastUpdateTime.current < minimumUpdateInterval) {
      console.log("Location update throttled, ignoring request");
      return;
    }
    
    lastUpdateTime.current = now;
    isUpdatingRef.current = true;
    setIsLocating(true);
    setLocationError(null);
    
    // First, check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      isUpdatingRef.current = false;
      useDefaultLocation(currentUser, updateUserLocation, setCurrentUser, locationToastShown, toast);
      return;
    }
    
    // For Safari and iOS specifically, we need to make a more explicit request
    // to make sure the permission dialog appears
    const positionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };
    
    console.log("Requesting geolocation permission...");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        console.log("Location obtained:", latitude, longitude);
        
        // If we have a current user, update their location in the database
        if (currentUser) {
          const newLocation = { lat: latitude, lng: longitude };
          updateUserLocation(currentUser.id, newLocation).finally(() => {
            isUpdatingRef.current = false;
          });
          
          // Update the current user state with the new location
          setCurrentUser({
            ...currentUser,
            location: newLocation
          });
        } else {
          isUpdatingRef.current = false;
        }
        
        setIsLocating(false);
        setPermissionState('granted');
        
        // Center the map on the user's location
        if (map.current) {
          map.current.getView().animate({
            center: fromLonLat([longitude, latitude]),
            duration: 1000,
            zoom: 14
          });
        }
        
        // Only show toast on desktop and only once per session
        if (!isMobile && !locationToastShown.current) {
          toast({
            title: "Location Updated",
            description: "Your current location has been updated on the map.",
          });
          locationToastShown.current = true;
        }
      },
      (error) => {
        handleLocationError(error);
      },
      positionOptions
    );
  }, [
    isManualMode, isUpdatingRef, lastUpdateTime, setIsLocating, setLocationError, 
    currentUser, updateUserLocation, setCurrentUser, setPermissionState, 
    map, isMobile, locationToastShown, toast, handleLocationError
  ]);

  return { getUserLocation };
};
