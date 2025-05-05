
import { supabase } from '@/integrations/supabase/client';
import { Profile, updateUserLocation as updateLocation } from '@/lib/supabase';
import { AppUser } from './types';
import { calculateDistance, DEFAULT_LOCATION, formatLocationForStorage, createTestUsers } from '@/utils/locationUtils';

/**
 * Update user location in Supabase and local state
 */
export const updateUserLocation = async (userId: string, location: { lat: number, lng: number }) => {
  try {
    console.log("Updating user location in context:", userId, location);
    
    // Format the location data for PostgreSQL point type storage
    const formattedLocation = formatLocationForStorage(location);
    
    console.log("Formatted location for PostgreSQL:", formattedLocation);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ location: formattedLocation })
      .eq('id', userId)
      .select();
      
    if (error) {
      console.error("Error updating user location:", error);
      throw error;
    } else {
      console.log("Location successfully updated:", data);
    }
    
    return { data, error };
  } catch (error) {
    console.error("Error in updateUserLocation:", error);
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
    
    // Create a copy of the profile data without location
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
    // Create test users near the current user's location
    const testUsers = createTestUsers(currentLocation, 5);
    
    console.log("Generated test users:", testUsers);
    
    // In a real app, we would save these users to the database
    // For now, just return them
    return testUsers;
  } catch (error) {
    console.error("Error adding test users:", error);
    return [];
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

/**
 * Get nearby users for a user based on their location and radius
 */
export const getNearbyUsers = async (userId: string, location: { lat: number, lng: number }, radiusKm: number): Promise<AppUser[]> => {
  try {
    console.log(`Getting nearby users for user ${userId} within ${radiusKm}km radius`);
    
    // Fetch all profiles from the database
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');
      
    if (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }
    
    // Filter out the current user and convert to AppUser type
    const otherUsers = profiles
      .filter(profile => profile.id !== userId)
      .map(profile => {
        // Use type assertion to handle the blockedUsers property
        const typedProfile = profile as any;
        return {
          id: profile.id,
          name: profile.name || 'User',
          email: '', // We don't have emails for other users
          avatar: profile.profile_pic || undefined,
          location: profile.location ? extractLocationFromPgPoint(profile.location) : undefined,
          interests: Array.isArray(profile.interests) ? profile.interests : [],
          profile_pic: profile.profile_pic || undefined,
          bio: profile.bio || undefined,
          age: profile.age || undefined,
          gender: profile.gender || undefined,
          blockedUsers: typedProfile.blockedUsers || [] // Use type assertion to access blockedUsers
        };
      });

    // Calculate distance for each user
    const usersWithDistance = processNearbyUsers(otherUsers, location);
    
    // Filter users by distance
    const nearbyUsers = filterUsersByDistance(usersWithDistance, radiusKm);
    
    return nearbyUsers;
  } catch (error) {
    console.error("Error getting nearby users:", error);
    return [];
  }
};

/**
 * Extract location from PostgreSQL point type
 */
const extractLocationFromPgPoint = (pgPoint: unknown): { lat: number, lng: number } | undefined => {
  try {
    if (typeof pgPoint === 'string' && pgPoint.startsWith('(')) {
      const match = pgPoint.match(/\(([^,]+),([^)]+)\)/);
      if (match) {
        return {
          lng: parseFloat(match[1]),
          lat: parseFloat(match[2])
        };
      }
    } else if (typeof pgPoint === 'object' && pgPoint !== null) {
      const point = pgPoint as any;
      if (point.lat !== undefined && point.lng !== undefined) {
        return {
          lat: point.lat,
          lng: point.lng
        };
      }
    }
    return undefined;
  } catch (e) {
    console.error('Error parsing PG point:', e);
    return undefined;
  }
};
