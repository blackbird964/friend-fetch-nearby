
import { AppUser } from '@/context/types';
import { calculateDistance } from '@/utils/locationUtils';

/**
 * Process nearby users with distance calculation
 */
export const processNearbyUsers = (
  otherUsers: AppUser[],
  userLocation: { lat: number, lng: number }
): AppUser[] => {
  console.log(`Processing ${otherUsers.length} users against location:`, userLocation);
  
  return otherUsers.map(user => {
    const userWithDistance = { ...user };
    
    if (!user.location || !user.location.lat || !user.location.lng) {
      console.log(`User ${user.id} has no location data, setting distance to Infinity`);
      userWithDistance.distance = Infinity;
      return userWithDistance;
    }
    
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      user.location.lat,
      user.location.lng
    );
    
    console.log(`User ${user.id} is ${distance.toFixed(2)}km away`);
    userWithDistance.distance = distance;
    return userWithDistance;
  });
};

/**
 * Filter users by maximum distance in kilometers
 */
export const filterUsersByDistance = (users: AppUser[], maxDistanceKm: number): AppUser[] => {
  console.log(`Filtering ${users.length} users with max distance of ${maxDistanceKm}km`);
  
  const filteredUsers = users.filter(user => {
    // Skip users with no distance information (they'll be included by default)
    if (user.distance === undefined || user.distance === Infinity) {
      console.log(`User ${user.id} has no distance info, including by default`);
      return true;
    }
    
    const isInRange = user.distance <= maxDistanceKm;
    console.log(`User ${user.id} is ${user.distance.toFixed(2)}km away, in range: ${isInRange}`);
    return isInRange;
  });
  
  console.log(`Found ${filteredUsers.length} users within ${maxDistanceKm}km radius`);
  return filteredUsers;
};
