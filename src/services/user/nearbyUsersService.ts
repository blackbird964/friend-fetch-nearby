
import { supabase } from '@/integrations/supabase/client';
import { AppUser } from '@/context/types';
import { processNearbyUsers, filterUsersByDistance } from './userFilterService';
import { extractLocationFromPgPoint } from './userLocationService';

/**
 * Service for managing nearby users functionality
 */
export const nearbyUsersService = {
  /**
   * Get nearby users for a specific location and radius with fresh data
   */
  getNearbyUsers: async (
    location: { lat: number, lng: number }, 
    radiusKm: number
  ): Promise<AppUser[]> => {
    try {
      console.log(`Getting nearby users within ${radiusKm}km radius with fresh data`);
      
      // Fetch all profiles from the database with the most current data
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false }); // Get most recently updated first
        
      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      console.log("All fetched profiles with fresh data:", profiles?.length);
      
      // Convert to AppUser type with all current preferences
      const otherUsers = profiles?.map(profile => {
        // Use type assertion to handle properties that might not be in the type
        const typedProfile = profile as any;
        const userData: AppUser = {
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
          blockedUsers: typedProfile.blocked_users || [],
          todayActivities: Array.isArray(typedProfile.today_activities) ? typedProfile.today_activities : [],
          preferredHangoutDuration: typedProfile.preferred_hangout_duration || '30',
          active_priorities: typedProfile.active_priorities || []
        };
        
        console.log(`Processed user: ${profile.id}, name: ${userData.name}, activities: ${userData.todayActivities}, interests: ${userData.interests}, duration: ${userData.preferredHangoutDuration}`);
        return userData;
      }) || [];

      console.log(`Found ${otherUsers.length} users with updated preferences`);
      
      // If we have a location, calculate distance and filter by radius
      if (location && location.lat && location.lng) {
        // Calculate distance for each user
        const usersWithDistance = processNearbyUsers(otherUsers, location);
        
        // Filter users by distance
        const nearbyUsers = filterUsersByDistance(usersWithDistance, radiusKm);
        
        console.log(`After distance filtering: ${nearbyUsers.length} users within ${radiusKm}km with current preferences`);
        return nearbyUsers;
      } else {
        // If no location provided, return all users without distance filtering
        console.log("No location provided, returning all users with current preferences");
        return otherUsers;
      }
    } catch (error) {
      console.error("Error getting nearby users with fresh data:", error);
      return [];
    }
  }
};

// Also export individual functions for direct access if needed
export { processNearbyUsers, filterUsersByDistance };
