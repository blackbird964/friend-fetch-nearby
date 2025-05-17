
import { useEffect, useRef } from 'react';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Fill, Style, Stroke } from 'ol/style';
import Map from 'ol/Map';

/**
 * Hook to initialize and manage the privacy circle layer
 */
export const usePrivacyCircleLayer = (
  map: React.MutableRefObject<Map | null>
) => {
  const privacyLayer = useRef<VectorLayer<VectorSource> | null>(null);

  // Create a separate layer for the privacy circle to improve performance
  useEffect(() => {
    if (!map.current) return;
    
    // Clean up existing layer if it exists
    if (privacyLayer.current) {
      map.current.removeLayer(privacyLayer.current);
      privacyLayer.current = null;
    }
    
    // Create the privacy layer with appropriate styling
    const source = new VectorSource();
    
    // Initial style with improved visibility (will be animated)
    const privacyStyle = new Style({
      fill: new Fill({
        color: 'rgba(155, 135, 245, 0.3)', // Purple color with initial opacity
      }),
      stroke: new Stroke({
        color: 'rgba(155, 135, 245, 0.8)', // Purple border
        width: 2,
      }),
    });
    
    privacyLayer.current = new VectorLayer({
      source,
      style: privacyStyle,
      zIndex: 10, // Higher than regular markers but lower than selected markers
    });
    
    map.current.addLayer(privacyLayer.current);
    
    return () => {
      if (map.current && privacyLayer.current) {
        map.current.removeLayer(privacyLayer.current);
        privacyLayer.current = null;
      }
    };
  }, [map]);
  
  return { privacyLayer };
};
