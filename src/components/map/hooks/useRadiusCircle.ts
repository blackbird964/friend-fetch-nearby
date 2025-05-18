
import { useEffect } from 'react';
import { Vector as VectorSource } from 'ol/source';
import Map from 'ol/Map';
import { AppUser } from '@/context/types';
import { useRadiusLayer } from './location/useRadiusLayer';
import { useRadiusFeature } from './location/useRadiusFeature';
import { useRadiusCircleUpdater } from './location/useRadiusCircleUpdater';

/**
 * Hook combining all radius circle functionality
 */
export const useRadiusCircle = (
  map: React.MutableRefObject<Map | null>,
  vectorSource: React.MutableRefObject<VectorSource | null>,
  currentUser: AppUser | null,
  radiusInKm: number,
  isTracking: boolean = false
) => {
  // Create the layer for the radius circle with blue styling
  const { radiusLayer } = useRadiusLayer(map);
  
  // Create and manage the radius feature
  const { radiusFeature, updateRadiusCircle } = useRadiusFeature(
    map,
    radiusLayer,
    currentUser,
    radiusInKm,
    isTracking
  );
  
  // Handle updates based on user location and radius changes
  useRadiusCircleUpdater(
    map,
    radiusLayer,
    radiusFeature,
    currentUser,
    radiusInKm,
    updateRadiusCircle,
    isTracking
  );

  // Ensure the radius is updated immediately on initialization and when radius changes
  useEffect(() => {
    if (!isTracking) {
      // Clear radius visualization when tracking is disabled
      if (radiusLayer.current) {
        const source = radiusLayer.current.getSource();
        if (source) source.clear();
      }
      return;
    }
    
    if (map.current && radiusLayer.current && currentUser?.location) {
      console.log("Initial radius update with radiusInKm:", radiusInKm, "tracking:", isTracking);
      // Small delay to ensure all components are initialized
      setTimeout(() => {
        updateRadiusCircle();
      }, 100);
    }
  }, [map, radiusLayer, currentUser?.location, radiusInKm, updateRadiusCircle, isTracking]);

  return { radiusLayer, radiusFeature, updateRadiusCircle };
};
