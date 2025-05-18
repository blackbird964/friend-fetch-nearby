
import { useRef, useCallback } from 'react';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Circle } from 'ol/geom';
import Map from 'ol/Map';
import { AppUser } from '@/context/types';

/**
 * Hook to handle the radius circle feature updates
 */
export const useRadiusFeature = (
  map: React.MutableRefObject<Map | null>,
  radiusLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>,
  currentUser: AppUser | null,
  radiusInKm: number,
  isTracking: boolean = false
) => {
  const radiusFeature = useRef<Feature | null>(null);

  // Separated update function to avoid recreation in effects
  const updateRadiusCircle = useCallback(() => {
    console.log("updateRadiusCircle called with:", {
      hasMap: !!map.current,
      hasLayer: !!radiusLayer.current,
      hasLocation: !!currentUser?.location,
      radiusInKm,
      isTracking
    });
    
    if (!radiusLayer.current || !map.current || !currentUser?.location || !isTracking) {
      console.log("Cannot update radius circle - missing required elements or tracking disabled");
      
      // Clear the radius if tracking is disabled
      if (!isTracking && radiusLayer.current) {
        const source = radiusLayer.current.getSource();
        if (source) {
          source.clear();
          console.log("Radius circle cleared - tracking disabled");
        }
      }
      return;
    }

    const { lng, lat } = currentUser.location;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      console.log("Invalid location coordinates:", currentUser.location);
      return;
    }
    
    const center = fromLonLat([lng, lat]);
    const radiusInMeters = radiusInKm * 1000; // Convert km to meters
    console.log(`Creating radius circle: ${radiusInKm}km (${radiusInMeters}m) at [${lng}, ${lat}]`);

    const source = radiusLayer.current.getSource();
    if (!source) {
      console.log("No source in radius layer");
      return;
    }
    
    // Clear existing feature
    source.clear();

    // Create new radius feature with improved visibility
    radiusFeature.current = new Feature({
      geometry: new Circle(center, radiusInMeters),
      name: 'radiusCircle',
      isCircle: true,
      circleType: 'radius',
    });

    // Add the feature to the source
    source.addFeature(radiusFeature.current);
    console.log(`Radius circle added to source: ${radiusInKm}km around [${lng}, ${lat}]`);
  }, [currentUser?.location, radiusInKm, map, radiusLayer, isTracking]);

  return { 
    radiusFeature,
    updateRadiusCircle
  };
};
