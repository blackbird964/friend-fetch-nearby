
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
  
  // Create a separate layer for the radius circle
  useEffect(() => {
    if (!map.current) {
      console.log("Map reference not available for radius circle");
      return;
    }
    
    console.log("Initializing radius circle layer, map is available");
    
    if (!radiusLayer.current) {
      console.log("Creating new radius circle layer");
      
      // Create a separate source for the radius circle
      const source = new VectorSource();
      
      radiusLayer.current = new VectorLayer({
        source,
        style: new Style({
          fill: new Fill({
            color: 'rgba(66, 133, 244, 0.2)', // Semi-transparent blue
          }),
          stroke: new Stroke({
            color: 'rgba(64, 99, 255, 0.5)',
            width: 2,
            lineDash: [5, 5]
          }),
        }),
        zIndex: 2, // Make sure it's visible (higher than other layers)
      });
      
      console.log("Adding radius layer to map");
      map.current.addLayer(radiusLayer.current);
      setIsLayerInitialized(true);
    }
    
    return () => {
      if (map.current && radiusLayer.current) {
        console.log("Removing radius layer from map");
        map.current.removeLayer(radiusLayer.current);
        radiusLayer.current = null;
        setIsLayerInitialized(false);
      }
    };
  }, [map]);
  
  // Update radius circle when user location or radius changes
  useEffect(() => {
    if (!radiusLayer.current || !map.current) {
      console.log("Radius layer or map not available for updating circle");
      return;
    }
    
    if (!isLayerInitialized) {
      console.log("Layer not initialized yet, skipping radius update");
      return;
    }
    
    console.log("Updating radius circle with radius:", radiusInKm, "km");
    
    // Clear existing radius feature
    if (radiusFeature.current) {
      console.log("Removing existing radius feature");
      radiusLayer.current.getSource()?.removeFeature(radiusFeature.current);
      radiusFeature.current = null;
    }
    
    // Create a new radius circle if user has a location
    if (currentUser?.location) {
      const { lng, lat } = currentUser.location;
      console.log("Creating radius circle at:", lng, lat, "with radius:", radiusInKm, "km");
      
      const center = fromLonLat([lng, lat]);
      
      // Convert km to map units (meters)
      const radiusInMeters = radiusInKm * 1000;
      
      console.log("Creating radius circle with radius in meters:", radiusInMeters);
      
      // Create the circle feature with proper naming for identification
      radiusFeature.current = new Feature({
        geometry: new Circle(center, radiusInMeters),
        name: 'radiusCircle',
        isCircle: true,
        circleType: 'radius',
      });
      
      if (radiusLayer.current.getSource()) {
        console.log("Adding radius feature to layer source");
        radiusLayer.current.getSource()?.addFeature(radiusFeature.current);
        
        // Force redraw of the layer
        radiusLayer.current.changed();
        
        // Also update source directly to ensure rendering
        radiusLayer.current.getSource()?.changed();
      } else {
        console.error("Radius layer source is null");
      }
      
      // Update the circle when the map view changes to maintain shape
      const updateCircle = () => {
        if (!map.current || !radiusFeature.current || !currentUser?.location) return;
        
        // Recreate circle with same center and radius
        const center = fromLonLat([currentUser.location.lng, currentUser.location.lat]);
        radiusFeature.current.setGeometry(new Circle(center, radiusInKm * 1000));
        
        // Force redraw
        if (radiusLayer.current) {
          radiusLayer.current.changed();
        }
      };
      
      // Add listener to update circle when view changes
      map.current.getView().on('change:resolution', updateCircle);
      
      return () => {
        if (map.current) {
          map.current.getView().un('change:resolution', updateCircle);
        }
      };
    } else {
      console.log("Current user has no location, not creating radius circle");
    }
  }, [currentUser?.location, radiusInKm, map, isLayerInitialized]);
  
  return { radiusLayer, radiusFeature };
};
