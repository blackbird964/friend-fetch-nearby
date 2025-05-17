
import { useCallback, useRef } from 'react';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Fill, Style, Stroke } from 'ol/style';
import { getPrivacyCircleAnimation } from '@/utils/privacyUtils';

/**
 * Hook to handle privacy circle animation
 */
export const usePrivacyCircleAnimation = (
  privacyLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>
) => {
  const animationRef = useRef<number | null>(null);
  const currentOpacity = useRef<number>(0.3);
  const animationDirection = useRef<'increasing' | 'decreasing'>('increasing');
  
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
        width: 3, // Increase width for better visibility
      }),
    });
    
    privacyLayer.current.setStyle(updatedStyle);
    
    // Continue animation loop if layer exists
    if (privacyLayer.current) {
      animationRef.current = requestAnimationFrame(animatePrivacyCircle);
    }
  }, [privacyLayer]);
  
  // Cleanup function for animation
  const cleanupAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };
  
  return {
    animatePrivacyCircle,
    animationRef,
    cleanupAnimation
  };
};
