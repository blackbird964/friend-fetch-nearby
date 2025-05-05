
import { AppUser } from '@/context/types';
import { calculateDistance } from '@/utils/locationUtils';

/**
 * Process nearby users with distance calculation
 */
export const processNearbyUsers = (
  otherUsers: AppUser[],
  userLocation: { lat: number, lng: number }
): AppUser[] => {
  return otherUsers.map(user => {
    const userWithDistance = { ...user };
    
    if (!user.location || !user.location.lat || !user.location.lng) {
      userWithDistance.distance = Infinity;
      return userWithDistance;
    }
    
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      user.location.lat,
      user.location.lng
    );
    
    userWithDistance.distance = distance;
    return userWithDistance;
  });
};

/**
 * Filter users by maximum distance in kilometers
 */
export const filterUsersByDistance = (users: AppUser[], maxDistanceKm: number): AppUser[] => {
  return users.filter(user => {
    // Only filter users that have location data
    if (!user.distance || user.distance === Infinity) return true;
    return user.distance <= maxDistanceKm;
  });
};
