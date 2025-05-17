
import { useEffect, useRef } from 'react';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Style, Stroke, Fill } from 'ol/style';
import Map from 'ol/Map';

/**
 * Hook to initialize and manage the radius circle layer
 */
export const useRadiusLayer = (
  map: React.MutableRefObject<Map | null>
) => {
  const radiusLayer = useRef<VectorLayer<VectorSource> | null>(null);

  // Create a separate layer for the radius circle to improve performance
  useEffect(() => {
    if (!map.current) return;

    // Clean up existing layer if it exists
    if (radiusLayer.current) {
      map.current.removeLayer(radiusLayer.current);
      radiusLayer.current = null;
    }

    // Create the radius layer with appropriate styling
    const source = new VectorSource();
    radiusLayer.current = new VectorLayer({
      source,
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(59, 130, 246, 0.7)', // Brighter blue color for better visibility
          width: 3,
          lineDash: [5, 5]
        }),
        fill: new Fill({
          color: 'rgba(59, 130, 246, 0.08)' // Slightly more visible blue fill
        })
      }),
      zIndex: 9, // Below user markers
    });

    map.current.addLayer(radiusLayer.current);

    return () => {
      if (map.current && radiusLayer.current) {
        map.current.removeLayer(radiusLayer.current);
        radiusLayer.current = null;
      }
    };
  }, [map]);

  return { radiusLayer };
};
