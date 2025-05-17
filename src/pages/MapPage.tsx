
import React, { useEffect, useState } from 'react';
import { Tabs } from "@/components/ui/tabs";
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

// Import our new refactored components
import {
  MapPageHeader,
  MapTabsList,
  MapTabsView,
  ListTabsView,
  LocationSettings
} from '@/components/map/page';

const MapPage: React.FC = () => {
  const { refreshNearbyUsers, loading, currentUser, nearbyUsers, updateUserLocation, setCurrentUser } = useAppContext();
  const { toast } = useToast();
  
  // State for manual mode and tracking
  const [isManualMode, setIsManualMode] = useState(() => {
    const savedManualMode = localStorage.getItem('kairo-manual-mode');
    return savedManualMode === 'true';
  });
  
  const [isTracking, setIsTracking] = useState(() => {
    const savedTracking = localStorage.getItem('kairo-tracking');
    return savedTracking !== 'false'; // Default to true if not set
  });
  
  const [isPrivacyModeEnabled, setIsPrivacyModeEnabled] = useState(() => {
    const savedPrivacy = localStorage.getItem('kairo-privacy-mode');
    if (savedPrivacy !== null) {
      return savedPrivacy === 'true';
    }
    return currentUser?.locationSettings?.hideExactLocation || false;
  });

  // Toggle handlers with local storage persistence
  const toggleManualMode = () => {
    const newValue = !isManualMode;
    setIsManualMode(newValue);
    localStorage.setItem('kairo-manual-mode', String(newValue));
  };
  
  const toggleLocationTracking = () => {
    const newValue = !isTracking;
    setIsTracking(newValue);
    localStorage.setItem('kairo-tracking', String(newValue));
  };
  
  // Privacy mode toggle handler
  const togglePrivacyMode = () => {
    const newPrivacyValue = !isPrivacyModeEnabled;
    setIsPrivacyModeEnabled(newPrivacyValue);
    localStorage.setItem('kairo-privacy-mode', String(newPrivacyValue));
    
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        locationSettings: {
          ...currentUser.locationSettings || {},
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
  };
  
  // Fetch nearby users on initial load
  useEffect(() => {
    if (currentUser?.location) {
      refreshNearbyUsers(false);
    }
  }, [currentUser?.location, refreshNearbyUsers]);

  // Update privacy mode based on user settings when they change
  useEffect(() => {
    if (currentUser?.locationSettings?.hideExactLocation !== undefined) {
      setIsPrivacyModeEnabled(currentUser.locationSettings.hideExactLocation);
      localStorage.setItem('kairo-privacy-mode', String(currentUser.locationSettings.hideExactLocation));
    }
  }, [currentUser?.locationSettings?.hideExactLocation]);
  
  const handleRefresh = async () => {
    try {
      await refreshNearbyUsers(true);
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast({
        title: "Error",
        description: "Failed to refresh nearby users.",
        variant: "destructive"
      });
    }
  };

  // Count users with location for map view
  const usersWithLocation = nearbyUsers.filter(user => user.location).length;
  const totalUsers = nearbyUsers.length;

  return (
    <div className="container mx-auto px-4 py-6 mb-20 max-w-4xl">
      <MapPageHeader 
        loading={loading} 
        handleRefresh={handleRefresh} 
      />
      
      <Tabs defaultValue="map" className="mb-6">
        <div className="flex flex-col gap-2">
          <MapTabsList 
            usersWithLocation={usersWithLocation} 
            totalUsers={totalUsers} 
          />
          
          <LocationSettings 
            isManualMode={isManualMode}
            isPrivacyModeEnabled={isPrivacyModeEnabled}
            isTracking={isTracking}
            toggleManualMode={toggleManualMode}
            togglePrivacyMode={togglePrivacyMode}
            toggleLocationTracking={toggleLocationTracking}
          />
        </div>
        
        <MapTabsView 
          usersWithLocation={usersWithLocation}
          totalUsers={totalUsers}
          isManualMode={isManualMode}
          isTracking={isTracking}
          isPrivacyModeEnabled={isPrivacyModeEnabled}
        />
        
        <ListTabsView />
      </Tabs>
    </div>
  );
};

export default MapPage;
