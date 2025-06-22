
import { AppUser } from '@/context/types';
import { calculateDistance } from '@/utils/locationUtils';
import { Vector as VectorSource } from 'ol/source';

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
 * Filter users to only show valid and unblocked users
 * RELAXED: Show all users while presence system establishes itself
 */
export const filterOnlineAndUnblockedUsers = (
  users: AppUser[],
  currentUser: AppUser | null
): AppUser[] => {
  if (!currentUser) return [];
  
  return users.filter(user => {
    // Don't show the current user
    if (user.id === currentUser.id) return false;
    
    // RELAXED: Show all valid users for now while presence system establishes itself
    const hasValidId = user.id && !String(user.id).includes('test') && !String(user.id).includes('mock');
    if (!hasValidId) {
      console.log(`Filtering out user: ${user.name} - invalid ID`);
      return false;
    }
    
    // Don't show blocked users
    if (currentUser.blockedUsers?.includes(user.id)) return false;
    
    // Don't show users who have blocked the current user
    if (user.blockedUsers?.includes(currentUser.id)) return false;
    
    console.log(`✅ User ${user.name} passes all filters - showing (relaxed filtering)`);
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

/**
 * Clear existing user markers from the vector source
 * This removes user markers but keeps circle/radius markers
 */
export const clearExistingUserMarkers = (source: VectorSource) => {
  if (!source) return;
  
  const features = source.getFeatures();
  const markersToRemove = features.filter(feature => {
    const isUserMarker = feature.get('userId') || feature.get('isCurrentUser') || feature.get('isCluster');
    const isNotCircle = !feature.get('isCircle');
    return isUserMarker && isNotCircle;
  });
  
  // Remove in batch for better performance
  markersToRemove.forEach(feature => source.removeFeature(feature));
};
