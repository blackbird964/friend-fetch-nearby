
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
    // Find the map container by ID since ref might not be available
    const container = document.getElementById('map');
    
    if (!container) {
      console.error("Map container with id 'map' not found");
      return;
    }

    // Clear any existing map content
    container.innerHTML = '';

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

    console.log("Map initialized with container:", container.id);
    setMapLoaded(true);

    return () => {
      if (map.current) {
        map.current.setTarget(undefined);
        map.current = null;
        console.log("Map destroyed");
        setMapLoaded(false);
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
