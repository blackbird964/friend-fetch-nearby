
import { useEffect, useRef } from 'react';
import { AppUser } from '@/context/types';
import Map from 'ol/Map';

export const useLocationHandling = (
  mapLoaded: boolean,
  getUserLocation: () => void
) => {
  const initialLocationObtained = useRef<boolean>(false);
  
  // Get user's location on initial load - without triggering refreshNearbyUsers
  useEffect(() => {
    if (mapLoaded && !initialLocationObtained.current) {
      // Get user's location after a short delay, but only once
      const timer = setTimeout(() => {
        initialLocationObtained.current = true;
        getUserLocation();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [mapLoaded, getUserLocation]);

  return {
    initialLocationObtained
  };
};
