
import { useEffect, useRef } from 'react';
import { AppUser } from '@/context/types';
import { Vector as VectorSource } from 'ol/source';
import { useBusinessUserMarkers } from './useBusinessUserMarkers';
import { useMarkerUpdateLogic } from './useMarkerUpdateLogic';
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
  
  // Get marker update logic
  const { throttledUpdateMarkers } = useMarkerUpdateLogic();
  
  // Update refs when props change to use in cleanup functions
  useEffect(() => {
    nearbyUsersRef.current = nearbyUsers;
    currentUserRef.current = currentUser;
    prevRadiusRef.current = radiusInKm;
    prevTrackingRef.current = isTracking;
  }, [nearbyUsers, currentUser, radiusInKm, isTracking]);
  
  // Main effect to update map markers
  useEffect(() => {
    if (!mapLoaded || !vectorSource.current || isBusinessUser === null) return;
    
    console.log("useMarkerUpdater effect triggered, isTracking:", isTracking, "isBusinessUser:", isBusinessUser);
    
    // Schedule update with a slight delay for better performance
    if (updateTimeoutRef.current) {
      window.clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = window.setTimeout(() => {
      throttledUpdateMarkers(
        vectorSource.current!, 
        nearbyUsers, 
        currentUser, 
        radiusInKm, 
        isTracking,
        isBusinessUser || false
      );
      updateTimeoutRef.current = null;
    }, 50);
    
    // Cleanup function
    return () => {
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, [
    nearbyUsers, 
    mapLoaded, 
    currentUser?.location, 
    vectorSource, 
    radiusInKm, 
    currentUser?.locationSettings?.hideExactLocation, 
    currentUser?.location_settings?.hide_exact_location, 
    currentUser?.blockedUsers, 
    isTracking,
    isBusinessUser,
    throttledUpdateMarkers
  ]);

  // Set up event listeners
  useMarkerEventListeners(
    vectorSource,
    mapLoaded,
    isBusinessUser,
    throttledUpdateMarkers,
    nearbyUsersRef,
    currentUserRef,
    prevRadiusRef,
    prevTrackingRef,
    updateTimeoutRef
  );
};
