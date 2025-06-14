
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
  
  // Update marker visibility when tracking state changes
  useEffect(() => {
    if (!vectorSource.current || !mapLoaded) return;
    
    // Only process if tracking state actually changed
    if (lastTrackingStateRef.current === isTracking) return;
    
    console.log("useMarkerVisibility - Tracking changed:", isTracking);
    
    const features = vectorSource.current.getFeatures();
    
    features.forEach(feature => {
      // Skip circle features (radius and privacy)
      if (feature.get('isCircle')) return;
      
      // For user markers, set visibility based on tracking state
      const isUserMarker = feature.get('userId') || feature.get('isCurrentUser') || feature.get('isCluster');
      if (isUserMarker) {
        feature.set('visible', isTracking);
      }
    });
    
    // Force refresh
    vectorSource.current.changed();
    
    // Update ref to track state changes
    lastTrackingStateRef.current = isTracking;
    
    console.log(isTracking ? "Markers shown due to tracking enabled" : "Markers hidden due to tracking disabled");
    
    // Dispatch event to notify other components about visibility change
    window.dispatchEvent(new CustomEvent('marker-visibility-changed', { 
      detail: { isVisible: isTracking } 
    }));
    
  }, [isTracking, vectorSource, mapLoaded]);
  
  return null;
};
