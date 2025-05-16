
import { useEffect, useCallback } from 'react';
import { AppUser } from '@/context/types';

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
  // Handle radius changes from slider or other components
  const handleRadiusChange = useCallback((newRadius: number) => {
    console.log("LocationHandling - Radius changed to:", newRadius);
    setRadiusInKm(newRadius);
    
    // Dispatch event to notify radius changed
    window.dispatchEvent(new CustomEvent('radius-changed', { detail: newRadius }));
  }, [setRadiusInKm]);
  
  // Listen for radius changes from events
  useEffect(() => {
    const handleRadiusChangeFromEvent = (e: any) => {
      console.log("Radius change event detected:", e.detail);
      handleRadiusChange(e.detail);
    };
    
    window.addEventListener('radius-changed', handleRadiusChangeFromEvent);
    
    return () => {
      window.removeEventListener('radius-changed', handleRadiusChangeFromEvent);
    };
  }, [handleRadiusChange]);

  // Handle privacy mode changes
  useEffect(() => {
    console.log("Privacy mode changed:", isPrivacyModeEnabled);
    // If current user exists and has location, update markers when privacy changes
    if (currentUser?.location) {
      // Dispatch privacy mode changed event
      window.dispatchEvent(new CustomEvent('privacy-mode-changed', { 
        detail: { isPrivacyEnabled: isPrivacyModeEnabled } 
      }));
      // Also update user location to reflect changes immediately
      window.dispatchEvent(new CustomEvent('user-location-changed'));
    }
  }, [isPrivacyModeEnabled, currentUser]);

  return { handleRadiusChange };
};
