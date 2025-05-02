
import { supabase } from '@/integrations/supabase/client';
import { Profile, updateUserLocation as updateLocation } from '@/lib/supabase';
import { AppUser } from './types';
import { calculateDistance, DEFAULT_LOCATION, formatLocationForStorage } from '@/utils/locationUtils';

/**
 * Update user location in Supabase and local state
 */
export const updateUserLocation = async (userId: string, location: { lat: number, lng: number }) => {
  try {
    console.log("Updating user location in context:", userId, location);
    
    // Format the location data for storage if needed
    const formattedLocation = location;
    
    const result = await updateLocation(userId, formattedLocation);
    
    // Add a direct debug update to ensure the location is properly saved
    const { data, error } = await supabase
      .from('profiles')
      .update({ location: formattedLocation })
      .eq('id', userId)
      .select();
      
    if (error) {
      console.error("Error directly updating user location:", error);
    } else {
      console.log("Location directly updated:", data);
    }
    
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
    
    // If location is provided, update it separately with the correct format
    if (updatedProfile.location) {
      await updateUserLocation(updatedProfile.id, updatedProfile.location);
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Add test users nearby the current user for development purposes
 */
export const addTestUsersNearby = async (currentUserId: string, currentLocation: { lat: number, lng: number }) => {
  try {
    // This function could add test users with locations near the current user
    // For development/testing purposes
    console.log("Could add test users near", currentLocation);
    
    // Implementation would go here if needed
  } catch (error) {
    console.error("Error adding test users:", error);
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
    const userWithDistance = { ...user };
    
    if (!user.location || !user.location.lat || !user.location.lng) {
      userWithDistance.distance = Infinity;
      return userWithDistance;
    }
    
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      user.location.lat,
      user.location.lng
    );
    
    userWithDistance.distance = distance;
    return userWithDistance;
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
