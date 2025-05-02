
import { useRef } from 'react';
import { fromLonLat } from 'ol/proj';
import { AppUser } from '@/context/types';
import Map from 'ol/Map';

export const useLocationTracking = (
  map: React.MutableRefObject<Map | null>,
  currentUser: AppUser | null,
  updateUserLocation: (userId: string, location: { lat: number, lng: number }) => Promise<any>,
  setCurrentUser: (user: AppUser | null) => void,
  setLocationError: (error: string | null) => void,
  setPermissionState: (state: string) => void,
  handleLocationError: (error: GeolocationPositionError) => void,
  isUpdatingRef: React.MutableRefObject<boolean>,
  lastUpdateTime: React.MutableRefObject<number>
) => {
  const watchIdRef = useRef<number | null>(null);
  const continuousTrackingEnabled = useRef<boolean>(false);
  
  // Start continuous location tracking
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    // Already tracking
    if (watchIdRef.current !== null) {
      return;
    }

    continuousTrackingEnabled.current = true;
    
    console.log("Starting continuous location tracking...");
    
    const positionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        console.log("Location update received:", latitude, longitude);
        setLocationError(null);
        setPermissionState('granted');
        
        // Update user location in database
        if (currentUser) {
          const now = Date.now();
          // Throttle updates to database (every 3 seconds)
          if (now - lastUpdateTime.current > 3000) {
            lastUpdateTime.current = now;
            
            const newLocation = { lat: latitude, lng: longitude };
            updateUserLocation(currentUser.id, newLocation);
            
            // Update the current user state with the new location
            setCurrentUser({
              ...currentUser,
              location: newLocation
            });
            
            // Center the map on the user's location if tracking is enabled
            if (map.current && continuousTrackingEnabled.current) {
              map.current.getView().animate({
                center: fromLonLat([longitude, latitude]),
                duration: 500
              });
            }
          }
        }
      },
      (error) => {
        handleLocationError(error);
      },
      positionOptions
    );
  };

  // Stop continuous location tracking
  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      continuousTrackingEnabled.current = false;
      console.log("Continuous location tracking stopped");
    }
  };

  // Toggle GPS tracking on/off
  const toggleLocationTracking = () => {
    if (watchIdRef.current === null) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  };

  // Check if tracking is active
  const isTracking = () => watchIdRef.current !== null;

  return {
    startLocationTracking,
    stopLocationTracking,
    toggleLocationTracking,
    isTracking,
    watchIdRef
  };
};
