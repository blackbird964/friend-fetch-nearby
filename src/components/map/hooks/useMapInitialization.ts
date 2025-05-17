
import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import { useMapLayers } from './map/useMapLayers';
import { useMapConfig, WYNYARD_COORDS } from './map/useMapConfig';

export const useMapInitialization = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const { vectorSource, vectorLayer, routeLayer, createLayers } = useMapLayers();
  const { createMapView } = useMapConfig();

  useEffect(() => {
    // Find the map container either by ref or by ID
    const container = mapContainer.current || document.getElementById('map-container');
    
    if (!container) {
      console.error("Map container not found");
      return;
    }

    // Create layers
    const { baseLayer, vectorLayer: vLayer, routeLayer: rLayer } = createLayers();
    
    // Initialize map
    map.current = new Map({
      target: container,
      layers: [
        baseLayer,
        rLayer,
        vLayer
      ],
      view: createMapView()
    });

    console.log("Map initialized");
    setMapLoaded(true);

    return () => {
      if (map.current) {
        map.current.setTarget(undefined);
        map.current = null;
        console.log("Map destroyed");
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
    WYNYARD_COORDS,
  };
};
