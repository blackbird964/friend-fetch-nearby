
import { useEffect, useRef } from 'react';
import { Vector as VectorSource } from 'ol/source';

/**
 * Simplified marker visibility hook - ensure markers are always visible when they should be
 */
export const useMarkerVisibility = (
  vectorSource: React.MutableRefObject<VectorSource | null>,
  isTracking: boolean,
  mapLoaded: boolean
) => {
  const lastTrackingStateRef = useRef(isTracking);
  
  // Update marker visibility when tracking state changes
  useEffect(() => {
    if (!vectorSource.current || !mapLoaded) return;
    
    // Only process if tracking state actually changed
    if (lastTrackingStateRef.current === isTracking) return;
    
    console.log("Updating marker visibility - tracking:", isTracking);
    
    const features = vectorSource.current.getFeatures();
    
    features.forEach(feature => {
      // Skip circle features (radius and privacy)
      if (feature.get('isCircle')) return;
      
      // For all user markers, make them visible by default
      const isUserMarker = feature.get('userId') || feature.get('isCurrentUser') || feature.get('isCluster');
      if (isUserMarker) {
        // Always show other users' markers
        if (!feature.get('isCurrentUser')) {
          feature.set('visible', true);
        } else {
          // Only hide current user's marker when tracking is off
          feature.set('visible', isTracking);
        }
      }
    });
    
    // Force refresh
    vectorSource.current.changed();
    
    // Update ref to track state changes
    lastTrackingStateRef.current = isTracking;
    
  }, [isTracking, vectorSource, mapLoaded]);
  
  return null;
};
