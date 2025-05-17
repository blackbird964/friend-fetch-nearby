
import { useCallback, useRef } from 'react';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Circle } from 'ol/geom';
import Map from 'ol/Map';
import { AppUser } from '@/context/types';
import { shouldObfuscateLocation, getPrivacyCircleRadius } from '@/utils/privacyUtils';

/**
 * Hook to handle privacy circle feature updates
 */
export const usePrivacyCircleUpdater = (
  map: React.MutableRefObject<Map | null>,
  privacyLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>,
  animatePrivacyCircle: () => void,
  animationRef: React.MutableRefObject<number | null>,
  cleanupAnimation: () => void
) => {
  const privacyFeature = useRef<Feature | null>(null);
  
  // Update privacy circle based on user location and settings
  const updatePrivacyCircle = useCallback((currentUser: AppUser | null) => {
    if (!privacyLayer.current || !map.current || !currentUser?.location) return;
    
    // Only create privacy circle if privacy mode is enabled
    const isPrivacyEnabled = shouldObfuscateLocation(currentUser);
    const source = privacyLayer.current.getSource();
    
    // Clear existing features and cancel any ongoing animation
    source?.clear();
    cleanupAnimation();
    
    // Only add feature if privacy is enabled
    if (isPrivacyEnabled) {
      const { lng, lat } = currentUser.location;
      const center = fromLonLat([lng, lat]);
      const radiusInMeters = getPrivacyCircleRadius(); // 5km radius
      
      // Create the circle feature
      privacyFeature.current = new Feature({
        geometry: new Circle(center, radiusInMeters),
        name: 'privacyCircle',
        isCircle: true,
        circleType: 'privacy',
        userId: currentUser.id, // Associate with user ID
        userName: currentUser.name || 'User', // Show user name
      });
      
      source?.addFeature(privacyFeature.current);
      
      // Start the animation for the privacy circle
      animationRef.current = requestAnimationFrame(animatePrivacyCircle);
      
      // Log activation for debugging
      console.log("Privacy circle activated and visible");
    } else {
      console.log("Privacy circle not shown - privacy mode is disabled");
    }
  }, [map, privacyLayer, animatePrivacyCircle, animationRef, cleanupAnimation]);
  
  return { 
    privacyFeature,
    updatePrivacyCircle
  };
};
