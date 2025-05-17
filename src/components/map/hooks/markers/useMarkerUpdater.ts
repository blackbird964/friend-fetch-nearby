import { useEffect, useCallback, useRef } from 'react';
import { AppUser } from '@/context/types';
import { Vector as VectorSource } from 'ol/source';
import { throttle } from 'lodash';
import { clearExistingUserMarkers, filterOnlineAndUnblockedUsers } from './utils/markerUtils';
import { addNearbyUserMarkers, addCurrentUserMarker } from './utils/userMarkers';

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
      
      // Clear existing user markers (but keep circle markers)
      clearExistingUserMarkers(source);
      
      // If tracking is disabled, don't show any users
      if (!tracking) return;
      
      // Filter to only show online and unblocked users
      const onlineUsers = filterOnlineAndUnblockedUsers(users, user);
      
      // Add markers for nearby users
      addNearbyUserMarkers(onlineUsers, user, radius, source);
      
      // Check if privacy is enabled for current user
      const isPrivacyEnabled = user ? shouldObfuscateLocation(user) : false;
      
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
        // Clear current user marker when privacy is enabled
        if (event.detail.isPrivacyEnabled) {
          const features = vectorSource.current.getFeatures();
          features.forEach(feature => {
            if (feature.get('isCurrentUser')) {
              vectorSource.current?.removeFeature(feature);
            }
          });
        } else {
          // Re-add current user marker when privacy is disabled
          if (prevTrackingRef.current && currentUserRef.current?.location) {
            addCurrentUserMarker(currentUserRef.current, vectorSource.current);
          }
        }
        
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
    
    window.addEventListener('user-location-changed', handleLocationChange);
    window.addEventListener('privacy-mode-changed', handlePrivacyModeChange as EventListener);
    
    return () => {
      window.removeEventListener('user-location-changed', handleLocationChange);
      window.removeEventListener('privacy-mode-changed', handlePrivacyModeChange as EventListener);
      
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
      }
      
      // Cancel any pending throttled updates
      throttledUpdateMarkers.cancel();
    };
  }, [throttledUpdateMarkers, mapLoaded]);
};

// Import shouldObfuscateLocation directly in this file as it's needed for the hook
import { shouldObfuscateLocation } from '@/utils/privacyUtils';
