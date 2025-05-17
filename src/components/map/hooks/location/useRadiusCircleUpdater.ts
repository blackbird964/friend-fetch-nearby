
import { useEffect } from 'react';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import { AppUser } from '@/context/types';

/**
 * Hook to handle radius circle updates when user location or radius changes
 */
export const useRadiusCircleUpdater = (
  map: React.MutableRefObject<Map | null>,
  radiusLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>,
  radiusFeature: React.MutableRefObject<Feature | null>,
  currentUser: AppUser | null,
  radiusInKm: number,
  updateRadiusCircle: () => void
) => {
  // Update radius circle when user location or radius changes
  useEffect(() => {
    if (!currentUser || !map.current || !radiusLayer.current) return;

    updateRadiusCircle();

    // Maintain circle size on zoom changes
    const view = map.current.getView();

    // Don't recreate this function on every render
    const fixCircleOnZoomChange = () => {
      updateRadiusCircle();
    };

    view.on('change:resolution', fixCircleOnZoomChange);

    // Cleanup zoom listener
    return () => {
      view.un('change:resolution', fixCircleOnZoomChange);
    };
  }, [currentUser?.location, radiusInKm, map, radiusLayer, updateRadiusCircle]);
};
