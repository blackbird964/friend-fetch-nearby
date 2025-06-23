
import { useEffect, useRef } from 'react';
import { AppUser } from '@/context/types';
import { Vector as VectorSource } from 'ol/source';
import { useBusinessUserMarkers } from './useBusinessUserMarkers';
import { useOptimizedMarkerUpdater } from './useOptimizedMarkerUpdater';

export const useMarkerUpdater = (
  vectorSource: React.MutableRefObject<VectorSource | null>,
  nearbyUsers: AppUser[],
  currentUser: AppUser | null,
  mapLoaded: boolean,
  radiusInKm: number,
  isTracking: boolean = true
) => {
  const updateTimeoutRef = useRef<number | null>(null);
  
  // Get business user status
  const { isBusinessUser } = useBusinessUserMarkers(currentUser);
  
  // Get optimized marker update logic
  const { debouncedUpdateMarkers } = useOptimizedMarkerUpdater();
  
  // Main effect to update map markers
  useEffect(() => {
    if (!mapLoaded || !vectorSource.current || isBusinessUser === null) {
      console.log("Skipping marker update - map not ready:", { mapLoaded, hasSource: !!vectorSource.current, isBusinessUser });
      return;
    }
    
    console.log("Triggering marker update:", { 
      userCount: nearbyUsers.length, 
      isTracking, 
      currentUserId: currentUser?.id,
      isBusinessUser 
    });
    
    // Clear any pending updates
    if (updateTimeoutRef.current) {
      window.clearTimeout(updateTimeoutRef.current);
    }
    
    // Update markers with a small delay to ensure DOM is ready
    updateTimeoutRef.current = window.setTimeout(() => {
      const useHeatmap = nearbyUsers.length > 5; // Lower threshold for better clustering
      
      debouncedUpdateMarkers(
        vectorSource.current!, 
        nearbyUsers, 
        currentUser, 
        radiusInKm, 
        isTracking,
        isBusinessUser || false,
        useHeatmap
      );
      updateTimeoutRef.current = null;
    }, 100); // Reduced delay
    
    // Cleanup function
    return () => {
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, [
    nearbyUsers, // Watch full array changes
    mapLoaded, 
    currentUser?.id,
    currentUser?.location?.lat, 
    currentUser?.location?.lng,
    vectorSource, 
    radiusInKm, 
    isTracking,
    isBusinessUser,
    debouncedUpdateMarkers
  ]);

  // Force update when tracking state changes
  useEffect(() => {
    if (mapLoaded && vectorSource.current) {
      console.log("Tracking state changed, forcing marker update");
      window.dispatchEvent(new CustomEvent('markers-need-update'));
    }
  }, [isTracking, mapLoaded]);
};
