
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppUser } from '@/context/types';
import { fromLonLat } from 'ol/proj';
import Map from 'ol/Map';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocationPermission } from './location/useLocationPermission';
import { useLocationTracking } from './location/useLocationTracking';
import { DEFAULT_LOCATION, useDefaultLocation, formatLocationErrorMessage } from './location/locationUtils';
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

  // Handle location error
  const handleLocationError = (error: GeolocationPositionError) => {
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
  };

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
    handleLocationError,
    isUpdatingRef,
    lastUpdateTime
  );

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
    
    toast({
      title: newMode ? "Manual Location Mode" : "Automatic Location Mode",
      description: newMode 
        ? "You can now set your location manually on the map." 
        : "Your location will be updated automatically."
    });
  };

  // Handle map click for manual location setting
  useEffect(() => {
    if (!map.current || !isManualMode || !currentUser) return;
    
    const handleMapClick = (event: any) => {
      if (!isManualMode) return;
      
      const clickCoordinate = map.current?.getEventCoordinate(event);
      if (!clickCoordinate) return;
      
      // Convert from map projection to lat/lng
      const lonLat = map.current?.getView().getProjection().getPointResolution(1, clickCoordinate);
      const { x, y } = lonLat;
      
      // Update user location
      const newLocation = { lat: y, lng: x };
      updateUserLocation(currentUser.id, newLocation);
      
      // Update current user state
      setCurrentUser({
        ...currentUser,
        location: newLocation
      });
      
      toast({
        title: "Location Updated",
        description: "Your location has been set manually."
      });
    };
    
    // Add click event listener to the map
    const mapElement = map.current.getTargetElement();
    mapElement.addEventListener('click', handleMapClick);
    
    return () => {
      mapElement.removeEventListener('click', handleMapClick);
    };
  }, [map, isManualMode, currentUser]);

  // Get a single location update
  const getUserLocation = () => {
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
        setUserLocation([longitude, latitude]);
        
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
  };

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
    DEFAULT_LOCATION,
    toggleLocationTracking,
    startLocationTracking,
    stopLocationTracking,
    isTracking: isTracking(),
    isManualMode,
    toggleManualMode
  };
};
