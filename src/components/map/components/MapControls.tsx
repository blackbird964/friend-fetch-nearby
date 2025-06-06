
import React, { useEffect } from 'react';
import { AppUser } from '@/context/types';
import { useLocationInteraction } from '../hooks/useLocationInteraction';

type MapControlsProps = {
  map: React.MutableRefObject<any>;
  mapLoaded: boolean;
  currentUser: AppUser | null;
  isManualMode: boolean;
  isTracking: boolean;
  isPrivacyModeEnabled: boolean;
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
  updateUserLocation: (userId: string, location: { lat: number; lng: number }) => Promise<void>;
  setCurrentUser: (user: AppUser) => void;
};

const MapControls: React.FC<MapControlsProps> = ({
  map,
  mapLoaded,
  currentUser,
  isManualMode,
  isTracking,
  isPrivacyModeEnabled,
  radiusInKm,
  setRadiusInKm,
  updateUserLocation,
  setCurrentUser
}) => {
  // Use the location interaction hook
  const { handleRadiusChange } = useLocationInteraction({
    isPrivacyModeEnabled,
    radiusInKm,
    setRadiusInKm,
    currentUser
  });

  // Add proper zoom controls functionality with improved event handling
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const mapInstance = map.current;
    
    // Create zoom functions
    const handleZoomIn = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      
      const view = mapInstance.getView();
      const currentZoom = view.getZoom();
      if (currentZoom !== undefined) {
        view.animate({
          zoom: Math.min(currentZoom + 1, 19), // Max zoom limit
          duration: 250
        });
      }
    };

    const handleZoomOut = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      
      const view = mapInstance.getView();
      const currentZoom = view.getZoom();
      if (currentZoom !== undefined) {
        view.animate({
          zoom: Math.max(currentZoom - 1, 2), // Min zoom limit
          duration: 250
        });
      }
    };

    // Function to repeatedly try to find and attach zoom controls
    const attachZoomControls = () => {
      const zoomInButton = document.querySelector('.ol-zoom-in');
      const zoomOutButton = document.querySelector('.ol-zoom-out');
      
      if (zoomInButton && zoomOutButton) {
        console.log('MapControls - Found zoom buttons, attaching listeners');
        
        // Remove any existing listeners first
        zoomInButton.removeEventListener('click', handleZoomIn);
        zoomOutButton.removeEventListener('click', handleZoomOut);
        zoomInButton.removeEventListener('touchend', handleZoomIn);
        zoomOutButton.removeEventListener('touchend', handleZoomOut);
        
        // Add new listeners with proper event handling
        zoomInButton.addEventListener('click', handleZoomIn, { capture: true });
        zoomOutButton.addEventListener('click', handleZoomOut, { capture: true });
        zoomInButton.addEventListener('touchend', handleZoomIn, { capture: true });
        zoomOutButton.addEventListener('touchend', handleZoomOut, { capture: true });
        
        // Ensure buttons are touchable on mobile and have proper z-index
        (zoomInButton as HTMLElement).style.touchAction = 'manipulation';
        (zoomOutButton as HTMLElement).style.touchAction = 'manipulation';
        (zoomInButton as HTMLElement).style.pointerEvents = 'auto';
        (zoomOutButton as HTMLElement).style.pointerEvents = 'auto';
        (zoomInButton as HTMLElement).style.zIndex = '1000';
        (zoomOutButton as HTMLElement).style.zIndex = '1000';
        
        return true; // Success
      }
      return false; // Not found yet
    };

    // Try to attach controls immediately
    if (!attachZoomControls()) {
      // If not found, try again with intervals
      let attempts = 0;
      const maxAttempts = 20;
      
      const interval = setInterval(() => {
        attempts++;
        
        if (attachZoomControls() || attempts >= maxAttempts) {
          clearInterval(interval);
          if (attempts >= maxAttempts) {
            console.warn('MapControls - Could not find zoom buttons after', maxAttempts, 'attempts');
          }
        }
      }, 100);
      
      return () => {
        clearInterval(interval);
      };
    }

    // Cleanup function for when controls are found immediately
    return () => {
      const zoomInButton = document.querySelector('.ol-zoom-in');
      const zoomOutButton = document.querySelector('.ol-zoom-out');
      
      if (zoomInButton) {
        zoomInButton.removeEventListener('click', handleZoomIn, { capture: true });
        zoomInButton.removeEventListener('touchend', handleZoomIn, { capture: true });
      }
      if (zoomOutButton) {
        zoomOutButton.removeEventListener('click', handleZoomOut, { capture: true });
        zoomOutButton.removeEventListener('touchend', handleZoomOut, { capture: true });
      }
    };
  }, [map, mapLoaded]);

  // Log radius changes for debugging
  useEffect(() => {
    console.log("MapControls - radiusInKm changed:", radiusInKm);
    
    // Force radius update when radius changes
    if (currentUser?.location) {
      console.log("MapControls - Dispatching radius-changed event");
      window.dispatchEvent(new CustomEvent('radius-changed', { detail: radiusInKm }));
    }
  }, [radiusInKm, currentUser?.location]);

  // Log tracking changes to debug the marker visibility issue
  useEffect(() => {
    console.log("MapControls - isTracking changed:", isTracking);
  }, [isTracking]);

  // This component handles the interactions but doesn't render UI elements
  return null;
};

export default MapControls;
