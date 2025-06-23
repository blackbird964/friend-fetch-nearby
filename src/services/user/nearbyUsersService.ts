
import { supabase } from '@/integrations/supabase/client';
import { AppUser, ActivePriority } from '@/context/types';
import { Json } from '@/integrations/supabase/types';

export async function fetchNearbyUsers(
  currentUserId: string,
  userLocation: { lat: number; lng: number },
  radiusInKm: number = 5
): Promise<AppUser[]> {
  try {
    console.log('=== FETCHING NEARBY USERS ===');
    console.log('Current user ID:', currentUserId);
    console.log('User location:', userLocation);
    console.log('Radius:', radiusInKm);

    // Fetch all users excluding current user
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        bio,
        age,
        gender,
        interests,
        profile_pic,
        location,
        last_seen,
        is_online,
        is_over_18,
        active_priorities,
        preferred_hangout_duration,
        today_activities,
        blocked_users
      `)
      .neq('id', currentUserId)
      .not('location', 'is', null);

    console.log('Raw query result - users count:', users?.length || 0);
    console.log('Query error:', error);

    if (error) {
      console.error('Error fetching nearby users:', error);
      return [];
    }

    if (!users || users.length === 0) {
      console.log('No users found in database');
      return [];
    }

    console.log('Processing users with locations...');

    // Process users with improved location parsing
    const processedUsers = users.map(user => {
      if (!user.location) {
        console.log(`User ${user.name} has no location, skipping`);
        return null;
      }

      let userLat: number | null = null;
      let userLng: number | null = null;

      // Handle PostgreSQL point format: "(longitude,latitude)" or POINT(longitude latitude)
      if (typeof user.location === 'string') {
        const pointMatch = user.location.match(/\(([^,\s]+)[,\s]\s*([^)]+)\)/);
        if (pointMatch) {
          const [, lngStr, latStr] = pointMatch;
          userLng = parseFloat(lngStr);
          userLat = parseFloat(latStr);
        }
      } else if (typeof user.location === 'object' && user.location !== null) {
        const location = user.location as any;
        userLat = location.lat || location.x || location.latitude || location.y;
        userLng = location.lng || location.lon || location.longitude || location.x;
      }

      // Validate coordinates
      if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
        console.log(`User ${user.name} - Invalid coordinates: lat=${userLat}, lng=${userLng}`);
        return null;
      }

      // Calculate distance using Haversine formula
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        userLat,
        userLng
      );

      // Handle active_priorities type conversion
      let activePriorities: ActivePriority[] = [];
      if (user.active_priorities) {
        try {
          const priorities = Array.isArray(user.active_priorities) ? user.active_priorities : [];
          activePriorities = priorities
            .filter((p: Json) => {
              if (typeof p !== 'object' || p === null) return false;
              const priority = p as Record<string, any>;
              return (
                typeof priority.id === 'string' &&
                typeof priority.category === 'string' &&
                typeof priority.activity === 'string'
              );
            })
            .map((p: Json) => p as unknown as ActivePriority);
        } catch (e) {
          console.warn('Failed to parse active_priorities:', e);
          activePriorities = [];
        }
      }

      const appUser: AppUser = {
        id: user.id,
        name: user.name || '',
        bio: user.bio,
        age: user.age,
        gender: user.gender,
        interests: user.interests || [],
        profile_pic: user.profile_pic,
        email: '',
        location: { lat: userLat, lng: userLng },
        distance,
        last_seen: user.last_seen,
        is_online: user.is_online,
        isOnline: Boolean(user.is_online), // Simplified - show all users
        is_over_18: user.is_over_18,
        active_priorities: activePriorities,
        preferredHangoutDuration: user.preferred_hangout_duration ? parseInt(user.preferred_hangout_duration) : null,
        todayActivities: user.today_activities || [],
        blockedUsers: user.blocked_users || [],
        blocked_users: user.blocked_users || []
      };

      console.log(`✅ Processed user ${user.name}: distance=${distance.toFixed(2)}km`);
      return appUser;
    })
    .filter((user): user is AppUser => user !== null)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    console.log(`🎯 FINAL RESULT: ${processedUsers.length} users ready to display`);
    
    return processedUsers;
  } catch (error) {
    console.error('❌ Error in fetchNearbyUsers:', error);
    return [];
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

// Create the service object
export const nearbyUsersService = {
  getNearbyUsers: fetchNearbyUsers
};
