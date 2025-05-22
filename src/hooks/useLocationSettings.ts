
import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';

export const useLocationSettings = () => {
  const { currentUser, updateUserLocation } = useAppContext();
  
  // Initialize manual mode from local storage or default to false
  const [isManualMode, setIsManualMode] = useState<boolean>(() => {
    const savedManualMode = localStorage.getItem('kairo-manual-mode');
    return savedManualMode ? savedManualMode === 'true' : false;
  });
  
  // Initialize privacy mode from local storage or default to false
  const [isPrivacyModeEnabled, setIsPrivacyModeEnabled] = useState<boolean>(() => {
    const savedPrivacy = localStorage.getItem('kairo-privacy-mode');
    return savedPrivacy ? savedPrivacy === 'true' : false;
  });
  
  // Initialize tracking from local storage or default to true
  const [isTracking, setIsTracking] = useState<boolean>(() => {
    const savedTracking = localStorage.getItem('kairo-tracking');
    return savedTracking ? savedTracking === 'true' : true;
  });
  
  // Update stored values when changed
  useEffect(() => {
    localStorage.setItem('kairo-manual-mode', String(isManualMode));
    
    // Dispatch an event to notify map and other components
    window.dispatchEvent(new CustomEvent('manual-mode-changed', { 
      detail: { isManualMode } 
    }));
    
    console.log("Manual mode changed:", isManualMode);
  }, [isManualMode]);
  
  useEffect(() => {
    localStorage.setItem('kairo-privacy-mode', String(isPrivacyModeEnabled));
    
    // Dispatch an event to notify map and other components
    window.dispatchEvent(new CustomEvent('privacy-mode-changed', { 
      detail: { isPrivacyEnabled: isPrivacyModeEnabled } 
    }));
    
    console.log("Privacy mode changed:", isPrivacyModeEnabled);
  }, [isPrivacyModeEnabled]);
  
  useEffect(() => {
    localStorage.setItem('kairo-tracking', String(isTracking));
    
    // Dispatch an event to notify map and other components
    window.dispatchEvent(new CustomEvent('tracking-mode-changed', { 
      detail: { isTracking } 
    }));
    
    console.log("Tracking mode changed:", isTracking);
  }, [isTracking]);
  
  // Toggle functions that don't rely on any event parameters
  const toggleManualMode = useCallback(() => {
    const newValue = !isManualMode;
    console.log("Toggling manual mode from", isManualMode, "to", newValue);
    setIsManualMode(newValue);
  }, [isManualMode]);
  
  const togglePrivacyMode = useCallback(() => {
    const newValue = !isPrivacyModeEnabled;
    console.log("Toggling privacy mode from", isPrivacyModeEnabled, "to", newValue);
    setIsPrivacyModeEnabled(newValue);
  }, [isPrivacyModeEnabled]);
  
  const toggleLocationTracking = useCallback(() => {
    const newValue = !isTracking;
    console.log("Toggling tracking from", isTracking, "to", newValue);
    setIsTracking(newValue);
  }, [isTracking]);
  
  return {
    isManualMode,
    isPrivacyModeEnabled,
    isTracking,
    toggleManualMode,
    togglePrivacyMode,
    toggleLocationTracking
  };
};
