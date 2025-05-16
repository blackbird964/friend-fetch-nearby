
import { useCallback } from 'react';

interface UseRadiusHandlerProps {
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
}

export const useRadiusHandler = ({
  radiusInKm,
  setRadiusInKm
}: UseRadiusHandlerProps) => {
  // Handle radius changes from user interaction
  const handleRadiusChange = useCallback((newRadius: number) => {
    console.log("LocationHandling - Radius changed to:", newRadius);
    setRadiusInKm(newRadius);
    
    // Dispatch event to notify radius changed
    window.dispatchEvent(new CustomEvent('radius-changed', { detail: newRadius }));
  }, [setRadiusInKm]);
  
  return { handleRadiusChange, radiusInKm };
};
