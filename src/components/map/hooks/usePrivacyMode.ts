
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppUser } from '@/context/types';
import { useToast } from '@/hooks/use-toast';
import { throttle } from 'lodash';

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
  const [isPrivacyModeEnabled, setIsPrivacyModeEnabled] = useState<boolean>(() => {
    // First try to get from localStorage for persistence
    const savedPrivacy = localStorage.getItem('kairo-privacy-mode');
    if (savedPrivacy !== null) {
      return savedPrivacy === 'true';
    }
    
    // If not in localStorage, check user settings
    if (currentUser?.locationSettings?.hideExactLocation !== undefined) {
      return currentUser.locationSettings.hideExactLocation;
    } else if (currentUser?.location_settings?.hide_exact_location !== undefined) {
      return currentUser.location_settings.hide_exact_location;
    }
    
    // If no other source, use the initial value
    return initialPrivacyEnabled;
  });
  
  const updateInProgressRef = useRef(false);
  
  // Persist privacy setting in localStorage
  useEffect(() => {
    localStorage.setItem('kairo-privacy-mode', String(isPrivacyModeEnabled));
  }, [isPrivacyModeEnabled]);
  
  // Update local state when user settings change
  useEffect(() => {
    // Skip if we're already updating to avoid loops
    if (updateInProgressRef.current) return;
    
    // Check if current user has privacy settings and sync state
    if (currentUser?.locationSettings?.hideExactLocation !== undefined) {
      setIsPrivacyModeEnabled(currentUser.locationSettings.hideExactLocation);
      localStorage.setItem('kairo-privacy-mode', String(currentUser.locationSettings.hideExactLocation));
    } else if (currentUser?.location_settings?.hide_exact_location !== undefined) {
      setIsPrivacyModeEnabled(currentUser.location_settings.hide_exact_location);
      localStorage.setItem('kairo-privacy-mode', String(currentUser.location_settings.hide_exact_location));
    } else if (initialPrivacyEnabled !== undefined) {
      // If no settings, use prop value
      setIsPrivacyModeEnabled(initialPrivacyEnabled);
    }
  }, [initialPrivacyEnabled, currentUser?.locationSettings?.hideExactLocation, currentUser?.location_settings?.hide_exact_location]);

  // Use throttle to avoid excessive updates when toggling privacy mode
  const throttledUpdatePrivacy = useCallback(
    throttle((newPrivacyValue: boolean) => {
      if (!currentUser) return;
      
      updateInProgressRef.current = true;
      
      // Fix: Ensure all required properties are set in locationSettings
      const updatedUser = {
        ...currentUser,
        locationSettings: {
          isManualMode: currentUser.locationSettings?.isManualMode ?? false,
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
    }, 100, { leading: true, trailing: true }),
    [currentUser, setCurrentUser, updateUserLocation, toast]
  );

  // Function to toggle privacy mode
  const togglePrivacyMode = useCallback(() => {
    const newPrivacyValue = !isPrivacyModeEnabled;
    setIsPrivacyModeEnabled(newPrivacyValue);
    localStorage.setItem('kairo-privacy-mode', String(newPrivacyValue));
    throttledUpdatePrivacy(newPrivacyValue);
  }, [isPrivacyModeEnabled, throttledUpdatePrivacy]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      throttledUpdatePrivacy.cancel();
    };
  }, [throttledUpdatePrivacy]);

  return {
    isPrivacyModeEnabled,
    togglePrivacyMode
  };
};
