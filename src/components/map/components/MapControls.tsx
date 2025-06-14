
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

  // Add proper zoom controls functionality
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const mapInstance = map.current;
    
    // Create zoom functions
    const handleZoomIn = () => {
      // Dispatch zoom start event
      window.dispatchEvent(new CustomEvent('map-zoom-start'));
      
      const view = mapInstance.getView();
      const currentZoom = view.getZoom();
      if (currentZoom !== undefined) {
        view.animate({
          zoom: Math.min(currentZoom + 1, 19), // Max zoom limit
          duration: 250
        });
        
        // Dispatch zoom end event after animation
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('map-zoom-end'));
        }, 300);
      }
    };

    const handleZoomOut = () => {
      // Dispatch zoom start event
      window.dispatchEvent(new CustomEvent('map-zoom-start'));
      
      const view = mapInstance.getView();
      const currentZoom = view.getZoom();
      if (currentZoom !== undefined) {
        view.animate({
          zoom: Math.max(currentZoom - 1, 2), // Min zoom limit
          duration: 250
        });
        
        // Dispatch zoom end event after animation
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('map-zoom-end'));
        }, 300);
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
        
        // Add new listeners
        zoomInButton.addEventListener('click', handleZoomIn);
        zoomOutButton.addEventListener('click', handleZoomOut);
        zoomInButton.addEventListener('touchend', handleZoomIn);
        zoomOutButton.addEventListener('touchend', handleZoomOut);
        
        // Ensure buttons are touchable on mobile
        (zoomInButton as HTMLElement).style.touchAction = 'manipulation';
        (zoomOutButton as HTMLElement).style.touchAction = 'manipulation';
        
        return true; // Success
      }
      return false; // Not found yet
    };

    // Set up view change listeners to detect zoom changes
    const view = mapInstance.getView();
    let isZooming = false;
    
    const handleViewChangeStart = () => {
      if (!isZooming) {
        isZooming = true;
        window.dispatchEvent(new CustomEvent('map-zoom-start'));
      }
    };
    
    const handleViewChangeEnd = () => {
      if (isZooming) {
        setTimeout(() => {
          isZooming = false;
          window.dispatchEvent(new CustomEvent('map-zoom-end'));
        }, 100);
      }
    };
    
    // Listen for resolution changes (zoom) via mouse wheel or pinch
    view.on('change:resolution', handleViewChangeStart);
    view.on('change:center', handleViewChangeEnd);

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
        view.un('change:resolution', handleViewChangeStart);
        view.un('change:center', handleViewChangeEnd);
      };
    }

    // Cleanup function for when controls are found immediately
    return () => {
      const zoomInButton = document.querySelector('.ol-zoom-in');
      const zoomOutButton = document.querySelector('.ol-zoom-out');
      
      if (zoomInButton) {
        zoomInButton.removeEventListener('click', handleZoomIn);
        zoomInButton.removeEventListener('touchend', handleZoomIn);
      }
      if (zoomOutButton) {
        zoomOutButton.removeEventListener('click', handleZoomOut);
        zoomOutButton.removeEventListener('touchend', handleZoomOut);
      }
      
      view.un('change:resolution', handleViewChangeStart);
      view.un('change:center', handleViewChangeEnd);
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
