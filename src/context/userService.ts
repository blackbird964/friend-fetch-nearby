
import { supabase } from '@/integrations/supabase/client';
import { Profile, updateUserLocation as updateLocation } from '@/lib/supabase';
import { AppUser } from './types';
import { calculateDistance, DEFAULT_LOCATION } from '@/utils/locationUtils';

/**
 * Update user location in Supabase and local state
 */
export const updateUserLocation = async (userId: string, location: { lat: number, lng: number }) => {
  try {
    console.log("Updating user location in context:", userId, location);
    const result = await updateLocation(userId, location);
    return result;
  } catch (error) {
    console.error("Error updating user location:", error);
    throw error;
  }
};

/**
 * Update user profile in Supabase
 */
export const updateUserProfile = async (updatedProfile: Partial<Profile>) => {
  try {
    if (!updatedProfile.id) {
      throw new Error('Profile ID is missing');
    }
    
    // Create a clean copy of the profile data without location
    const profileUpdate = { ...updatedProfile };
    
    // Remove location from update to avoid format errors
    delete profileUpdate.location;
    
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', updatedProfile.id);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Process nearby users with distance calculation
 */
export const processNearbyUsers = (
  otherUsers: AppUser[],
  userLocation: { lat: number, lng: number }
): AppUser[] => {
  return otherUsers.map(user => {
    if (!user.location || !user.location.lat || !user.location.lng) {
      return { ...user, distance: Infinity };
    }
    
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      user.location.lat,
      user.location.lng
    );
    
    return { ...user, distance };
  });
};

/**
 * Filter users by maximum distance in kilometers
 */
export const filterUsersByDistance = (users: AppUser[], maxDistanceKm: number): AppUser[] => {
  return users.filter(user => {
    // Only filter users that have location data
    if (!user.distance || user.distance === Infinity) return true;
    return user.distance <= maxDistanceKm;
  });
};
