
import { useEffect, useRef } from 'react';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Circle } from 'ol/geom';
import { Fill, Style } from 'ol/style';
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
  
  // Create a layer for the radius circle if it doesn't exist
  useEffect(() => {
    if (!map.current) return;
    
    if (!radiusLayer.current) {
      const source = new VectorSource();
      radiusLayer.current = new VectorLayer({
        source,
        style: new Style({
          fill: new Fill({
            color: 'rgba(66, 133, 244, 0.2)', // Semi-transparent blue
          }),
        }),
        zIndex: 1, // Places the circle below the markers
      });
      
      map.current.addLayer(radiusLayer.current);
    }
    
    return () => {
      if (map.current && radiusLayer.current) {
        map.current.removeLayer(radiusLayer.current);
        radiusLayer.current = null;
      }
    };
  }, [map]);
  
  // Update radius circle when user location or radius changes
  useEffect(() => {
    if (!radiusLayer.current || !map.current) return;
    
    // Clear existing radius feature
    if (radiusFeature.current) {
      radiusLayer.current.getSource()?.removeFeature(radiusFeature.current);
      radiusFeature.current = null;
    }
    
    // Create a new radius circle if user has a location
    if (currentUser?.location) {
      const { lng, lat } = currentUser.location;
      const center = fromLonLat([lng, lat]);
      
      // Convert km to map units (meters)
      const radiusInMeters = radiusInKm * 1000;
      
      // Create the circle feature
      radiusFeature.current = new Feature({
        geometry: new Circle(center, radiusInMeters),
        name: 'radiusCircle',
      });
      
      radiusLayer.current.getSource()?.addFeature(radiusFeature.current);
      
      // Update the circle when the map view changes to maintain shape
      const updateCircle = () => {
        if (!map.current || !radiusFeature.current || !currentUser?.location) return;
        
        // Get current circle
        const circleGeom = radiusFeature.current.getGeometry() as Circle;
        if (!circleGeom) return;
        
        // Recreate circle with same center and radius
        radiusFeature.current.setGeometry(
          new Circle(fromLonLat([currentUser.location.lng, currentUser.location.lat]), radiusInKm * 1000)
        );
      };
      
      // Add listener to update circle when view changes
      map.current.getView().on('change:resolution', updateCircle);
      
      return () => {
        if (map.current) {
          map.current.getView().un('change:resolution', updateCircle);
        }
      };
    }
  }, [currentUser?.location, radiusInKm, map]);
  
  return { radiusLayer, radiusFeature };
};
