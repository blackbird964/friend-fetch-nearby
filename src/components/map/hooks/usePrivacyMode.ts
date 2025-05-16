
import { useState, useEffect, useCallback } from 'react';
import { AppUser } from '@/context/types';
import { useToast } from '@/hooks/use-toast';

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
  
  // Update local state when user settings change
  useEffect(() => {
    // Check if current user has privacy settings and sync state
    if (currentUser?.locationSettings?.hideExactLocation !== undefined) {
      console.log("Syncing privacy toggle with user settings:", currentUser.locationSettings.hideExactLocation);
      setIsPrivacyModeEnabled(currentUser.locationSettings.hideExactLocation);
    } else if (currentUser?.location_settings?.hide_exact_location !== undefined) {
      console.log("Syncing privacy toggle with user settings (snake_case):", currentUser.location_settings.hide_exact_location);
      setIsPrivacyModeEnabled(currentUser.location_settings.hide_exact_location);
    } else if (initialPrivacyEnabled !== undefined) {
      // If no settings, use prop value
      console.log("Using prop value for privacy toggle:", initialPrivacyEnabled);
      setIsPrivacyModeEnabled(initialPrivacyEnabled);
    }
  }, [initialPrivacyEnabled, currentUser?.locationSettings?.hideExactLocation, currentUser?.location_settings?.hide_exact_location]);

  // Function to toggle privacy mode
  const togglePrivacyMode = useCallback(() => {
    console.log("Privacy mode toggled, current value:", isPrivacyModeEnabled, "changing to:", !isPrivacyModeEnabled);
    const newPrivacyValue = !isPrivacyModeEnabled;
    setIsPrivacyModeEnabled(newPrivacyValue);
    
    if (currentUser) {
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
        updateUserLocation(currentUser.id, currentUser.location);
        
        // Dispatch privacy mode change event
        window.dispatchEvent(new CustomEvent('privacy-mode-changed', { 
          detail: { isPrivacyEnabled: newPrivacyValue } 
        }));
      }
    }
  }, [isPrivacyModeEnabled, currentUser, setCurrentUser, updateUserLocation, toast]);

  return {
    isPrivacyModeEnabled,
    togglePrivacyMode
  };
};
