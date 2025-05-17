
import { useEffect, useRef } from 'react';
import { Vector as VectorSource } from 'ol/source';
import { throttle } from 'lodash';

/**
 * Hook to handle marker visibility changes based on tracking state
 */
export const useMarkerVisibility = (
  vectorSource: React.MutableRefObject<VectorSource | null>,
  isTracking: boolean,
  mapLoaded: boolean
) => {
  const prevTrackingRef = useRef(isTracking);
  
  // Handle visibility when tracking state changes
  useEffect(() => {
    if (!mapLoaded || !vectorSource.current) return;
    
    // Only take action if tracking state has changed
    if (isTracking !== prevTrackingRef.current) {
      prevTrackingRef.current = isTracking;
      
      // When tracking is turned off, clear user markers
      if (!isTracking) {
        const features = vectorSource.current.getFeatures();
        const featuresToRemove = features.filter(feature => {
          const isCircle = feature.get('isCircle');
          const isUserMarker = feature.get('isCurrentUser') || feature.get('userId');
          return !isCircle && isUserMarker;
        });
        
        featuresToRemove.forEach(feature => {
          vectorSource.current?.removeFeature(feature);
        });
      } else {
        // When tracking is turned on, dispatch event to refresh markers
        window.dispatchEvent(new CustomEvent('user-location-changed'));
      }
    }
  }, [isTracking, vectorSource, mapLoaded]);
  
  return { prevTrackingState: prevTrackingRef.current };
};
