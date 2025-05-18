
import { useRef } from 'react';
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
  radiusInKm: number
) => {
  // Create the layer for the radius circle with blue styling
  const { radiusLayer } = useRadiusLayer(map);
  
  // Create and manage the radius feature
  const { radiusFeature, updateRadiusCircle } = useRadiusFeature(
    map,
    radiusLayer,
    currentUser,
    radiusInKm
  );
  
  // Handle updates based on user location and radius changes
  useRadiusCircleUpdater(
    map,
    radiusLayer,
    radiusFeature,
    currentUser,
    radiusInKm,
    updateRadiusCircle
  );

  // Ensure the radius is updated immediately on initialization
  if (map.current && radiusLayer.current && currentUser?.location) {
    setTimeout(() => {
      updateRadiusCircle();
    }, 100);
  }

  return { radiusLayer, radiusFeature, updateRadiusCircle };
};
