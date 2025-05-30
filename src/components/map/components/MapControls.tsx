
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

  // Add zoom controls functionality
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const mapInstance = map.current;
    
    // Add zoom functionality to existing controls
    const handleZoomIn = () => {
      const view = mapInstance.getView();
      const currentZoom = view.getZoom();
      if (currentZoom !== undefined) {
        view.animate({
          zoom: currentZoom + 1,
          duration: 250
        });
      }
    };

    const handleZoomOut = () => {
      const view = mapInstance.getView();
      const currentZoom = view.getZoom();
      if (currentZoom !== undefined) {
        view.animate({
          zoom: currentZoom - 1,
          duration: 250
        });
      }
    };

    // Find the zoom buttons in the DOM and add click handlers
    const addZoomListeners = () => {
      const zoomInButton = document.querySelector('.ol-zoom-in');
      const zoomOutButton = document.querySelector('.ol-zoom-out');
      
      if (zoomInButton) {
        zoomInButton.addEventListener('click', handleZoomIn);
      }
      if (zoomOutButton) {
        zoomOutButton.addEventListener('click', handleZoomOut);
      }
    };

    // Add listeners after a short delay to ensure controls are rendered
    const timeout = setTimeout(addZoomListeners, 100);

    return () => {
      clearTimeout(timeout);
      // Clean up event listeners
      const zoomInButton = document.querySelector('.ol-zoom-in');
      const zoomOutButton = document.querySelector('.ol-zoom-out');
      
      if (zoomInButton) {
        zoomInButton.removeEventListener('click', handleZoomIn);
      }
      if (zoomOutButton) {
        zoomOutButton.removeEventListener('click', handleZoomOut);
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
