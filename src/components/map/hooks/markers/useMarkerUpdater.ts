
import { useEffect, useRef } from 'react';
import { AppUser } from '@/context/types';
import { Vector as VectorSource } from 'ol/source';
import { useBusinessUserMarkers } from './useBusinessUserMarkers';
import { useOptimizedMarkerUpdater } from './useOptimizedMarkerUpdater';
import { useMarkerEventListeners } from './useMarkerEventListeners';

export const useMarkerUpdater = (
  vectorSource: React.MutableRefObject<VectorSource | null>,
  nearbyUsers: AppUser[],
  currentUser: AppUser | null,
  mapLoaded: boolean,
  radiusInKm: number,
  isTracking: boolean = true
) => {
  // Use refs to track previous state and avoid unnecessary updates
  const prevTrackingRef = useRef(isTracking);
  const prevRadiusRef = useRef(radiusInKm);
  const updateTimeoutRef = useRef<number | null>(null);
  const nearbyUsersRef = useRef(nearbyUsers);
  const currentUserRef = useRef(currentUser);
  
  // Get business user status
  const { isBusinessUser } = useBusinessUserMarkers(currentUser);
  
  // Get optimized marker update logic
  const { debouncedUpdateMarkers } = useOptimizedMarkerUpdater();
  
  // Update refs when props change to use in cleanup functions
  useEffect(() => {
    nearbyUsersRef.current = nearbyUsers;
    currentUserRef.current = currentUser;
    prevRadiusRef.current = radiusInKm;
    prevTrackingRef.current = isTracking;
  }, [nearbyUsers, currentUser, radiusInKm, isTracking]);
  
  // Main effect to update map markers with reduced frequency
  useEffect(() => {
    if (!mapLoaded || !vectorSource.current || isBusinessUser === null) return;
    
    console.log("useMarkerUpdater effect triggered, isTracking:", isTracking, "isBusinessUser:", isBusinessUser);
    
    // Use longer delay to prevent rapid updates
    if (updateTimeoutRef.current) {
      window.clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = window.setTimeout(() => {
      const useHeatmap = nearbyUsers.length > 10; // Enable clustering for large groups
      
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
    }, 200); // Increased delay to 200ms
    
    // Cleanup function
    return () => {
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, [
    nearbyUsers.length, // Only trigger on count change, not full array
    mapLoaded, 
    currentUser?.id, // Only trigger on user ID change
    currentUser?.location?.lat, 
    currentUser?.location?.lng,
    vectorSource, 
    radiusInKm, 
    currentUser?.locationSettings?.hideExactLocation, 
    currentUser?.location_settings?.hide_exact_location, 
    isTracking,
    isBusinessUser,
    debouncedUpdateMarkers
  ]);

  // Set up event listeners with optimized function
  useMarkerEventListeners(
    vectorSource,
    mapLoaded,
    isBusinessUser,
    debouncedUpdateMarkers as any, // Type assertion for compatibility
    nearbyUsersRef,
    currentUserRef,
    prevRadiusRef,
    prevTrackingRef,
    updateTimeoutRef
  );
};
