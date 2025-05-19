
import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { AppUser } from '@/context/types';
import { useToast } from './use-toast';

interface UseLocationSettingsResult {
  isManualMode: boolean;
  isTracking: boolean;
  isPrivacyModeEnabled: boolean;
  toggleManualMode: () => void;
  toggleLocationTracking: () => void;
  togglePrivacyMode: () => void;
}

export const useLocationSettings = (): UseLocationSettingsResult => {
  const { currentUser, setCurrentUser, updateUserLocation } = useAppContext();
  const { toast } = useToast();
  
  // State for manual mode and tracking with localStorage persistence
  const [isManualMode, setIsManualMode] = useState(() => {
    const savedManualMode = localStorage.getItem('kairo-manual-mode');
    return savedManualMode === 'true';
  });
  
  const [isTracking, setIsTracking] = useState(() => {
    const savedTracking = localStorage.getItem('kairo-tracking');
    // Default to false (off) if not set
    return savedTracking === 'true';
  });
  
  const [isPrivacyModeEnabled, setIsPrivacyModeEnabled] = useState(() => {
    const savedPrivacy = localStorage.getItem('kairo-privacy-mode');
    if (savedPrivacy !== null) {
      return savedPrivacy === 'true';
    }
    return currentUser?.locationSettings?.hideExactLocation || false;
  });

  // Toggle handlers with local storage persistence
  const toggleManualMode = useCallback(() => {
    const newValue = !isManualMode;
    setIsManualMode(newValue);
    localStorage.setItem('kairo-manual-mode', String(newValue));
  }, [isManualMode]);
  
  const toggleLocationTracking = useCallback(() => {
    const newValue = !isTracking;
    setIsTracking(newValue);
    localStorage.setItem('kairo-tracking', String(newValue));
  }, [isTracking]);
  
  // Privacy mode toggle handler
  const togglePrivacyMode = useCallback(() => {
    const newPrivacyValue = !isPrivacyModeEnabled;
    setIsPrivacyModeEnabled(newPrivacyValue);
    localStorage.setItem('kairo-privacy-mode', String(newPrivacyValue));
    
    if (currentUser) {
      // Fix: Ensure both required properties are always set
      const updatedUser = {
        ...currentUser,
        locationSettings: {
          isManualMode: currentUser.locationSettings?.isManualMode ?? false,
          hideExactLocation: newPrivacyValue
        }
      };
      
      setCurrentUser(updatedUser);
      
      if (currentUser.id && currentUser.location) {
        toast({
          title: newPrivacyValue ? "Privacy Mode Enabled" : "Privacy Mode Disabled",
          description: newPrivacyValue 
            ? "Your exact location is now hidden from others" 
            : "Your exact location is now visible to others",
          duration: 3000,
        });
        
        updateUserLocation(currentUser.id, currentUser.location);
        
        window.dispatchEvent(new CustomEvent('privacy-mode-changed', { 
          detail: { isPrivacyEnabled: newPrivacyValue } 
        }));
      }
    }
  }, [isPrivacyModeEnabled, currentUser, setCurrentUser, updateUserLocation, toast]);

  // Update privacy mode based on user settings when they change
  useEffect(() => {
    if (currentUser?.locationSettings?.hideExactLocation !== undefined) {
      setIsPrivacyModeEnabled(currentUser.locationSettings.hideExactLocation);
      localStorage.setItem('kairo-privacy-mode', String(currentUser.locationSettings.hideExactLocation));
    }
  }, [currentUser?.locationSettings?.hideExactLocation]);

  return {
    isManualMode,
    isTracking,
    isPrivacyModeEnabled,
    toggleManualMode,
    toggleLocationTracking,
    togglePrivacyMode
  };
};
