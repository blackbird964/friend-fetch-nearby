
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppUser } from '@/context/types';
import { useToast } from '@/hooks/use-toast';
import { debounce } from 'lodash';

type UsePrivacyModeProps = {
  currentUser: AppUser | null;
  setCurrentUser: (user: AppUser) => void;
  updateUserLocation: (userId: string, location: { lat: number; lng: number }) => Promise<void>;
  initialPrivacyEnabled?: boolean;
};

export const usePrivacyMode = ({
  currentUser,
  setCurrentUser,
  updateUserLocation,
  initialPrivacyEnabled = false
}: UsePrivacyModeProps) => {
  const { toast } = useToast();
  const [isPrivacyModeEnabled, setIsPrivacyModeEnabled] = useState<boolean>(initialPrivacyEnabled);
  const updateInProgressRef = useRef(false);
  
  // Update local state when user settings change
  useEffect(() => {
    // Skip if we're already updating to avoid loops
    if (updateInProgressRef.current) return;
    
    // Check if current user has privacy settings and sync state
    if (currentUser?.locationSettings?.hideExactLocation !== undefined) {
      setIsPrivacyModeEnabled(currentUser.locationSettings.hideExactLocation);
    } else if (currentUser?.location_settings?.hide_exact_location !== undefined) {
      setIsPrivacyModeEnabled(currentUser.location_settings.hide_exact_location);
    } else if (initialPrivacyEnabled !== undefined) {
      // If no settings, use prop value
      setIsPrivacyModeEnabled(initialPrivacyEnabled);
    }
  }, [initialPrivacyEnabled, currentUser?.locationSettings?.hideExactLocation, currentUser?.location_settings?.hide_exact_location]);

  // Use debounce to avoid excessive updates when toggling privacy mode
  const debouncedUpdatePrivacy = useCallback(
    debounce((newPrivacyValue: boolean) => {
      if (!currentUser) return;
      
      updateInProgressRef.current = true;
      
      const updatedUser = {
        ...currentUser,
        locationSettings: {
          ...currentUser.locationSettings || {},
          hideExactLocation: newPrivacyValue
        }
      };
      
      setCurrentUser(updatedUser);
      
      // Make sure to update in database
      if (currentUser.id && currentUser.location) {
        toast({
          title: newPrivacyValue ? "Privacy Mode Enabled" : "Privacy Mode Disabled",
          description: newPrivacyValue 
            ? "Your exact location is now hidden from others" 
            : "Your exact location is now visible to others",
          duration: 3000,
        });
        
        // Update with current location and new privacy setting
        updateUserLocation(currentUser.id, currentUser.location)
          .finally(() => {
            updateInProgressRef.current = false;
          });
        
        // Dispatch privacy mode change event
        window.dispatchEvent(new CustomEvent('privacy-mode-changed', { 
          detail: { isPrivacyEnabled: newPrivacyValue } 
        }));
      } else {
        updateInProgressRef.current = false;
      }
    }, 100),
    [currentUser, setCurrentUser, updateUserLocation, toast]
  );

  // Function to toggle privacy mode
  const togglePrivacyMode = useCallback(() => {
    const newPrivacyValue = !isPrivacyModeEnabled;
    setIsPrivacyModeEnabled(newPrivacyValue);
    debouncedUpdatePrivacy(newPrivacyValue);
  }, [isPrivacyModeEnabled, debouncedUpdatePrivacy]);

  return {
    isPrivacyModeEnabled,
    togglePrivacyMode
  };
};
