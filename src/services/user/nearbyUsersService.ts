
import { supabase } from '@/integrations/supabase/client';
import { AppUser } from '@/context/types';
import { processNearbyUsers, filterUsersByDistance } from './userFilterService';
import { extractLocationFromPgPoint } from './userLocationService';
import { addTestUsersNearby } from './testUserService';
import { getNearbyBusinesses } from '@/services/business/businessService';

/**
 * Service for managing nearby users functionality
 */
export const nearbyUsersService = {
  /**
   * Get nearby users for a specific location and radius
   */
  getNearbyUsers: async (
    location: { lat: number, lng: number }, 
    radiusKm: number
  ): Promise<AppUser[]> => {
    try {
      console.log(`Getting nearby users within ${radiusKm}km radius`);
      
      // Fetch all profiles from the database
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      console.log("All fetched profiles:", profiles);
      
      // Convert to AppUser type
      const otherUsers = profiles.map(profile => {
        const typedProfile = profile as any;
        const userData: AppUser = {
          id: profile.id,
          name: profile.name || 'User',
          email: '',
          avatar: profile.profile_pic || undefined,
          location: profile.location ? extractLocationFromPgPoint(profile.location) : undefined,
          interests: Array.isArray(profile.interests) ? profile.interests : [],
          profile_pic: profile.profile_pic || undefined,
          bio: profile.bio || undefined,
          age: profile.age || undefined,
          gender: profile.gender || undefined,
          isOnline: typedProfile.is_online || false,
          blockedUsers: typedProfile.blockedUsers || []
        };
        
        console.log(`Processed user: ${profile.id}, name: ${userData.name}`);
        return userData;
      });

      console.log(`Found ${otherUsers.length} users`, otherUsers);
      
      // Also fetch nearby businesses
      const businesses = await getNearbyBusinesses(location, radiusKm);
      console.log(`Found ${businesses.length} businesses`);
      
      // Convert businesses to AppUser format for map display
      const businessUsers: AppUser[] = businesses.map(business => ({
        id: business.id,
        name: business.business_name,
        email: business.email || '',
        avatar: undefined,
        location: business.location ? extractLocationFromPgPoint(business.location) : undefined,
        interests: [business.business_type],
        profile_pic: undefined,
        bio: business.description || '',
        age: undefined,
        gender: undefined,
        isOnline: business.is_online,
        blockedUsers: [],
        // Mark as business for map rendering
        isBusiness: true,
        businessType: business.business_type
      }));
      
      // Combine users and businesses
      const allEntities = [...otherUsers, ...businessUsers];
      
      // If we have a location, calculate distance and filter by radius
      if (location && location.lat && location.lng) {
        const entitiesWithDistance = processNearbyUsers(allEntities, location);
        const nearbyEntities = filterUsersByDistance(entitiesWithDistance, radiusKm);
        
        console.log(`After distance filtering: ${nearbyEntities.length} entities within ${radiusKm}km`);
        return nearbyEntities;
      } else {
        console.log("No location provided, returning all entities without distance filtering");
        return allEntities;
      }
    } catch (error) {
      console.error("Error getting nearby users:", error);
      return [];
    }
  }
};

// Also export individual functions for direct access if needed
export { processNearbyUsers, filterUsersByDistance };
