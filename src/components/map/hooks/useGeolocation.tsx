
import { useState, useEffect, useRef } from 'react';
import { AppUser } from '@/context/types';
import Map from 'ol/Map';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { useLocationPermission } from './location/useLocationPermission';
import { useLocationTracking } from './location/useLocationTracking';
import { useManualLocation } from './location/useManualLocation';
import { useSingleLocationUpdate } from './location/useSingleLocationUpdate';
import { useUserProfile } from '@/hooks/useUserProfile';

export const useGeolocation = (
  map: React.MutableRefObject<Map | null>,
  currentUser: AppUser | null,
  updateUserLocation: (userId: string, location: { lat: number, lng: number }) => Promise<any>,
  setCurrentUser: (user: AppUser | null) => void
) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isManualMode, setIsManualMode] = useState<boolean>(
    currentUser?.locationSettings?.isManualMode || false
  );
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const locationToastShown = useRef<boolean>(false);
  const lastUpdateTime = useRef<number>(0);
  const isUpdatingRef = useRef<boolean>(false);
  const { updateLocationMode } = useUserProfile();

  // Import permission-related functionality
  const { permissionState, setPermissionState, getSafariHelp } = useLocationPermission();

  // Update isManualMode when currentUser changes
  useEffect(() => {
    if (currentUser?.locationSettings?.isManualMode !== undefined) {
      setIsManualMode(currentUser.locationSettings.isManualMode);
    }
  }, [currentUser?.locationSettings?.isManualMode]);

  // Import location tracking functionality
  const {
    startLocationTracking,
    stopLocationTracking,
    toggleLocationTracking,
    isTracking,
    watchIdRef
  } = useLocationTracking(
    map, 
    currentUser, 
    updateUserLocation, 
    setCurrentUser, 
    setLocationError, 
    setPermissionState, 
    isUpdatingRef,
    lastUpdateTime,
    toast
  );

  // Import manual location setting functionality
  const { setupManualLocationHandler } = useManualLocation(
    map,
    isManualMode,
    currentUser,
    updateUserLocation,
    setCurrentUser,
    toast,
    permissionState
  );

  // Setup manual location handler
  useEffect(() => {
    return setupManualLocationHandler();
  }, [setupManualLocationHandler]);

  // Toggle between manual and automatic location mode
  const toggleManualMode = async () => {
    if (!currentUser) return;
    
    const newMode = !isManualMode;
    setIsManualMode(newMode);
    
    // Stop tracking if switching to manual mode
    if (newMode && isTracking()) {
      stopLocationTracking();
    }
    
    // Update user profile with the new setting
    await updateLocationMode(currentUser.id, newMode);
    
    // Update current user state with the new setting
    setCurrentUser({
      ...currentUser,
      locationSettings: {
        ...currentUser.locationSettings,
        isManualMode: newMode
      }
    });
    
    // Clear location error when switching to manual mode when permission is denied
    if (newMode && permissionState === 'denied') {
      setLocationError(null);
    }
    
    toast({
      title: newMode ? "Manual Location Mode" : "Automatic Location Mode",
      description: newMode 
        ? "You can now set your location manually on the map." 
        : "Your location will be updated automatically."
    });
  };

  // Get a single location update
  const { getUserLocation } = useSingleLocationUpdate(
    isManualMode,
    isUpdatingRef,
    lastUpdateTime,
    setIsLocating,
    setLocationError,
    setPermissionState,
    currentUser,
    updateUserLocation,
    setCurrentUser,
    map,
    isMobile,
    locationToastShown,
    toast
  );

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    getUserLocation,
    isLocating,
    locationError,
    permissionState,
    getSafariHelp,
    DEFAULT_LOCATION: { lat: -33.8666, lng: 151.2073 },
    toggleLocationTracking,
    startLocationTracking,
    stopLocationTracking,
    isTracking: isTracking(),
    isManualMode,
    toggleManualMode
  };
};
