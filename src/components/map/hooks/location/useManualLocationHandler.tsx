
import { useEffect, useCallback } from 'react';
import { AppUser, Location } from '@/context/types';

interface UseManualLocationHandlerProps {
  isManualMode: boolean;
  currentUser: AppUser | null;
  handleLocationUpdate: (location: Location) => void;
}

export const useManualLocationHandler = ({
  isManualMode,
  currentUser,
  handleLocationUpdate
}: UseManualLocationHandlerProps) => {
  // Handle manual location updates from map clicks
  useEffect(() => {
    const handleManualLocationUpdate = (event: any) => {
      if (isManualMode && event.detail && currentUser) {
        console.log("Manual location update:", event.detail);
        handleLocationUpdate(event.detail);
      }
    };
    
    window.addEventListener('manual-location-update', handleManualLocationUpdate);
    
    return () => {
      window.removeEventListener('manual-location-update', handleManualLocationUpdate);
    };
  }, [isManualMode, handleLocationUpdate, currentUser]);
};
