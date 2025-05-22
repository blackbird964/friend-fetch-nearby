
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
  }, [isManualMode]);
  
  useEffect(() => {
    localStorage.setItem('kairo-privacy-mode', String(isPrivacyModeEnabled));
    
    // Dispatch an event to notify map and other components
    window.dispatchEvent(new CustomEvent('privacy-mode-changed', { 
      detail: { isPrivacyEnabled: isPrivacyModeEnabled } 
    }));
  }, [isPrivacyModeEnabled]);
  
  useEffect(() => {
    localStorage.setItem('kairo-tracking', String(isTracking));
    
    // Dispatch an event to notify map and other components
    const event = new CustomEvent('tracking-mode-changed', { 
      detail: { isTracking } 
    });
    window.dispatchEvent(event);
    
    console.log("Dispatched tracking event:", isTracking);
  }, [isTracking]);
  
  // Toggle functions with simplified logic and additional logging
  const toggleManualMode = useCallback(() => {
    console.log("Toggle manual mode: current =", isManualMode, "→ new =", !isManualMode);
    setIsManualMode(prev => !prev);
  }, [isManualMode]);
  
  const togglePrivacyMode = useCallback(() => {
    console.log("Toggle privacy mode: current =", isPrivacyModeEnabled, "→ new =", !isPrivacyModeEnabled);
    setIsPrivacyModeEnabled(prev => !prev);
  }, [isPrivacyModeEnabled]);
  
  const toggleLocationTracking = useCallback(() => {
    console.log("Toggle tracking: current =", isTracking, "→ new =", !isTracking); 
    setIsTracking(prev => !prev);
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
