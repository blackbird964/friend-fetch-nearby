
import { useEffect, useRef } from 'react';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Circle } from 'ol/geom';
import { Fill, Style } from 'ol/style';
import Map from 'ol/Map';
import { AppUser } from '@/context/types';
import { shouldObfuscateLocation } from '@/utils/privacyUtils';

export const usePrivacyCircle = (
  map: React.MutableRefObject<Map | null>,
  vectorSource: React.MutableRefObject<VectorSource | null>,
  currentUser: AppUser | null,
) => {
  const privacyLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const privacyFeature = useRef<Feature | null>(null);
  
  // Create a layer for the privacy circle if it doesn't exist
  useEffect(() => {
    if (!map.current) return;
    
    if (!privacyLayer.current) {
      const source = new VectorSource();
      privacyLayer.current = new VectorLayer({
        source,
        style: new Style({
          fill: new Fill({
            color: 'rgba(100, 149, 237, 0.4)', // More visible blue for privacy circles
          }),
        }),
        zIndex: 1, // Places the circle below the markers
      });
      
      map.current.addLayer(privacyLayer.current);
    }
    
    return () => {
      if (map.current && privacyLayer.current) {
        map.current.removeLayer(privacyLayer.current);
        privacyLayer.current = null;
      }
    };
  }, [map]);
  
  // Update privacy circle when user location or privacy settings change
  useEffect(() => {
    if (!privacyLayer.current || !map.current) return;
    
    // Clear existing privacy feature
    if (privacyFeature.current) {
      privacyLayer.current.getSource()?.removeFeature(privacyFeature.current);
      privacyFeature.current = null;
    }
    
    // If user has location and privacy is enabled, create a privacy circle
    if (currentUser?.location && shouldObfuscateLocation(currentUser)) {
      const { lng, lat } = currentUser.location;
      const center = fromLonLat([lng, lat]);
      
      // 50 meters radius - this should match the privacy offset distance
      const radiusInMeters = 50;
      
      // Create the circle feature
      privacyFeature.current = new Feature({
        geometry: new Circle(center, radiusInMeters),
        name: 'privacyCircle',
      });
      
      privacyLayer.current.getSource()?.addFeature(privacyFeature.current);
      
      // Update the circle when the map view changes to maintain shape
      const updateCircle = () => {
        if (!map.current || !privacyFeature.current || !currentUser?.location) return;
        
        // Get current circle
        const circleGeom = privacyFeature.current.getGeometry() as Circle;
        if (!circleGeom) return;
        
        // Recreate circle with same center and radius
        privacyFeature.current.setGeometry(
          new Circle(fromLonLat([currentUser.location.lng, currentUser.location.lat]), radiusInMeters)
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
  }, [currentUser?.location, currentUser?.locationSettings, currentUser?.location_settings, map]);
  
  return { privacyLayer, privacyFeature };
};
