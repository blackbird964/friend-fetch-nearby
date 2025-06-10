
import React, { useEffect, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useLocationSettings } from '@/hooks/useLocationSettings';

// Import our refactored components
import {
  MapPageHeader,
  LocationSettings
} from '@/components/map/page';
import FriendMap from '@/components/map/FriendMap';

const MapPage: React.FC = () => {
  const { refreshNearbyUsers, currentUser, nearbyUsers } = useAppContext();
  
  // Use our location settings hook
  const { 
    isManualMode, 
    isTracking, 
    isPrivacyModeEnabled,
    toggleManualMode,
    toggleLocationTracking,
    togglePrivacyMode
  } = useLocationSettings();
  
  // Fetch nearby users on initial load
  useEffect(() => {
    if (currentUser?.location) {
      refreshNearbyUsers(false);
    }
  }, [currentUser?.location, refreshNearbyUsers]);

  return (
    <div className="container mx-auto px-4 py-6 mb-20 max-w-6xl">
      <MapPageHeader />
      
      <div className="mb-6">
        <LocationSettings 
          isManualMode={isManualMode}
          isPrivacyModeEnabled={isPrivacyModeEnabled}
          isTracking={isTracking}
          toggleManualMode={toggleManualMode}
          togglePrivacyMode={togglePrivacyMode}
          toggleLocationTracking={toggleLocationTracking}
        />
      </div>
      
      <div className="h-[calc(100vh-300px)] bg-white rounded-lg shadow-md overflow-hidden">
        <FriendMap 
          isManualMode={isManualMode}
          isTracking={isTracking}
          isPrivacyModeEnabled={isPrivacyModeEnabled}
        />
      </div>
    </div>
  );
};

export default MapPage;
