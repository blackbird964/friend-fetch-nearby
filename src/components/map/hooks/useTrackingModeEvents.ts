
import { useEffect } from 'react';

export const useTrackingModeEvents = (isTracking: boolean) => {
  useEffect(() => {
    console.log("useTrackingModeEvents - isTracking changed:", isTracking);
    const event = new CustomEvent('tracking-mode-changed', { 
      detail: { isTracking } 
    });
    window.dispatchEvent(event);
  }, [isTracking]);
};
