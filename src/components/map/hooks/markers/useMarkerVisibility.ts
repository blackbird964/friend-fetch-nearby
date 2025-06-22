import { useEffect, useRef } from 'react';
import { Vector as VectorSource } from 'ol/source';

/**
 * Custom hook to manage marker visibility based on tracking state
 */
export const useMarkerVisibility = (
  vectorSource: React.MutableRefObject<VectorSource | null>,
  isTracking: boolean,
  mapLoaded: boolean
) => {
  const lastTrackingStateRef = useRef(isTracking);
  const visibilityTimeoutRef = useRef<number | null>(null);
  
  // Update marker visibility when tracking state changes
  useEffect(() => {
    if (!vectorSource.current || !mapLoaded) return;
    
    // Only process if tracking state actually changed
    if (lastTrackingStateRef.current === isTracking) return;
    
    console.log("useMarkerVisibility - Tracking changed:", isTracking);
    
    // Clear any pending visibility updates
    if (visibilityTimeoutRef.current) {
      clearTimeout(visibilityTimeoutRef.current);
    }
    
    // Debounce visibility updates to prevent flickering
    visibilityTimeoutRef.current = window.setTimeout(() => {
      if (!vectorSource.current) return;
      
      const features = vectorSource.current.getFeatures();
      
      features.forEach(feature => {
        // Skip circle features (radius and privacy)
        if (feature.get('isCircle')) return;
        
        // For user markers, always keep them visible regardless of tracking state
        // This prevents markers from randomly disappearing
        const isUserMarker = feature.get('userId') || feature.get('isCurrentUser') || feature.get('isCluster');
        if (isUserMarker) {
          // Always set markers as visible - tracking state shouldn't hide other users
          feature.set('visible', true);
          
          // Only hide the current user's marker when tracking is off
          if (feature.get('isCurrentUser') && !isTracking) {
            feature.set('visible', false);
          }
        }
      });
      
      // Force refresh
      vectorSource.current.changed();
      
      console.log(isTracking ? "Updated marker visibility - tracking enabled" : "Updated marker visibility - tracking disabled");
    }, 100); // Small delay to prevent rapid updates
    
    // Update ref to track state changes
    lastTrackingStateRef.current = isTracking;
    
    // Cleanup function
    return () => {
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
        visibilityTimeoutRef.current = null;
      }
    };
    
  }, [isTracking, vectorSource, mapLoaded]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, []);
  
  return null;
};
