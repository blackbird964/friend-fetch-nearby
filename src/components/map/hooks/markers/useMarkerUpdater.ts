import { useEffect, useCallback, useRef } from 'react';
import { AppUser } from '@/context/types';
import { Vector as VectorSource } from 'ol/source';
import { throttle } from 'lodash';
import { clearExistingUserMarkers, filterOnlineAndUnblockedUsers } from './utils/markerUtils';
import { addNearbyUserMarkers, addCurrentUserMarker } from './utils/userMarkers';
import { shouldObfuscateLocation } from '@/utils/privacyUtils';

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
  
  // Create a throttled update function for better performance
  const throttledUpdateMarkers = useCallback(
    throttle((
      source: VectorSource,
      users: AppUser[],
      user: AppUser | null,
      radius: number,
      tracking: boolean
    ) => {
      // Don't proceed if there's no source
      if (!source) return;
      
      console.log("updateMarkers: tracking=", tracking, "users=", users.length);
      
      // Clear existing user markers (but keep circle markers)
      clearExistingUserMarkers(source);
      
      // Filter to only show online and unblocked users
      const onlineUsers = filterOnlineAndUnblockedUsers(users, user);
      console.log(`Filtered to ${onlineUsers.length} online users out of ${users.length} total`);
      
      // ALWAYS add markers for nearby users, regardless of tracking state
      // This ensures users are clickable even when tracking is off
      addNearbyUserMarkers(onlineUsers, user, radius, source);
      
      // Check if privacy is enabled for current user
      const isPrivacyEnabled = shouldObfuscateLocation(user);
      
      // Only add user marker if privacy is OFF and tracking is ON
      if (tracking && user && !isPrivacyEnabled) {
        addCurrentUserMarker(user, source);
      }
      
    }, 100, { leading: true, trailing: true }),
    []
  );
  
  // Update refs when props change to use in cleanup functions
  useEffect(() => {
    nearbyUsersRef.current = nearbyUsers;
    currentUserRef.current = currentUser;
    prevRadiusRef.current = radiusInKm;
    prevTrackingRef.current = isTracking;
  }, [nearbyUsers, currentUser, radiusInKm, isTracking]);
  
  // Main effect to update map markers
  useEffect(() => {
    if (!mapLoaded || !vectorSource.current) return;
    
    console.log("useMarkerUpdater effect triggered, isTracking:", isTracking);
    
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
        isTracking
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
    throttledUpdateMarkers
  ]);

  // Create a separate event listener manager
  useEffect(() => {
    const handleLocationChange = () => {
      if (!vectorSource.current || !mapLoaded) return;
      
      // Use timeout to avoid too frequent updates
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
      }
      
      updateTimeoutRef.current = window.setTimeout(() => {
        throttledUpdateMarkers(
          vectorSource.current!, 
          nearbyUsersRef.current, 
          currentUserRef.current, 
          prevRadiusRef.current, 
          prevTrackingRef.current
        );
        updateTimeoutRef.current = null;
      }, 50);
    };
    
    // Handle privacy mode changes
    const handlePrivacyModeChange = (event: CustomEvent) => {
      if (!vectorSource.current || !mapLoaded) return;
      
      if (event.detail && event.detail.isPrivacyEnabled !== undefined) {
        // Clear all user markers first to avoid duplicates
        clearExistingUserMarkers(vectorSource.current);
        
        // Force an update after privacy change
        throttledUpdateMarkers(
          vectorSource.current!, 
          nearbyUsersRef.current, 
          currentUserRef.current, 
          prevRadiusRef.current, 
          prevTrackingRef.current
        );
      }
    };
    
    // Handle tracking mode changes
    const handleTrackingModeChange = (event: Event) => {
      if (!vectorSource.current || !mapLoaded) return;
      
      const customEvent = event as CustomEvent;
      const isTracking = customEvent.detail?.isTracking;
      
      if (isTracking !== undefined) {
        console.log("Tracking mode changed to:", isTracking);
        
        // Clear all user markers first to avoid duplicates
        clearExistingUserMarkers(vectorSource.current);
        
        // Force an update with new tracking state
        throttledUpdateMarkers(
          vectorSource.current!,
          nearbyUsersRef.current, 
          currentUserRef.current, 
          prevRadiusRef.current, 
          isTracking
        );
      }
    };
    
    window.addEventListener('user-location-changed', handleLocationChange);
    window.addEventListener('privacy-mode-changed', handlePrivacyModeChange as EventListener);
    window.addEventListener('tracking-mode-changed', handleTrackingModeChange as EventListener);
    
    return () => {
      window.removeEventListener('user-location-changed', handleLocationChange);
      window.removeEventListener('privacy-mode-changed', handlePrivacyModeChange as EventListener);
      window.removeEventListener('tracking-mode-changed', handleTrackingModeChange as EventListener);
      
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
      }
      
      // Cancel any pending throttled updates
      throttledUpdateMarkers.cancel();
    };
  }, [throttledUpdateMarkers, mapLoaded]);
};
