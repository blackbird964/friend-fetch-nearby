
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
  radiusInKm: number
) => {
  const radiusFeature = useRef<Feature | null>(null);

  // Separated update function to avoid recreation in effects
  const updateRadiusCircle = useCallback(() => {
    if (!radiusLayer.current || !map.current || !currentUser?.location) {
      console.log("Cannot update radius circle - missing required elements");
      return;
    }

    const { lng, lat } = currentUser.location;
    const center = fromLonLat([lng, lat]);
    const radiusInMeters = radiusInKm * 1000; // Convert km to meters - IMPORTANT: this must be right!

    const source = radiusLayer.current.getSource();
    if (!source) return;
    
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
    console.log(`Radius circle updated to ${radiusInKm}km around [${lng}, ${lat}]`);
  }, [currentUser?.location, radiusInKm, map, radiusLayer]);

  return { 
    radiusFeature,
    updateRadiusCircle
  };
};
