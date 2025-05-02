
import { fromLonLat } from 'ol/proj';
import View from 'ol/View';

// Default coordinates for Wynyard
export const WYNYARD_COORDS = [151.2073, -33.8666];

export const useMapConfig = () => {
  // Create map view configuration
  const createMapView = () => {
    return new View({
      center: fromLonLat(WYNYARD_COORDS),
      zoom: 14
    });
  };

  return { createMapView, WYNYARD_COORDS };
};
