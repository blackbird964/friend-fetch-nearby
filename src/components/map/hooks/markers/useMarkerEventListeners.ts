
import { useEffect, useRef } from 'react';
import { Vector as VectorSource } from 'ol/source';
import { AppUser } from '@/context/types';
import { clearExistingUserMarkers } from './utils/markerUtils';

// Define the throttled function type with cancel method
type ThrottledUpdateFunction = ((
  source: VectorSource,
  users: AppUser[],
  user: AppUser | null,
  radius: number,
  tracking: boolean,
  isBusiness: boolean
) => void) & {
  cancel(): void;
};

export const useMarkerEventListeners = (
  vectorSource: React.MutableRefObject<VectorSource | null>,
  mapLoaded: boolean,
  isBusinessUser: boolean | null,
  throttledUpdateMarkers: ThrottledUpdateFunction,
  nearbyUsersRef: React.MutableRefObject<AppUser[]>,
  currentUserRef: React.MutableRefObject<AppUser | null>,
  prevRadiusRef: React.MutableRefObject<number>,
  prevTrackingRef: React.MutableRefObject<boolean>,
  updateTimeoutRef: React.MutableRefObject<number | null>
) => {
  // Create a separate event listener manager
  useEffect(() => {
    const handleLocationChange = () => {
      if (!vectorSource.current || !mapLoaded || isBusinessUser === null) return;
      
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
          prevTrackingRef.current,
          isBusinessUser || false
        );
        updateTimeoutRef.current = null;
      }, 50);
    };
    
    // Handle privacy mode changes
    const handlePrivacyModeChange = (event: CustomEvent) => {
      if (!vectorSource.current || !mapLoaded || isBusinessUser === null) return;
      
      if (event.detail && event.detail.isPrivacyEnabled !== undefined) {
        // Clear all user markers first to avoid duplicates
        clearExistingUserMarkers(vectorSource.current);
        
        // Force an update after privacy change
        throttledUpdateMarkers(
          vectorSource.current!, 
          nearbyUsersRef.current, 
          currentUserRef.current, 
          prevRadiusRef.current, 
          prevTrackingRef.current,
          isBusinessUser || false
        );
      }
    };
    
    // Handle tracking mode changes
    const handleTrackingModeChange = (event: Event) => {
      if (!vectorSource.current || !mapLoaded || isBusinessUser === null) return;
      
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
          isTracking,
          isBusinessUser || false
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
  }, [throttledUpdateMarkers, mapLoaded, isBusinessUser, vectorSource, nearbyUsersRef, currentUserRef, prevRadiusRef, prevTrackingRef, updateTimeoutRef]);
};
