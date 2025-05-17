
import { useEffect, useRef, useCallback } from 'react';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Circle } from 'ol/geom';
import { Fill, Style, Stroke } from 'ol/style';
import Map from 'ol/Map';
import { AppUser } from '@/context/types';
import { shouldObfuscateLocation, getPrivacyCircleRadius, getPrivacyCircleAnimation } from '@/utils/privacyUtils';

export const usePrivacyCircle = (
  map: React.MutableRefObject<Map | null>,
  vectorSource: React.MutableRefObject<VectorSource | null>,
  currentUser: AppUser | null,
) => {
  const privacyLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const privacyFeature = useRef<Feature | null>(null);
  const animationRef = useRef<number | null>(null);
  const currentOpacity = useRef<number>(0.3);
  const animationDirection = useRef<'increasing' | 'decreasing'>('increasing');
  
  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);
  
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
    
    // Initial style with improved visibility (will be animated)
    const privacyStyle = new Style({
      fill: new Fill({
        color: `rgba(155, 135, 245, ${currentOpacity.current})`, // Purple color with animation opacity
      }),
      stroke: new Stroke({
        color: 'rgba(155, 135, 245, 0.8)', // Purple border
        width: 2,
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
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [map]);
  
  // Function to animate the privacy circle with a gentle pulse
  const animatePrivacyCircle = useCallback(() => {
    if (!privacyLayer.current) return;
    
    const { pulseMinOpacity, pulseMaxOpacity, pulseDuration } = getPrivacyCircleAnimation();
    const opacityStep = ((pulseMaxOpacity - pulseMinOpacity) / pulseDuration) * 16; // 16ms is approx one frame at 60fps
    
    if (animationDirection.current === 'increasing') {
      currentOpacity.current += opacityStep;
      if (currentOpacity.current >= pulseMaxOpacity) {
        currentOpacity.current = pulseMaxOpacity;
        animationDirection.current = 'decreasing';
      }
    } else {
      currentOpacity.current -= opacityStep;
      if (currentOpacity.current <= pulseMinOpacity) {
        currentOpacity.current = pulseMinOpacity;
        animationDirection.current = 'increasing';
      }
    }
    
    // Update style with new opacity
    const updatedStyle = new Style({
      fill: new Fill({
        color: `rgba(155, 135, 245, ${currentOpacity.current})`, // Purple with animated opacity
      }),
      stroke: new Stroke({
        color: 'rgba(155, 135, 245, 0.8)', // Solid border color
        width: 2,
      }),
    });
    
    privacyLayer.current.setStyle(updatedStyle);
    
    // Continue animation loop if layer exists
    if (privacyLayer.current) {
      animationRef.current = requestAnimationFrame(animatePrivacyCircle);
    }
  }, []);
  
  // Separated update function to avoid recreation in effects
  const updatePrivacyCircle = useCallback(() => {
    if (!privacyLayer.current || !map.current || !currentUser?.location) return;
    
    // Only create privacy circle if privacy mode is enabled
    const isPrivacyEnabled = shouldObfuscateLocation(currentUser);
    const source = privacyLayer.current.getSource();
    
    // Clear existing features and cancel any ongoing animation
    source?.clear();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
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
    }
  }, [currentUser?.location, map, animatePrivacyCircle]);
  
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [updatePrivacyCircle]);
  
  return { privacyLayer, privacyFeature };
};
