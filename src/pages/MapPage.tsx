
import React, { useEffect } from 'react';
import { Tabs } from "@/components/ui/tabs";
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useLocationSettings } from '@/hooks/useLocationSettings';

// Import our refactored components
import {
  MapPageHeader,
  MapTabsList,
  MapTabsView,
  ListTabsView,
  LocationSettings
} from '@/components/map/page';

const MapPage: React.FC = () => {
  const { refreshNearbyUsers, loading, currentUser, nearbyUsers } = useAppContext();
  const { toast } = useToast();
  
  // Use our location settings hook
  const { 
    isManualMode, 
    isTracking, 
    isPrivacyModeEnabled,
    toggleManualMode,
    toggleLocationTracking,
    togglePrivacyMode
  } = useLocationSettings();
  
  // Fetch nearby users on initial load
  useEffect(() => {
    if (currentUser?.location) {
      refreshNearbyUsers(false);
    }
  }, [currentUser?.location, refreshNearbyUsers]);
  
  const handleRefresh = async (e: React.MouseEvent) => {
    // Stop propagation to prevent event bubbling
    e.stopPropagation();
    
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
    <div className="container mx-auto px-4 py-6 mb-20 max-w-4xl" onClick={(e) => e.stopPropagation()}>
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
