
import React, { useEffect, useMemo } from 'react';
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

  // Filter users based on matching activities (same logic as UserList component)
  const filteredUsers = useMemo(() => {
    // Get only online and real users, excluding the current user
    let onlineUsers = nearbyUsers.filter(user => 
      // Exclude the current user first
      user.id !== currentUser?.id &&
      // Only include users marked as online
      user.isOnline === true &&
      // Filter out users that don't have a valid ID or have test/mock in their ID
      user.id && !String(user.id).includes('test') && !String(user.id).includes('mock')
    );

    // Filter users based on matching activities if current user has selected today's activities
    if (currentUser?.todayActivities && currentUser.todayActivities.length > 0) {
      onlineUsers = onlineUsers.filter(user => {
        // If the user doesn't have today's activities set, don't show them
        if (!user.todayActivities || user.todayActivities.length === 0) {
          return false;
        }
        
        // Check if there's at least one matching activity
        return user.todayActivities.some(activity => 
          currentUser.todayActivities!.includes(activity)
        );
      });
    }

    return onlineUsers;
  }, [nearbyUsers, currentUser]);

  // Count users with location for map view from filtered users
  const usersWithLocation = filteredUsers.filter(user => user.location).length;
  const totalUsers = nearbyUsers.length;
  const filteredUsersCount = filteredUsers.length;

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
            filteredUsersCount={filteredUsersCount}
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
