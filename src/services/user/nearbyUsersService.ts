
import { supabase } from '@/integrations/supabase/client';
import { AppUser, ActivePriority } from '@/context/types';
import { Json } from '@/integrations/supabase/types';

export async function fetchNearbyUsers(
  currentUserId: string,
  userLocation: { lat: number; lng: number },
  radiusInKm: number = 5
): Promise<AppUser[]> {
  try {
    console.log('=== DEBUGGING NEARBY USERS FETCH ===');
    console.log('Fetching nearby users for user:', currentUserId);
    console.log('User location:', userLocation);
    console.log('Radius:', radiusInKm);

    // RELAXED: Fetch all users excluding current user (don't filter by online status for now)
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
    // Removed .eq('is_online', true) to show all users temporarily

    console.log('=== RELAXED USERS QUERY (ALL USERS) ===');
    console.log('Query result - users count:', users?.length || 0);
    console.log('Query error:', error);

    if (error) {
      console.error('Error fetching nearby users:', error);
      return [];
    }

    if (!users || users.length === 0) {
      console.log('❌ No users found in database (excluding current user and null locations)');
      return [];
    }

    console.log('✅ Found users from database:', users.map(u => ({
      id: u.id,
      name: u.name,
      location: u.location,
      isOnline: u.is_online,
      lastSeen: u.last_seen,
      interests: u.interests,
      todayActivities: u.today_activities
    })));

    // Process users with improved location parsing
    const usersWithDistance = users.map(user => {
      if (!user.location) {
        console.log(`User ${user.name} has no location, skipping`);
        return null;
      }

      let userLat: number | null = null;
      let userLng: number | null = null;

      // Try multiple ways to extract coordinates
      if (typeof user.location === 'object' && user.location !== null) {
        const location = user.location as any;
        
        // Try different possible property names
        userLat = location.lat || location.x || location.latitude;
        userLng = location.lng || location.y || location.longitude;
        
        console.log(`User ${user.name} location object:`, location);
        console.log(`Extracted coordinates: lat=${userLat}, lng=${userLng}`);
      }

      // If we still don't have coordinates, try parsing as string
      if ((userLat === null || userLng === null) && typeof user.location === 'string') {
        try {
          const parsed = JSON.parse(user.location);
          userLat = parsed.lat || parsed.x || parsed.latitude;
          userLng = parsed.lng || parsed.y || parsed.longitude;
          console.log(`User ${user.name} parsed from string:`, parsed);
        } catch (e) {
          console.log(`Failed to parse location string for ${user.name}:`, user.location);
        }
      }

      // Final validation
      if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
        console.log(`User ${user.name} - Final coordinates invalid: lat=${userLat}, lng=${userLng}`);
        return null; // Don't show users with invalid locations
      }

      // Calculate distance using Haversine formula
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        userLat,
        userLng
      );

      console.log(`User ${user.name} is ${distance.toFixed(2)}km away`);

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

      // RELAXED: Don't strictly require online status for now
      const isOnline = Boolean(user.is_online);

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
        isOnline: isOnline,
        is_over_18: user.is_over_18,
        active_priorities: activePriorities,
        preferredHangoutDuration: user.preferred_hangout_duration ? parseInt(user.preferred_hangout_duration) : null,
        todayActivities: user.today_activities || [],
        blockedUsers: user.blocked_users || [],
        blocked_users: user.blocked_users || []
      };

      console.log(`✅ Processed user ${user.name}: distance=${distance.toFixed(2)}km, coordinates=(${userLat}, ${userLng}), isOnline=${isOnline}`);
      return appUser;
    })
    .filter((user): user is AppUser => user !== null)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    console.log(`🎯 FINAL RESULT: ${usersWithDistance.length} users processed and ready to display (relaxed filtering)`);
    console.log('Final users:', usersWithDistance.map(u => ({ name: u.name, distance: u.distance, isOnline: u.isOnline })));
    
    return usersWithDistance;
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
