
import { useState, useCallback, useEffect } from 'react';
import { nearbyUsersService } from '@/services/user';
import { useAuthContext } from '@/context/AuthContext';
import { AppUser, Location } from '@/context/types';
import { toast } from 'sonner';

/**
 * Hook for managing nearby users
 */
export const useNearbyUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuthContext();

  /**
   * Fetch nearby users based on user location and radius
   */
  const fetchNearbyUsers = useCallback(
    async (
      location: Location | undefined | null = currentUser?.location,
      radiusInKm: number = 2,
      showToast: boolean = false
    ) => {
      if (!location) {
        console.warn('No location provided for fetching nearby users');
        setError('No location available');
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching nearby users with radius:', radiusInKm);

        // Get users from database
        const fetchedUsers = await nearbyUsersService.getNearbyUsers(
          location,
          radiusInKm
        );

        // Filter out the current user and map profiles to AppUser format
        if (!fetchedUsers || !Array.isArray(fetchedUsers)) {
          console.error('Invalid users data received:', fetchedUsers);
          throw new Error('Failed to fetch nearby users');
        }

        console.log('Raw fetched users:', fetchedUsers);

        // Filter out the current user
        const otherUsers = fetchedUsers
          .filter(profile => profile.id !== currentUser?.id)
          .map(profile => ({
            ...profile,
            email: '', // We don't have emails for other users
            interests: Array.isArray(profile.interests) ? profile.interests : [],
            // Handle is_online property with type safety
            isOnline: profile.is_online !== undefined ? Boolean(profile.is_online) : false
          }));

        console.log("Processed other users:", otherUsers);
        setUsers(otherUsers);

        if (showToast) {
          toast.success('Found ' + otherUsers.length + ' people nearby');
        }

        setLoading(false);
        return otherUsers;
      } catch (err) {
        console.error('Error fetching nearby users:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch nearby users');
        setLoading(false);
        
        if (showToast) {
          toast.error('Failed to find people nearby');
        }
        
        return [];
      }
    },
    [currentUser]
  );

  return {
    nearbyUsers: users,
    loading,
    error,
    fetchNearbyUsers
  };
};

export default useNearbyUsers;
