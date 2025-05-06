
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
        description: "You can set your location by clicking anywhere on the map."
      });
    }
  }, [isManualMode, permissionState, toast]);

  const setupManualLocationHandler = useCallback(() => {
    if (!map.current || !currentUser) return () => {};
    
    const handleMapClick = (event: any) => {
      if (!isManualMode) return;
      
      // Get the coordinates where the user clicked
      const clickCoordinate = event.coordinate;
      if (!clickCoordinate) return;
      
      // Convert from map projection to lat/lng (EPSG:3857 to EPSG:4326)
      const lonLat = toLonLat(clickCoordinate);
      const lng = lonLat[0];
      const lat = lonLat[1];
      
      console.log("Manual location set:", lat, lng);
      
      // Update user location
      const newLocation = { lat, lng };
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
    if (isManualMode) {
      map.current.on('click', handleMapClick);
    }
    
    return () => {
      if (map.current) {
        map.current.un('click', handleMapClick);
      }
    };
  }, [map, isManualMode, currentUser, updateUserLocation, setCurrentUser, toast]);

  return { setupManualLocationHandler };
};
