
import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';

// Default coordinates for Wynyard
export const WYNYARD_COORDS = [151.2073, -33.8666];

export const useMapInitialization = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const vectorSource = useRef<VectorSource | null>(null);
  const vectorLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const routeLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Create vector sources and layers
    vectorSource.current = new VectorSource();
    const routeSource = new VectorSource();
    
    vectorLayer.current = new VectorLayer({
      source: vectorSource.current,
      style: () => undefined // We'll set this in the FriendMap component
    });

    routeLayer.current = new VectorLayer({
      source: routeSource,
      style: () => undefined // We'll set this in the FriendMap component
    });

    map.current = new Map({
      target: mapContainer.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        routeLayer.current,
        vectorLayer.current
      ],
      view: new View({
        center: fromLonLat(WYNYARD_COORDS),
        zoom: 14
      })
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
