
import { useEffect, useRef, useState } from 'react';
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
  const [lastRadius, setLastRadius] = useState(radiusInKm);
  
  console.log("useRadiusCircle - Current radius:", radiusInKm, "km, user:", currentUser?.id);
  
  // Create a separate layer for the radius circle - independent from the main vector layer
  useEffect(() => {
    if (!map.current) {
      console.log("Map reference not available for radius circle");
      return;
    }
    
    console.log("Initializing radius circle layer, map is available");
    
    // Always recreate the layer to ensure it's fresh
    if (radiusLayer.current) {
      console.log("Removing existing radius layer");
      map.current.removeLayer(radiusLayer.current);
      radiusLayer.current = null;
    }
    
    // Create a new layer with its own source
    console.log("Creating new radius circle layer");
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
      zIndex: 99, // Much higher zIndex to ensure visibility
      properties: {
        updateWhileAnimating: true,
        updateWhileInteracting: true
      }
    });
    
    console.log("Adding radius layer to map");
    map.current.addLayer(radiusLayer.current);
    setIsLayerInitialized(true);
    
    // Force update the circle right after layer initialization
    if (currentUser?.location) {
      setTimeout(() => updateRadiusCircle(currentUser.location, radiusInKm), 100);
    }
    
    return () => {
      if (map.current && radiusLayer.current) {
        console.log("Cleanup: Removing radius layer from map");
        map.current.removeLayer(radiusLayer.current);
        radiusLayer.current = null;
        setIsLayerInitialized(false);
      }
    };
  }, [map]); // Only recreate when map changes
  
  // Separate function to update the radius circle
  const updateRadiusCircle = (location: {lat: number, lng: number}, radius: number) => {
    if (!radiusLayer.current || !map.current || !isLayerInitialized) {
      console.log("Cannot update radius circle: layer not initialized");
      return;
    }
    
    const source = radiusLayer.current.getSource();
    if (!source) {
      console.error("Radius layer source is null");
      return;
    }
    
    // Clear existing features
    source.clear();
    
    console.log("Creating radius circle at:", location.lat, location.lng, "with radius:", radius, "km");
    
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
    
    // Force redraw
    radiusLayer.current.changed();
    source.changed();
    map.current.render();
    
    console.log("Radius circle updated with radius:", radius, "km");
    setLastRadius(radius);
  };
  
  // Update radius circle when user location or radius changes
  useEffect(() => {
    console.log("Radius circle update triggered - radius:", radiusInKm, "km");
    console.log("Current user location:", currentUser?.location);
    
    if (!currentUser?.location) {
      console.log("Current user has no location, not creating radius circle");
      return;
    }
    
    const { lat, lng } = currentUser.location;
    
    // Update the circle if we have a location and either the radius changed or location changed
    if (lat && lng && (radiusInKm !== lastRadius || isLayerInitialized)) {
      updateRadiusCircle(currentUser.location, radiusInKm);
    }
  }, [currentUser?.location, radiusInKm, map, isLayerInitialized, lastRadius]);
  
  // Listen for view changes and maintain fixed radius size regardless of zoom level
  useEffect(() => {
    if (!map.current || !currentUser?.location || !isLayerInitialized) {
      return;
    }
    
    const { lat, lng } = currentUser.location;
    if (!lat || !lng) return;
    
    // Get the map's view
    const view = map.current.getView();
    
    // This function maintains the fixed size on zoom changes
    const fixRadiusOnZoomChange = () => {
      if (!currentUser?.location || !radiusFeature.current || !radiusLayer.current) return;
      
      // Get the center in map projection
      const center = fromLonLat([currentUser.location.lng, currentUser.location.lat]);
      
      // Update the circle with the fixed radius
      const geometry = new Circle(center, radiusInKm * 1000);
      radiusFeature.current.setGeometry(geometry);
      
      // Force redraw
      if (radiusLayer.current) {
        radiusLayer.current.changed();
      }
    };
    
    // Add listener for resolution (zoom) changes
    view.on('change:resolution', fixRadiusOnZoomChange);
    
    // Initial update to ensure correct size
    fixRadiusOnZoomChange();
    
    return () => {
      // Clean up listener
      view.un('change:resolution', fixRadiusOnZoomChange);
    };
  }, [map, currentUser?.location, radiusInKm, isLayerInitialized]);
  
  return { radiusLayer, radiusFeature };
};
