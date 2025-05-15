
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

    console.log("All fetched profiles:", profiles);
    
    // Filter out the current user and convert to AppUser type
    const otherUsers = profiles
      .filter(profile => profile.id !== userId)
      .map(profile => {
        // Use type assertion to handle the blockedUsers property
        const typedProfile = profile as any;
        const userData = {
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
          isOnline: typedProfile.is_online || false,
          blockedUsers: typedProfile.blockedUsers || [] // Use type assertion to access blockedUsers
        };
        
        console.log(`Processed user: ${profile.id}, name: ${userData.name}`);
        return userData;
      });

    console.log(`Found ${otherUsers.length} other users`, otherUsers);
    
    // If we have a location, calculate distance and filter by radius
    if (location && location.lat && location.lng) {
      // Calculate distance for each user
      const usersWithDistance = processNearbyUsers(otherUsers, location);
      
      // Filter users by distance
      const nearbyUsers = filterUsersByDistance(usersWithDistance, radiusKm);
      
      console.log(`After distance filtering: ${nearbyUsers.length} users within ${radiusKm}km`);
      return nearbyUsers;
    } else {
      // If no location provided, return all users without distance filtering
      console.log("No location provided, returning all users without distance filtering");
      return otherUsers;
    }
  } catch (error) {
    console.error("Error getting nearby users:", error);
    return [];
  }
};
