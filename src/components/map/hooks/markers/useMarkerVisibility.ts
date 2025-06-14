
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
  
  // Update marker visibility when tracking state changes
  useEffect(() => {
    if (!vectorSource.current || !mapLoaded) return;
    
    console.log("useMarkerVisibility - Tracking changed:", isTracking);
    
    // When tracking is disabled, hide all markers temporarily
    if (!isTracking) {
      const features = vectorSource.current.getFeatures();
      
      features.forEach(feature => {
        // Skip circle features (radius and privacy)
        if (feature.get('isCircle')) return;
        
        // Store original visibility and hide normal markers when tracking is off
        if (!feature.get('originalVisible')) {
          feature.set('originalVisible', feature.get('visible') !== false);
        }
        feature.set('visible', false);
      });
      
      // Force refresh
      vectorSource.current.changed();
      
      console.log("Markers hidden due to tracking disabled");
    } else {
      // When tracking is enabled, restore marker visibility
      const features = vectorSource.current.getFeatures();
      
      features.forEach(feature => {
        // Skip circle features (radius and privacy)
        if (feature.get('isCircle')) return;
        
        // Restore original visibility or set to true
        const originalVisible = feature.get('originalVisible');
        feature.set('visible', originalVisible !== false);
        
        // Clean up the temporary property
        feature.unset('originalVisible');
      });
      
      // Force refresh
      vectorSource.current.changed();
      
      console.log("Markers shown due to tracking enabled");
    }
    
    // Dispatch event to notify other components about visibility change
    window.dispatchEvent(new CustomEvent('marker-visibility-changed', { 
      detail: { isVisible: isTracking } 
    }));
    
  }, [isTracking, vectorSource, mapLoaded]);
  
  return null;
};
