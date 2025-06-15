
import { supabase } from '@/integrations/supabase/client';
import { AppUser } from '@/context/types';

export async function fetchNearbyUsers(
  currentUserId: string,
  userLocation: { lat: number; lng: number },
  radiusInKm: number = 5
): Promise<AppUser[]> {
  try {
    console.log('Fetching nearby users for user:', currentUserId);
    console.log('User location:', userLocation);
    console.log('Radius:', radiusInKm);

    // Fetch users within radius using ST_DWithin (distance in meters)
    const radiusInMeters = radiusInKm * 1000;
    
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
      .not('location', 'is', null)
      .eq('is_online', true);

    if (error) {
      console.error('Error fetching nearby users:', error);
      return [];
    }

    if (!users || users.length === 0) {
      console.log('No users found');
      return [];
    }

    // Calculate distances and filter by radius
    const usersWithDistance = users
      .map(user => {
        if (!user.location) return null;

        const userLat = (user.location as any).x || (user.location as any).lat;
        const userLng = (user.location as any).y || (user.location as any).lng;

        if (!userLat || !userLng) return null;

        // Calculate distance using Haversine formula
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          userLat,
          userLng
        );

        if (distance > radiusInKm) return null;

        const appUser: AppUser = {
          id: user.id,
          name: user.name || '',
          bio: user.bio,
          age: user.age,
          gender: user.gender,
          interests: user.interests || [],
          profile_pic: user.profile_pic,
          email: '', // Email not available in profiles table
          location: { lat: userLat, lng: userLng },
          distance,
          last_seen: user.last_seen,
          is_online: user.is_online,
          isOnline: user.is_online, // For backwards compatibility
          is_over_18: user.is_over_18,
          active_priorities: Array.isArray(user.active_priorities) ? user.active_priorities : [],
          preferredHangoutDuration: user.preferred_hangout_duration ? parseInt(user.preferred_hangout_duration) : null,
          todayActivities: user.today_activities || [],
          blockedUsers: user.blocked_users || [],
          blocked_users: user.blocked_users || [] // For backwards compatibility
        };

        return appUser;
      })
      .filter((user): user is AppUser => user !== null)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    console.log(`Found ${usersWithDistance.length} nearby users within ${radiusInKm}km`);
    return usersWithDistance;
  } catch (error) {
    console.error('Error in fetchNearbyUsers:', error);
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
