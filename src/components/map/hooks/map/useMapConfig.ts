
import { useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';

// Sydney, Australia coordinates as default
export const WYNYARD_COORDS = [151.2073, -33.8651];

export const useMapConfig = () => {
  const map = useRef<Map | null>(null);
  
  const createMapView = () => {
    return new View({
      center: fromLonLat(WYNYARD_COORDS),
      zoom: 15,
      minZoom: 2,
      maxZoom: 19,
    });
  };
  
  return { map, createMapView };
};
