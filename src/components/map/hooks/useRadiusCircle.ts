
import { useEffect, useRef, useState, useCallback } from 'react';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Circle } from 'ol/geom';
import { Fill, Style, Stroke } from 'ol/style';
import Map from 'ol/Map';
import { AppUser } from '@/context/types';

export const useRadiusCircle = (
  map: React.MutableRefObject<Map | null>,
  vectorSource: React.MutableRefObject<VectorSource | null>,
  currentUser: AppUser | null,
  radiusInKm: number,
) => {
  const radiusLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const radiusFeature = useRef<Feature | null>(null);
  const [isLayerInitialized, setIsLayerInitialized] = useState(false);
  const lastRadiusRef = useRef(radiusInKm);
  const throttleTimeoutRef = useRef<number | null>(null);
  
  // Separated update function to prevent recreation on each render
  const updateRadiusCircle = useCallback((location: {lat: number, lng: number}, radius: number) => {
    if (!radiusLayer.current || !map.current) return;
    
    const source = radiusLayer.current.getSource();
    if (!source) return;
    
    // Clear existing features
    source.clear();
    
    // Convert coordinates and create the circle
    const center = fromLonLat([location.lng, location.lat]);
    const radiusInMeters = radius * 1000; // Convert km to meters
    
    radiusFeature.current = new Feature({
      geometry: new Circle(center, radiusInMeters),
      name: 'radiusCircle',
      isCircle: true,
      circleType: 'radius',
    });
    
    // Add the feature to the source
    source.addFeature(radiusFeature.current);
    
    // Store the last radius
    lastRadiusRef.current = radius;
  }, [map]);
  
  // Create a separate layer for radius circle
  useEffect(() => {
    if (!map.current) return;
    
    // Clean up existing layer if it exists
    if (radiusLayer.current) {
      map.current.removeLayer(radiusLayer.current);
      radiusLayer.current = null;
    }
    
    // Create a new source for better performance isolation
    const source = new VectorSource();
    
    const radiusStyle = new Style({
      fill: new Fill({
        color: 'rgba(66, 133, 244, 0.15)', // Semi-transparent blue
      }),
      stroke: new Stroke({
        color: 'rgba(64, 99, 255, 0.7)',
        width: 2,
        lineDash: [5, 5]
      }),
    });
    
    radiusLayer.current = new VectorLayer({
      source,
      style: radiusStyle,
      zIndex: 5, // Lower than privacy circle
      updateWhileAnimating: false, // Performance optimization
      updateWhileInteracting: false, // Performance optimization
    });
    
    map.current.addLayer(radiusLayer.current);
    setIsLayerInitialized(true);
    
    // Update on initialization if we have data
    if (currentUser?.location) {
      updateRadiusCircle(currentUser.location, radiusInKm);
    }
    
    return () => {
      if (map.current && radiusLayer.current) {
        map.current.removeLayer(radiusLayer.current);
        radiusLayer.current = null;
      }
      
      // Clear any pending timeouts
      if (throttleTimeoutRef.current !== null) {
        window.clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [map, updateRadiusCircle, currentUser?.location, radiusInKm]);
  
  // Update radius circle when user location changes (with throttling)
  useEffect(() => {
    if (!currentUser?.location || !isLayerInitialized) return;
    
    // Throttle updates to improve performance
    if (throttleTimeoutRef.current !== null) {
      window.clearTimeout(throttleTimeoutRef.current);
    }
    
    throttleTimeoutRef.current = window.setTimeout(() => {
      updateRadiusCircle(currentUser.location!, radiusInKm);
      throttleTimeoutRef.current = null;
    }, 100); // Small delay to batch updates
    
    return () => {
      if (throttleTimeoutRef.current !== null) {
        window.clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [currentUser?.location, radiusInKm, isLayerInitialized, updateRadiusCircle]);
  
  // Listen for radius changes from external events
  useEffect(() => {
    const handleRadiusChange = (e: CustomEvent) => {
      if (!currentUser?.location) return;
      
      // Throttle updates for smoother performance
      if (throttleTimeoutRef.current !== null) {
        window.clearTimeout(throttleTimeoutRef.current);
      }
      
      throttleTimeoutRef.current = window.setTimeout(() => {
        updateRadiusCircle(currentUser.location!, e.detail);
        throttleTimeoutRef.current = null;
      }, 50);
    };
    
    window.addEventListener('radius-changed', handleRadiusChange as EventListener);
    
    return () => {
      window.removeEventListener('radius-changed', handleRadiusChange as EventListener);
      if (throttleTimeoutRef.current !== null) {
        window.clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [currentUser?.location, updateRadiusCircle]);
  
  // Handle zoom changes with improved performance
  useEffect(() => {
    if (!map.current || !currentUser?.location || !isLayerInitialized) return;
    
    const view = map.current.getView();
    
    // Don't recreate this function on every render
    const fixRadiusOnZoomChange = () => {
      if (!currentUser?.location || !radiusFeature.current || !radiusLayer.current) return;
      
      // Simply update the radius to current value - this ensures fixed size regardless of zoom
      updateRadiusCircle(currentUser.location, lastRadiusRef.current);
    };
    
    view.on('change:resolution', fixRadiusOnZoomChange);
    
    return () => {
      view.un('change:resolution', fixRadiusOnZoomChange);
    };
  }, [map, currentUser?.location, isLayerInitialized, updateRadiusCircle]);
  
  return { radiusLayer, radiusFeature };
};
