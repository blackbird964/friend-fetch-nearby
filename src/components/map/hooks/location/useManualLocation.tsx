
import { useCallback, useEffect } from 'react';
import { toLonLat } from 'ol/proj';
import Map from 'ol/Map';
import { AppUser } from '@/context/types';

export const useManualLocation = (
  map: React.MutableRefObject<Map | null>,
  isManualMode: boolean,
  currentUser: AppUser | null,
  updateUserLocation: (userId: string, location: { lat: number, lng: number }) => Promise<any>,
  setCurrentUser: (user: AppUser | null) => void,
  toast: any,
  permissionState?: string
) => {
  // Show manual mode help toast when permission is denied
  useEffect(() => {
    if (isManualMode && permissionState === 'denied') {
      toast({
        title: "Manual Location Mode",
        description: "You can set your location by tapping anywhere on the map."
      });
    }
  }, [isManualMode, permissionState, toast]);

  const setupManualLocationHandler = useCallback(() => {
    if (!map.current || !currentUser) return () => {};
    
    // Handle map clicks and taps (unified handler for both mouse and touch)
    const handleMapInteraction = (event: any) => {
      if (!isManualMode) return;
      
      console.log("Map tap/click detected in manual mode");
      
      // Get the coordinates where the user clicked/tapped
      const clickCoordinate = event.coordinate;
      if (!clickCoordinate) {
        console.error("No coordinate in map interaction event");
        return;
      }
      
      // Convert from map projection to lat/lng (EPSG:3857 to EPSG:4326)
      const lonLat = toLonLat(clickCoordinate);
      const lng = lonLat[0];
      const lat = lonLat[1];
      
      console.log("Manual location set:", lat, lng);
      
      // Update user location
      const newLocation = { lat, lng };
      updateUserLocation(currentUser.id, newLocation)
        .then(() => {
          console.log("Location successfully updated in database");
        })
        .catch((error) => {
          console.error("Error updating location in database:", error);
        });
      
      // Immediately update current user state for UI responsiveness
      setCurrentUser({
        ...currentUser,
        location: newLocation
      });
      
      toast({
        title: "Location Updated",
        description: "Your location has been set manually."
      });
    };
    
    const enableManualMode = () => {
      if (!map.current || !isManualMode) return;
      
      console.log("Setting up manual location handlers");
      
      // Clean up any existing handlers first to prevent duplicates
      map.current.un('click', handleMapInteraction);
      map.current.un('singleclick', handleMapInteraction);
      
      // Add event listeners for both mouse and touch events
      map.current.on('click', handleMapInteraction);
      map.current.on('singleclick', handleMapInteraction); // For touch devices
    };
    
    // Set up the handlers immediately if manual mode is active
    if (isManualMode) {
      enableManualMode();
    }
    
    // Return cleanup function
    return () => {
      if (map.current) {
        console.log("Cleaning up manual location handlers");
        map.current.un('click', handleMapInteraction);
        map.current.un('singleclick', handleMapInteraction);
      }
    };
  }, [map, isManualMode, currentUser, updateUserLocation, setCurrentUser, toast]);

  return { setupManualLocationHandler };
};
