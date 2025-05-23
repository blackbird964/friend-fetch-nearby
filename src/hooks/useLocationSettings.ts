
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
    
    console.log("Manual mode updated:", isManualMode);
  }, [isManualMode]);
  
  useEffect(() => {
    localStorage.setItem('kairo-privacy-mode', String(isPrivacyModeEnabled));
    
    // Dispatch an event to notify map and other components
    window.dispatchEvent(new CustomEvent('privacy-mode-changed', { 
      detail: { isPrivacyEnabled: isPrivacyModeEnabled } 
    }));
    
    console.log("Privacy mode updated:", isPrivacyModeEnabled);
  }, [isPrivacyModeEnabled]);
  
  useEffect(() => {
    localStorage.setItem('kairo-tracking', String(isTracking));
    
    // Dispatch an event to notify map and other components
    window.dispatchEvent(new CustomEvent('tracking-mode-changed', { 
      detail: { isTracking } 
    }));
    
    console.log("Tracking mode updated:", isTracking);
  }, [isTracking]);
  
  // Simplified toggle functions that properly update state
  const toggleManualMode = useCallback(() => {
    console.log("Toggle manual mode called");
    setIsManualMode(prev => !prev);
  }, []);
  
  const togglePrivacyMode = useCallback(() => {
    console.log("Toggle privacy mode called");
    setIsPrivacyModeEnabled(prev => !prev);
  }, []);
  
  const toggleLocationTracking = useCallback(() => {
    console.log("Toggle tracking called");
    setIsTracking(prev => !prev);
  }, []);
  
  return {
    isManualMode,
    isPrivacyModeEnabled,
    isTracking,
    toggleManualMode,
    togglePrivacyMode,
    toggleLocationTracking
  };
};
