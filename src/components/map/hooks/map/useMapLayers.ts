
import { useRef } from 'react';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';

export const useMapLayers = () => {
  const vectorSource = useRef<VectorSource | null>(null);
  const vectorLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const routeLayer = useRef<VectorLayer<VectorSource> | null>(null);
  
  // Create vector sources and layers
  const createLayers = () => {
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

    // Create base tile layer
    const baseLayer = new TileLayer({
      source: new OSM()
    });

    return { baseLayer, vectorLayer: vectorLayer.current, routeLayer: routeLayer.current };
  };

  return {
    vectorSource,
    vectorLayer,
    routeLayer,
    createLayers
  };
};
