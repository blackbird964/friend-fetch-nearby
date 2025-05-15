
import { supabase } from '@/integrations/supabase/client';
import { AppUser } from '@/context/types';
import { processNearbyUsers, filterUsersByDistance } from './userFilterService';
import { extractLocationFromPgPoint } from './userLocationService';
import { addTestUsersNearby } from './testUserService';

/**
 * Get nearby users for a user based on their location and radius
 * Optimized for reduced data egress
 */
export const getNearbyUsers = async (userId: string, location: { lat: number, lng: number }, radiusKm: number): Promise<AppUser[]> => {
  try {
    console.log(`Getting nearby users for user ${userId} within ${radiusKm}km radius`);
    
    // Only fetch required fields, not everything
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name, location, profile_pic, interests, bio, gender, age, is_online')
      .neq('id', userId)
      .order('is_online', { ascending: false })
      .limit(20); // Limit number of users to reduce data transfer
      
    if (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }
    
    // Filter out the current user and convert to AppUser type
    const otherUsers = profiles.map(profile => {
      return {
        id: profile.id,
        name: profile.name || 'User',
        email: '', // We don't need emails for other users
        avatar: profile.profile_pic || undefined,
        location: profile.location ? extractLocationFromPgPoint(profile.location) : undefined,
        interests: Array.isArray(profile.interests) ? profile.interests : [],
        profile_pic: profile.profile_pic || undefined,
        bio: profile.bio || undefined,
        age: profile.age || undefined,
        gender: profile.gender || undefined,
        isOnline: profile.is_online || false,
        blockedUsers: [] // Default empty array
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
