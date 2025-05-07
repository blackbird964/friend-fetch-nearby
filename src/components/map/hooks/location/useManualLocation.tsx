
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
  // Show manual mode help toast when permission is denied or manual mode is activated
  useEffect(() => {
    if (isManualMode) {
      toast({
        title: "Manual Location Mode",
        description: "You can set your location by tapping anywhere on the map."
      });
    }
  }, [isManualMode, permissionState, toast]);

  const setupManualLocationHandler = useCallback(() => {
    if (!map.current || !currentUser) {
      console.log("Cannot set up manual location handler: map or user unavailable");
      return () => {};
    }
    
    console.log("Setting up manual location handler, isManualMode:", isManualMode);
    
    // Handle map clicks and taps (unified handler for both mouse and touch)
    const handleMapInteraction = (event: any) => {
      if (!isManualMode) {
        console.log("Manual mode is off, ignoring tap");
        return;
      }
      
      console.log("Map tap/click detected in manual mode", event);
      
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
      
      // Immediately update current user state for UI responsiveness
      setCurrentUser({
        ...currentUser,
        location: newLocation
      });
      
      // Force UI update by dispatching a custom event
      window.dispatchEvent(new CustomEvent('user-location-changed', { detail: newLocation }));
      
      // Then update in the database
      updateUserLocation(currentUser.id, newLocation)
        .then(() => {
          console.log("Location successfully updated in database");
          
          // Show toast notification
          toast({
            title: "Location Updated",
            description: "Your location has been set manually."
          });
        })
        .catch((error) => {
          console.error("Error updating location in database:", error);
          toast({
            title: "Error",
            description: "Failed to update your location. Please try again.",
            variant: "destructive"
          });
        });
    };
    
    // Clean up previous handlers to avoid duplicates
    if (map.current) {
      console.log("Removing existing manual location handlers");
      map.current.un('click', handleMapInteraction);
      map.current.un('singleclick', handleMapInteraction);
    }
    
    // Add event listeners but only if manual mode is active
    if (isManualMode && map.current) {
      console.log("Adding manual location handlers to map");
      
      // Use both click and singleclick for better cross-device compatibility
      map.current.on('click', handleMapInteraction);
      map.current.on('singleclick', handleMapInteraction);
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
