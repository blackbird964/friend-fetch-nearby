
import { useEffect, useRef } from 'react';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Circle } from 'ol/geom';
import Map from 'ol/Map';
import { AppUser } from '@/context/types';
import { shouldObfuscateLocation, getPrivacyCircleRadius } from '@/utils/privacyUtils';

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
        zIndex: 1, // Places the circle below the markers
        properties: {
          updateWhileAnimating: true,
          updateWhileInteracting: true
        }
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
      console.log("Creating privacy circle for user with privacy mode enabled");
      const { lng, lat } = currentUser.location;
      const center = fromLonLat([lng, lat]);
      
      // Use fixed radius for privacy circle (~500m)
      const radiusInMeters = getPrivacyCircleRadius(); // ~500m
      
      // Create the circle feature
      privacyFeature.current = new Feature({
        geometry: new Circle(center, radiusInMeters),
        name: 'privacyCircle',
        isCircle: true,
        circleType: 'privacy',
      });
      
      privacyLayer.current.getSource()?.addFeature(privacyFeature.current);
      console.log("Added privacy circle to map");
      
      // Fix the circle size to remain consistent regardless of zoom level
      const view = map.current.getView();
      
      const fixCircleOnZoomChange = () => {
        if (!currentUser?.location || !privacyFeature.current || !privacyLayer.current) return;
        
        // Get the center in map projection
        const center = fromLonLat([currentUser.location.lng, currentUser.location.lat]);
        
        // Update the circle with the fixed radius
        const geometry = new Circle(center, radiusInMeters);
        privacyFeature.current.setGeometry(geometry);
        
        // Force redraw
        if (privacyLayer.current) {
          privacyLayer.current.changed();
        }
      };
      
      // Add listener for resolution (zoom) changes
      view.on('change:resolution', fixCircleOnZoomChange);
      
      // Initial update to ensure correct size
      fixCircleOnZoomChange();
      
      return () => {
        // Clean up listener
        view.un('change:resolution', fixCircleOnZoomChange);
      };
    }
  }, [currentUser?.location, currentUser?.locationSettings, currentUser?.location_settings, map]);
  
  return { privacyLayer, privacyFeature };
};
