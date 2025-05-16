
import { useCallback, useEffect } from 'react';
import { AppUser, Location } from '@/context/types';

interface UseLocationUpdaterProps {
  currentUser: AppUser | null;
  updateUserLocation: (userId: string, location: Location) => Promise<void>;
  setCurrentUser: (user: AppUser) => void;
  isPrivacyModeEnabled: boolean;
  isManualMode: boolean;
}

export const useLocationUpdater = ({
  currentUser,
  updateUserLocation,
  setCurrentUser,
  isPrivacyModeEnabled,
  isManualMode
}: UseLocationUpdaterProps) => {
  // Update user location in context and database
  const handleLocationUpdate = useCallback((location: Location) => {
    if (location && location.lat && location.lng && currentUser?.id) {
      console.log("Updating location with privacy:", isPrivacyModeEnabled);
      
      // Update user location - make sure we only pass the arguments that are expected
      updateUserLocation(currentUser.id, location);
      
      // Update local user state with new privacy setting
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          location,
          locationSettings: {
            ...currentUser.locationSettings,
            hideExactLocation: isPrivacyModeEnabled
          }
        };
        setCurrentUser(updatedUser);
      }
      
      // Dispatch custom event to notify location change
      window.dispatchEvent(new CustomEvent('user-location-changed'));
      
      // Also dispatch a privacy-changed event when privacy mode changes
      window.dispatchEvent(new CustomEvent('privacy-mode-changed', { 
        detail: { isPrivacyEnabled: isPrivacyModeEnabled } 
      }));
    }
  }, [currentUser, updateUserLocation, setCurrentUser, isPrivacyModeEnabled]);
  
  return { handleLocationUpdate };
};
