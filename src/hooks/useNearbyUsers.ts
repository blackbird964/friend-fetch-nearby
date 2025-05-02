
import { useState, useRef } from 'react';
import { getAllProfiles } from '@/lib/supabase';
import { AppUser } from '@/context/types';
import { processNearbyUsers, addTestUsersNearby } from '@/context/userService';
import { DEFAULT_LOCATION } from '@/utils/locationUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Hook to manage nearby users functionality
 */
export const useNearbyUsers = (currentUser: AppUser | null) => {
  const [nearbyUsers, setNearbyUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const hasInitiallyFetched = useRef<boolean>(false);

  /**
   * Refresh nearby users list
   * @param showToast Whether to show a toast notification (default: false)
   */
  const refreshNearbyUsers = async (showToast: boolean = false) => {
    if (!currentUser) return;

    try {
      // Throttle refreshes even more aggressively on mobile - wait at least 5 seconds
      const now = Date.now();
      const throttleTime = isMobile ? 5000 : 3000;
      
      if (now - lastFetchTime < throttleTime) {
        console.log("Skipping refresh - throttled");
        return;
      }
      
      setLoading(true);
      setLastFetchTime(now);
      console.log("Refreshing nearby users for:", currentUser.name, "with ID:", currentUser.id);
      
      // Set default location if user doesn't have one
      const userLocation = currentUser.location || DEFAULT_LOCATION;
      
      // Fetch all profiles from the database
      const profiles = await getAllProfiles();
      console.log("Fetched profiles:", profiles);
      
      // Filter out the current user and convert to AppUser type
      const otherUsers = profiles
        .filter(profile => profile.id !== currentUser.id)
        .map(profile => ({
          ...profile,
          email: '', // We don't have emails for other users
          interests: Array.isArray(profile.interests) ? profile.interests : []
        }));

      console.log("Other users:", otherUsers);
      
      // Calculate distance for each user
      const usersWithDistance = processNearbyUsers(otherUsers, userLocation);
      console.log("Users with distance calculation:", usersWithDistance);
      
      // Set all users, including those without location
      setNearbyUsers(usersWithDistance);
      
      // If there are no users with location data, we could add some test users
      if (usersWithDistance.every(user => !user.location || user.distance === Infinity)) {
        const testUsers = await addTestUsersNearby(currentUser.id, userLocation);
        console.log("Added test users:", testUsers);
        
        // For testing only: simulate adding these users with location data
        if (testUsers.length > 0 && process.env.NODE_ENV === 'development') {
          // Only show test users in dev mode
          setNearbyUsers([...usersWithDistance, ...testUsers]);
        }
      }
      
      // Set the initial fetch flag to true
      hasInitiallyFetched.current = true;
      
      // Only show toast if explicitly requested AND not on mobile
      // This prevents toast flickering on mobile when auto-refreshing
      if (showToast && !isMobile) {
        toast({
          title: "Users Updated",
          description: `Found ${usersWithDistance.length} users nearby.`,
        });
      }
    } catch (error) {
      console.error("Error fetching nearby users:", error);
      // Only show error toast if explicitly requested by the user through manual refresh
      if (showToast) {
        toast({
          title: "Error",
          description: "Failed to refresh nearby users.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return { nearbyUsers, setNearbyUsers, loading, refreshNearbyUsers, lastFetchTime };
};
