
import { useState } from 'react';
import { getAllProfiles } from '@/lib/supabase';
import { AppUser } from '@/context/types';
import { processNearbyUsers, addTestUsersNearby } from '@/context/userService';
import { DEFAULT_LOCATION } from '@/utils/locationUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to manage nearby users functionality
 */
export const useNearbyUsers = (currentUser: AppUser | null) => {
  const [nearbyUsers, setNearbyUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  /**
   * Refresh nearby users list
   */
  const refreshNearbyUsers = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      console.log("Refreshing nearby users for:", currentUser.name, "with ID:", currentUser.id);
      
      // Set default location if user doesn't have one
      const userLocation = currentUser.location || DEFAULT_LOCATION;
      
      // Fetch all profiles from the database
      const profiles = await getAllProfiles();
      console.log("Fetched profiles:", profiles);
      
      // Debug each profile's location data
      profiles.forEach(profile => {
        console.log(`Profile ${profile.id} (${profile.name}) location:`, profile.location);
      });
      
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
      
      // Show success toast
      toast({
        title: "Users Updated",
        description: `Found ${usersWithDistance.length} users nearby.`,
      });
    } catch (error) {
      console.error("Error fetching nearby users:", error);
      toast({
        title: "Error",
        description: "Failed to refresh nearby users.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { nearbyUsers, setNearbyUsers, loading, refreshNearbyUsers };
};
