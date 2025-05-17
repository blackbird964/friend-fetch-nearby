import { useEffect, useCallback, useRef } from 'react';
import { AppUser } from '@/context/types';
import { debounce } from 'lodash';

type UseLocationInteractionProps = {
  isPrivacyModeEnabled: boolean;
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
  currentUser: AppUser | null;
};

export const useLocationInteraction = ({
  isPrivacyModeEnabled,
  radiusInKm,
  setRadiusInKm,
  currentUser
}: UseLocationInteractionProps) => {
  // Create a debounced function to reduce frequency of radius changes
  const debouncedRadiusChange = useCallback(
    debounce((newRadius: number) => {
      setRadiusInKm(newRadius);
      
      // Dispatch event to notify radius changed
      window.dispatchEvent(new CustomEvent('radius-changed', { detail: newRadius }));
    }, 100),
    [setRadiusInKm]
  );
  
  // Keep track of event subscriptions for proper cleanup
  const radiusEventRef = useRef<((e: any) => void) | null>(null);
  
  // Handle radius changes with improved performance
  const handleRadiusChange = useCallback((newRadius: number) => {
    debouncedRadiusChange(newRadius);
  }, [debouncedRadiusChange]);
  
  // Listen for radius changes from events with proper cleanup
  useEffect(() => {
    // Create a handler that will persist for proper cleanup
    const handleRadiusChangeEvent = (e: any) => {
      debouncedRadiusChange(e.detail);
    };
    
    // Store reference for cleanup
    radiusEventRef.current = handleRadiusChangeEvent;
    window.addEventListener('radius-changed', handleRadiusChangeEvent);
    
    return () => {
      if (radiusEventRef.current) {
        window.removeEventListener('radius-changed', radiusEventRef.current);
        radiusEventRef.current = null;
      }
    };
  }, [debouncedRadiusChange]);

  // Handle privacy mode changes with reduced updates
  const lastPrivacyState = useRef(isPrivacyModeEnabled);
  
  useEffect(() => {
    // Only dispatch event if privacy state actually changed
    if (lastPrivacyState.current !== isPrivacyModeEnabled) {
      lastPrivacyState.current = isPrivacyModeEnabled;
      
      // If current user exists and has location, update markers
      if (currentUser?.location) {
        window.dispatchEvent(new CustomEvent('privacy-mode-changed', { 
          detail: { isPrivacyEnabled: isPrivacyModeEnabled } 
        }));
      }
    }
  }, [isPrivacyModeEnabled, currentUser]);

  return { handleRadiusChange };
};
