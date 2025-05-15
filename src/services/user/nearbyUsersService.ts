
import { supabase } from '@/integrations/supabase/client';
import { AppUser } from '@/context/types';
import { processNearbyUsers, filterUsersByDistance } from './userFilterService';
import { extractLocationFromPgPoint } from './userLocationService';
import { addTestUsersNearby } from './testUserService';

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
