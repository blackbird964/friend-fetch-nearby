import { useState, useCallback } from 'react';
import { AppUser, Location } from '@/context/types';
import { updateUserLocation, updateUserProfile } from '@/services/user';

/**
 * Hook for managing user profile updates
 */
export const useUserProfile = () => {
  const [loading, setLoading] = useState(false);

  // Update user location
  const handleUpdateUserLocation = useCallback(async (userId: string, location: Location, options?: { hideExactLocation?: boolean }): Promise<void> => {
    setLoading(true);
    try {
      await updateUserLocation(userId, location, options);
    } catch (error) {
      console.error('Error updating user location:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update user profile
  const handleUpdateUserProfile = useCallback(async (profileData: Partial<AppUser>): Promise<void> => {
    setLoading(true);
    try {
      if (!profileData.id) {
        throw new Error('User ID is missing for profile update');
      }
      
      // Create a properly typed profile object with all necessary fields
      const profileUpdate = { 
        ...profileData,
        // Ensure all values are properly formatted
        gender: profileData.gender?.toLowerCase(), // Ensure consistent case
      };
      
      console.log("Profile update in hook before sending:", profileUpdate);
      
      const result = await updateUserProfile(profileUpdate);
      console.log("Profile update result:", result);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error; // Re-throw to allow handling in component
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user location mode (manual or automatic)
  const handleUpdateLocationMode = useCallback(async (userId: string, isManual: boolean): Promise<void> => {
    setLoading(true);
    try {
      // Create proper update object for location settings
      const updateData = { 
        id: userId,
        location_settings: { 
          is_manual_mode: isManual,
          // Keep the existing hide_exact_location value or set a default
          hide_exact_location: false
        } 
      };
      
      await updateUserProfile(updateData);
    } catch (error) {
      console.error('Error updating location mode:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user location privacy (hide exact location)
  const handleUpdateLocationPrivacy = useCallback(async (userId: string, hideExactLocation: boolean): Promise<void> => {
    setLoading(true);
    try {
      // Create proper update object for location privacy settings
      const updateData = { 
        id: userId,
        location_settings: { 
          hide_exact_location: hideExactLocation,
          // Keep the existing is_manual_mode value or set a default 
          is_manual_mode: false
        } 
      };
      
      await updateUserProfile(updateData);
    } catch (error) {
      console.error('Error updating location privacy:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateUserLocation: handleUpdateUserLocation,
    updateUserProfile: handleUpdateUserProfile,
    updateLocationMode: handleUpdateLocationMode,
    updateLocationPrivacy: handleUpdateLocationPrivacy,
    loading
  };
};
