
import React from 'react';
import { AppUser } from '@/context/types';
import Map from 'ol/Map';
import { Vector as VectorSource } from 'ol/source';

// Import custom hooks
import { useRadiusCircle } from '../../hooks/useRadiusCircle';
import { usePrivacyCircle } from '../../hooks/usePrivacyCircle';

interface MapCircleFeaturesProps {
  map: React.MutableRefObject<Map | null>;
  vectorSource: React.MutableRefObject<VectorSource | null>;
  currentUser: AppUser | null;
  radiusInKm: number;
  isTracking: boolean;
}

const MapCircleFeatures: React.FC<MapCircleFeaturesProps> = ({
  map,
  vectorSource,
  currentUser,
  radiusInKm,
  isTracking
}) => {
  // Initialize radius circle with current radius value and make it responsive to changes
  // Pass isTracking to control visibility
  const { radiusLayer, radiusFeature } = useRadiusCircle(
    map,
    vectorSource,
    currentUser,
    radiusInKm,
    isTracking
  );
  
  // Initialize privacy circle for the current user with improved visibility
  const { privacyLayer, privacyFeature } = usePrivacyCircle(
    map,
    vectorSource,
    currentUser
  );

  return null;
};

export default MapCircleFeatures;
