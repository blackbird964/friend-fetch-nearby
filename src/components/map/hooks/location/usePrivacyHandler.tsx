
import { useEffect } from 'react';
import { AppUser } from '@/context/types';

interface UsePrivacyHandlerProps {
  isPrivacyModeEnabled: boolean;
  currentUser: AppUser | null;
}

export const usePrivacyHandler = ({
  isPrivacyModeEnabled,
  currentUser
}: UsePrivacyHandlerProps) => {
  // Handle privacy mode changes
  useEffect(() => {
    console.log("Privacy mode in handler:", isPrivacyModeEnabled);
    // If current user exists and has location, update markers when privacy changes
    if (currentUser?.location) {
      // First dispatch a marker clear event to remove any existing markers
      window.dispatchEvent(new CustomEvent('clear-user-markers'));
      
      // Then dispatch privacy mode changed event
      window.dispatchEvent(new CustomEvent('privacy-mode-changed', { 
        detail: { isPrivacyEnabled: isPrivacyModeEnabled } 
      }));
      
      // Also update user location to reflect changes immediately
      window.dispatchEvent(new CustomEvent('user-location-changed'));
    }
  }, [isPrivacyModeEnabled, currentUser]);
};
