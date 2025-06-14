
import { useEffect, useRef } from 'react';
import { Vector as VectorSource } from 'ol/source';

/**
 * Custom hook to manage marker visibility based on tracking state and zoom events
 */
export const useMarkerVisibility = (
  vectorSource: React.MutableRefObject<VectorSource | null>,
  isTracking: boolean,
  mapLoaded: boolean
) => {
  const isHandlingZoomRef = useRef(false);
  
  // Update marker visibility when tracking state changes
  useEffect(() => {
    if (!vectorSource.current || !mapLoaded || isHandlingZoomRef.current) return;
    
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
  
  // Handle zoom events to prevent markers from disappearing
  useEffect(() => {
    if (!vectorSource.current || !mapLoaded) return;
    
    const handleZoomStart = () => {
      isHandlingZoomRef.current = true;
      console.log("Zoom started - preserving marker visibility");
    };
    
    const handleZoomEnd = () => {
      // Delay to ensure zoom operation is complete
      setTimeout(() => {
        isHandlingZoomRef.current = false;
        
        if (vectorSource.current && isTracking) {
          const features = vectorSource.current.getFeatures();
          
          // Ensure all non-circle markers are visible after zoom
          features.forEach(feature => {
            if (!feature.get('isCircle')) {
              feature.set('visible', true);
            }
          });
          
          vectorSource.current.changed();
          console.log("Zoom ended - markers visibility restored");
        }
      }, 100);
    };
    
    // Listen for zoom events on the window
    window.addEventListener('map-zoom-start', handleZoomStart);
    window.addEventListener('map-zoom-end', handleZoomEnd);
    
    return () => {
      window.removeEventListener('map-zoom-start', handleZoomStart);
      window.removeEventListener('map-zoom-end', handleZoomEnd);
    };
  }, [vectorSource, mapLoaded, isTracking]);
  
  return null;
};
