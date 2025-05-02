
import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import { useMapLayers } from './map/useMapLayers';
import { useMapConfig, WYNYARD_COORDS } from './map/useMapConfig';

export { WYNYARD_COORDS };

export const useMapInitialization = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const { vectorSource, vectorLayer, routeLayer, createLayers } = useMapLayers();
  const { createMapView } = useMapConfig();

  useEffect(() => {
    if (!mapContainer.current) return;

    // Create layers
    const { baseLayer, vectorLayer: vLayer, routeLayer: rLayer } = createLayers();
    
    // Initialize map
    map.current = new Map({
      target: mapContainer.current,
      layers: [
        baseLayer,
        rLayer,
        vLayer
      ],
      view: createMapView()
    });

    setMapLoaded(true);

    return () => {
      if (map.current) {
        map.current.setTarget(undefined);
      }
    };
  }, []);

  return {
    mapContainer,
    map,
    vectorSource,
    vectorLayer,
    routeLayer,
    mapLoaded,
  };
};
