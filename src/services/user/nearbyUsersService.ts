
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
    
    // Two-phase query approach to optimize data egress
    // First, get minimal data with locations to calculate distances
    const { data: minimalProfiles, error: minimalError } = await supabase
      .from('profiles')
      .select('id, location, is_online')
      .neq('id', userId)
      .limit(50); // Get more initial profiles to filter client-side
      
    if (minimalError) {
      console.error("Error fetching minimal profiles:", minimalError);
      throw minimalError;
    }
    
    // Convert to basic users with just location data
    const basicUsers = minimalProfiles.map(profile => {
      return {
        id: profile.id,
        location: profile.location ? extractLocationFromPgPoint(profile.location) : undefined,
        isOnline: profile.is_online || false
      };
    });
    
    // Calculate distances locally
    const usersWithDistance = processNearbyUsers(basicUsers as AppUser[], location);
    
    // Filter by distance
    const nearbyUsers = filterUsersByDistance(usersWithDistance, radiusKm);
    
    // If no users or very few users, return empty array or small set
    if (nearbyUsers.length === 0) {
      return [];
    }
    
    // For users that are actually nearby, fetch additional details
    // but limit to a smaller set to reduce data transfer
    const nearbyUserIds = nearbyUsers.slice(0, 10).map(user => user.id);
    
    const { data: detailedProfiles, error: detailError } = await supabase
      .from('profiles')
      .select('id, name, profile_pic, interests, bio, gender, age, is_online')
      .in('id', nearbyUserIds)
      .order('is_online', { ascending: false });
      
    if (detailError) {
      console.error("Error fetching detailed profiles:", detailError);
      throw detailError;
    }
    
    // Merge detailed data with distance information
    const enrichedUsers = detailedProfiles.map(profile => {
      const baseUser = nearbyUsers.find(u => u.id === profile.id);
      return {
        id: profile.id,
        name: profile.name || 'User',
        email: '', // We don't need emails for other users
        avatar: profile.profile_pic || undefined,
        location: baseUser?.location,
        distance: baseUser?.distance,
        interests: Array.isArray(profile.interests) ? profile.interests : [],
        profile_pic: profile.profile_pic || undefined,
        bio: profile.bio || undefined,
        age: profile.age || undefined,
        gender: profile.gender || undefined,
        isOnline: profile.is_online || false,
        blockedUsers: [] // Default empty array
      };
    });
    
    // Sort by distance
    enrichedUsers.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    
    return enrichedUsers;
  } catch (error) {
    console.error("Error getting nearby users:", error);
    return [];
  }
};
