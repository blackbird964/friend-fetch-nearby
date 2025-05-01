
import { useState } from 'react';
import { getAllProfiles } from '@/lib/supabase';
import { AppUser } from '@/context/types';
import { processNearbyUsers } from '@/context/userService';
import { DEFAULT_LOCATION } from '@/utils/locationUtils';

/**
 * Hook to manage nearby users functionality
 */
export const useNearbyUsers = (currentUser: AppUser | null) => {
  const [nearbyUsers, setNearbyUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
    } catch (error) {
      console.error("Error fetching nearby users:", error);
    } finally {
      setLoading(false);
    }
  };

  return { nearbyUsers, setNearbyUsers, loading, refreshNearbyUsers };
};
