
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
  updateRadiusCircle: () => void,
  isTracking: boolean = false
) => {
  // Update radius circle when user location changes
  useEffect(() => {
    if (!isTracking) {
      // Clear radius when tracking is disabled
      if (radiusLayer.current) {
        const source = radiusLayer.current.getSource();
        if (source) source.clear();
      }
      return;
    }
    
    if (!currentUser?.location || !map.current || !radiusLayer.current) return;
    console.log("Location or radius changed, updating circle");
    updateRadiusCircle();
  }, [currentUser?.location, radiusInKm, updateRadiusCircle, isTracking, radiusLayer]);

  // Listen for the custom radius-changed event
  useEffect(() => {
    const handleRadiusChange = (e: Event) => {
      if (!isTracking) return;
      
      const customEvent = e as CustomEvent;
      console.log("Radius change event detected:", customEvent.detail);
      updateRadiusCircle();
    };

    window.addEventListener('radius-changed', handleRadiusChange);
    
    return () => {
      window.removeEventListener('radius-changed', handleRadiusChange);
    };
  }, [updateRadiusCircle, isTracking]);

  // Listen for the user-location-changed event
  useEffect(() => {
    const handleLocationChange = () => {
      if (!isTracking) return;
      
      console.log("User location changed event detected, updating circle");
      updateRadiusCircle();
    };

    window.addEventListener('user-location-changed', handleLocationChange);
    
    return () => {
      window.removeEventListener('user-location-changed', handleLocationChange);
    };
  }, [updateRadiusCircle, isTracking]);

  // Update circle when map view changes (zoom)
  useEffect(() => {
    if (!map.current || !isTracking) return;

    const view = map.current.getView();
    const handleViewChange = () => {
      if (!isTracking) return;
      
      console.log("Map view changed, updating radius circle");
      updateRadiusCircle();
    };

    view.on('change:resolution', handleViewChange);

    return () => {
      view.un('change:resolution', handleViewChange);
    };
  }, [map, updateRadiusCircle, isTracking]);
};
