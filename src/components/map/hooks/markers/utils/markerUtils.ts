
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { AppUser } from '@/context/types';
import { calculateDistance } from '@/utils/locationUtils';
import { getDisplayLocation, shouldObfuscateLocation } from '@/utils/privacyUtils';

/**
 * Clear existing user markers from the vector source
 */
export const clearExistingUserMarkers = (vectorSource: VectorSource) => {
  if (!vectorSource) return;
  
  // Use batch operation for better performance
  const featuresToRemove: Feature[] = [];
  
  vectorSource.getFeatures().forEach(feature => {
    const isCircle = feature.get('isCircle');
    const isUserMarker = feature.get('isCurrentUser') || feature.get('userId');
    const isHeatMap = feature.get('isHeatMap');
    const circleType = feature.get('circleType');
    
    // Don't remove privacy circles, only user markers and heatmaps
    if ((!isCircle && isUserMarker) || isHeatMap || (isCircle && circleType !== 'privacy')) {
      featuresToRemove.push(feature);
    }
  });
  
  // Remove all features in a single batch
  featuresToRemove.forEach(feature => {
    vectorSource.removeFeature(feature);
  });
};

/**
 * Filter users to display only online and unblocked users
 */
export const filterOnlineAndUnblockedUsers = (nearbyUsers: AppUser[], currentUser: AppUser | null): AppUser[] => {
  return nearbyUsers
    .filter(user => user.isOnline === true)
    .filter(user => {
      // Filter out users that the current user has blocked
      if (currentUser?.blockedUsers?.includes(user.id)) {
        return false;
      }
      return true;
    });
};

/**
 * Check if user is within the specified radius
 */
export const isUserWithinRadius = (
  user: AppUser, 
  currentUser: AppUser | null,
  radiusInKm: number
): boolean => {
  // If no current user or current user has no location, consider all users in radius
  if (!currentUser?.location) return true;
  
  // If user has no location, they're not in any radius
  if (!user.location || !user.location.lat || !user.location.lng) return false;
  
  const distance = calculateDistance(
    currentUser.location.lat,
    currentUser.location.lng,
    user.location.lat,
    user.location.lng
  );
  
  return distance <= radiusInKm;
};
