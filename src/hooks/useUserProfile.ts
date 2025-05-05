
import { useState, useCallback } from 'react';
import { AppUser, Location } from '@/context/types';
import { updateUserLocation, updateUserProfile } from '@/services/user';

/**
 * Hook for managing user profile updates
 */
export const useUserProfile = () => {
  const [loading, setLoading] = useState(false);

  // Update user location
  const handleUpdateUserLocation = useCallback(async (userId: string, location: Location): Promise<void> => {
    setLoading(true);
    try {
      await updateUserLocation(userId, location);
    } catch (error) {
      console.error('Error updating user location:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update user profile
  const handleUpdateUserProfile = useCallback(async (userId: string, profileData: Partial<AppUser>): Promise<void> => {
    setLoading(true);
    try {
      await updateUserProfile({ ...profileData, id: userId });
    } catch (error) {
      console.error('Error updating user profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateUserLocation: handleUpdateUserLocation,
    updateUserProfile: handleUpdateUserProfile,
    loading
  };
};
