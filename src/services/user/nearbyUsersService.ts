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

    // Fetch ALL users first to see what's in the database
    const { data: allUsers, error: allUsersError } = await supabase
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
      `);

    console.log('=== ALL USERS IN DATABASE ===');
    console.log('Total users in database:', allUsers?.length || 0);
    console.log('All users error:', allUsersError);
    if (allUsers) {
      console.log('All users sample:', allUsers.map(u => ({
        id: u.id,
        name: u.name,
        location: u.location,
        isOnline: u.is_online,
        lastSeen: u.last_seen
      })));
    }

    // Now fetch users excluding current user
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

    console.log('=== FILTERED USERS QUERY ===');
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

    // For debugging, let's temporarily return ALL users without distance filtering
    const usersWithDistance = users.map(user => {
      if (!user.location) {
        console.log(`User ${user.name} has no location, skipping`);
        return null;
      }

      const userLat = (user.location as any).x || (user.location as any).lat;
      const userLng = (user.location as any).y || (user.location as any).lng;

      if (!userLat || !userLng) {
        console.log(`User ${user.name} has invalid location coordinates:`, user.location);
        return null;
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

      // TEMPORARILY: Mark ALL users as online for debugging
      const isConsideredOnline = true; // Force all users to show as online

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
        isOnline: isConsideredOnline, // FORCE TRUE FOR DEBUGGING
        is_over_18: user.is_over_18,
        active_priorities: activePriorities,
        preferredHangoutDuration: user.preferred_hangout_duration ? parseInt(user.preferred_hangout_duration) : null,
        todayActivities: user.today_activities || [],
        blockedUsers: user.blocked_users || [],
        blocked_users: user.blocked_users || []
      };

      console.log(`✅ Processed user ${user.name}: distance=${distance.toFixed(2)}km, forcedOnline=true`);
      return appUser;
    })
    .filter((user): user is AppUser => user !== null)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    console.log(`🎯 FINAL RESULT: ${usersWithDistance.length} users processed and ready to display`);
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
