
import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import { Vector as VectorSource } from 'ol/source';
import { AppUser } from '@/context/types';

// Import our new refactored hooks
import { usePrivacyCircleLayer } from './privacy/usePrivacyCircleLayer';
import { usePrivacyCircleAnimation } from './privacy/usePrivacyCircleAnimation';
import { usePrivacyCircleUpdater } from './privacy/usePrivacyCircleUpdater';

/**
 * Hook to manage privacy circle visualization on map
 */
export const usePrivacyCircle = (
  map: React.MutableRefObject<Map | null>,
  vectorSource: React.MutableRefObject<VectorSource | null>,
  currentUser: AppUser | null,
) => {
  // Initialize privacy circle layer
  const { privacyLayer } = usePrivacyCircleLayer(map);
  
  // Initialize privacy circle animation
  const { animatePrivacyCircle, animationRef, cleanupAnimation } = usePrivacyCircleAnimation(privacyLayer);
  
  // Initialize privacy circle updater
  const { privacyFeature, updatePrivacyCircle } = usePrivacyCircleUpdater(
    map,
    privacyLayer,
    animatePrivacyCircle,
    animationRef,
    cleanupAnimation
  );
  
  // Update privacy circle when user location or privacy settings change
  useEffect(() => {
    if (!currentUser || !map.current || !privacyLayer.current) return;
    
    updatePrivacyCircle(currentUser);
    
    // Maintain circle size on zoom changes
    const view = map.current.getView();
    
    // Don't recreate this function on every render
    const fixCircleOnZoomChange = () => {
      updatePrivacyCircle(currentUser);
    };
    
    view.on('change:resolution', fixCircleOnZoomChange);
    
    // Cleanup zoom listener
    return () => {
      view.un('change:resolution', fixCircleOnZoomChange);
      cleanupAnimation();
    };
  }, [
    currentUser?.location, 
    currentUser?.locationSettings?.hideExactLocation,
    currentUser?.location_settings?.hide_exact_location,
    map, 
    updatePrivacyCircle,
    privacyLayer,
    cleanupAnimation
  ]);
  
  // Listen for privacy mode changes from events
  useEffect(() => {
    const handlePrivacyChange = () => {
      console.log("Privacy mode change detected, updating privacy circle");
      if (currentUser) {
        updatePrivacyCircle(currentUser);
      }
    };
    
    window.addEventListener('privacy-mode-changed', handlePrivacyChange);
    window.addEventListener('user-location-changed', handlePrivacyChange);
    
    return () => {
      window.removeEventListener('privacy-mode-changed', handlePrivacyChange);
      window.removeEventListener('user-location-changed', handlePrivacyChange);
      cleanupAnimation();
    };
  }, [updatePrivacyCircle, currentUser, cleanupAnimation]);
  
  return { privacyLayer, privacyFeature };
};
