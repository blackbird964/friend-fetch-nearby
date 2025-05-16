
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

  // Log radius changes for debugging
  useEffect(() => {
    console.log("MapControls - radiusInKm changed:", radiusInKm);
  }, [radiusInKm]);

  // Log tracking changes to debug the marker visibility issue
  useEffect(() => {
    console.log("MapControls - isTracking changed:", isTracking);
  }, [isTracking]);

  // This component handles the interactions but doesn't render UI elements
  return null;
};

export default MapControls;
