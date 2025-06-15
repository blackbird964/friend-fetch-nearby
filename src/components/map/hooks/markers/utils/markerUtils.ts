
import { AppUser } from '@/context/types';
import { calculateDistance } from '@/utils/locationUtils';

/**
 * Check if a user is within the specified radius of the current user
 */
export const isUserWithinRadius = (
  user: AppUser,
  currentUser: AppUser | null,
  radiusInKm: number
): boolean => {
  if (!currentUser?.location || !user.location) return false;
  
  const distance = calculateDistance(
    currentUser.location.lat,
    currentUser.location.lng,
    user.location.lat,
    user.location.lng
  );
  
  return distance <= radiusInKm;
};

/**
 * Filter users to only show online and unblocked users
 * CRITICAL: Only show users who are actually online (logged into platform)
 */
export const filterOnlineAndUnblockedUsers = (
  users: AppUser[],
  currentUser: AppUser | null
): AppUser[] => {
  if (!currentUser) return [];
  
  return users.filter(user => {
    // Don't show the current user
    if (user.id === currentUser.id) return false;
    
    // CRITICAL: Only show users who are actually online (logged into platform)
    if (!user.isOnline) {
      console.log(`Filtering out offline user: ${user.name} (isOnline: ${user.isOnline})`);
      return false;
    }
    
    // Don't show blocked users
    if (currentUser.blockedUsers?.includes(user.id)) return false;
    
    // Don't show users who have blocked the current user
    if (user.blockedUsers?.includes(currentUser.id)) return false;
    
    return true;
  });
};

/**
 * Get distance between two locations in kilometers
 */
export const getDistanceBetweenUsers = (
  user1: AppUser,
  user2: AppUser
): number => {
  if (!user1.location || !user2.location) return Infinity;
  
  return calculateDistance(
    user1.location.lat,
    user1.location.lng,
    user2.location.lat,
    user2.location.lng
  );
};
