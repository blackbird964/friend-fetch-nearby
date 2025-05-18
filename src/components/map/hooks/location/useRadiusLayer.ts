
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

    // Create the radius layer with improved styling - semi-transparent blue
    const source = new VectorSource();
    radiusLayer.current = new VectorLayer({
      source,
      style: new Style({
        stroke: new Stroke({
          color: '#3388ff', // bright blue border
          width: 2,
          lineDash: [5, 5]
        }),
        fill: new Fill({
          color: 'rgba(51, 136, 255, 0.1)' // semi-transparent blue fill (10% opacity)
        })
      }),
      zIndex: 9, // Below user markers but above base map
    });

    map.current.addLayer(radiusLayer.current);
    console.log("Radius layer created with blue styling");

    return () => {
      if (map.current && radiusLayer.current) {
        map.current.removeLayer(radiusLayer.current);
        radiusLayer.current = null;
      }
    };
  }, [map]);

  return { radiusLayer };
};
