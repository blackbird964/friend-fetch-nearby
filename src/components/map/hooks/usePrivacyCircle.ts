
import { useEffect, useRef, useCallback } from 'react';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Circle } from 'ol/geom';
import { Fill, Style, Stroke } from 'ol/style';
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
  
  // Create a separate layer for the privacy circle to improve performance
  useEffect(() => {
    if (!map.current) return;
    
    // Clean up existing layer if it exists
    if (privacyLayer.current) {
      map.current.removeLayer(privacyLayer.current);
      privacyLayer.current = null;
    }
    
    // Create the privacy layer with appropriate styling
    const source = new VectorSource();
    
    // Improved style with better visibility
    const privacyStyle = new Style({
      fill: new Fill({
        color: 'rgba(100, 149, 237, 0.15)', // Light blue semi-transparent
      }),
      stroke: new Stroke({
        color: 'rgba(100, 149, 237, 0.6)', // Cornflower blue
        width: 2,
        lineDash: [5, 5]
      }),
    });
    
    privacyLayer.current = new VectorLayer({
      source,
      style: privacyStyle,
      zIndex: 10, // Higher than regular markers but lower than selected markers
    });
    
    map.current.addLayer(privacyLayer.current);
    
    return () => {
      if (map.current && privacyLayer.current) {
        map.current.removeLayer(privacyLayer.current);
        privacyLayer.current = null;
      }
    };
  }, [map]);
  
  // Separated update function to avoid recreation in effects
  const updatePrivacyCircle = useCallback(() => {
    if (!privacyLayer.current || !map.current || !currentUser?.location) return;
    
    // Only create privacy circle if privacy mode is enabled
    const isPrivacyEnabled = shouldObfuscateLocation(currentUser);
    const source = privacyLayer.current.getSource();
    
    // Clear existing features
    source?.clear();
    
    // Only add feature if privacy is enabled
    if (isPrivacyEnabled) {
      const { lng, lat } = currentUser.location;
      const center = fromLonLat([lng, lat]);
      const radiusInMeters = getPrivacyCircleRadius(); // 500m fixed radius
      
      // Create the circle feature
      privacyFeature.current = new Feature({
        geometry: new Circle(center, radiusInMeters),
        name: 'privacyCircle',
        isCircle: true,
        circleType: 'privacy',
      });
      
      source?.addFeature(privacyFeature.current);
    }
  }, [currentUser?.location, map]);
  
  // Update privacy circle when user location or privacy settings change
  useEffect(() => {
    if (!currentUser || !map.current || !privacyLayer.current) return;
    
    updatePrivacyCircle();
    
    // Maintain circle size on zoom changes
    const view = map.current.getView();
    
    // Don't recreate this function on every render
    const fixCircleOnZoomChange = () => {
      updatePrivacyCircle();
    };
    
    view.on('change:resolution', fixCircleOnZoomChange);
    
    // Cleanup zoom listener
    return () => {
      view.un('change:resolution', fixCircleOnZoomChange);
    };
  }, [
    currentUser?.location, 
    currentUser?.locationSettings?.hideExactLocation,
    currentUser?.location_settings?.hide_exact_location,
    map, 
    updatePrivacyCircle
  ]);
  
  // Listen for privacy mode changes from events
  useEffect(() => {
    const handlePrivacyChange = () => {
      updatePrivacyCircle();
    };
    
    window.addEventListener('privacy-mode-changed', handlePrivacyChange);
    window.addEventListener('user-location-changed', handlePrivacyChange);
    
    return () => {
      window.removeEventListener('privacy-mode-changed', handlePrivacyChange);
      window.removeEventListener('user-location-changed', handlePrivacyChange);
    };
  }, [updatePrivacyCircle]);
  
  return { privacyLayer, privacyFeature };
};
