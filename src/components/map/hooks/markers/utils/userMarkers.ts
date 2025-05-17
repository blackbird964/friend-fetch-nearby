
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { AppUser } from '@/context/types';
import { getDisplayLocation, shouldObfuscateLocation } from '@/utils/privacyUtils';
import { isUserWithinRadius } from './markerUtils';

/**
 * Add markers for nearby users to the map
 */
export const addNearbyUserMarkers = (
  onlineUsers: AppUser[], 
  currentUser: AppUser | null,
  radiusInKm: number,
  vectorSource: VectorSource
) => {
  if (!vectorSource) return;
  
  const features: Feature[] = [];
  
  onlineUsers.forEach(user => {
    if (!user.location || !user.location.lat || !user.location.lng) return;
    
    // Skip users outside the radius if we have user location
    if (!isUserWithinRadius(user, currentUser, radiusInKm)) {
      return;
    }
    
    // Check if user has privacy enabled
    const isPrivacyEnabled = shouldObfuscateLocation(user);
    
    // Get the appropriate display location
    const displayLocation = isPrivacyEnabled ? getDisplayLocation(user) : user.location;
    
    if (!displayLocation) return;
    
    try {
      // Create the standard marker
      const userFeature = new Feature({
        geometry: new Point(fromLonLat([displayLocation.lng, displayLocation.lat])),
        userId: user.id,
        name: user.name || `User-${user.id.substring(0, 4)}`,
        isPrivacyEnabled: isPrivacyEnabled
      });
      
      features.push(userFeature);
      
      // If privacy enabled, also add a heatmap-style marker
      if (isPrivacyEnabled) {
        const heatMapFeature = new Feature({
          geometry: new Point(fromLonLat([displayLocation.lng, displayLocation.lat])),
          userId: user.id,
          isHeatMap: true,
        });
        
        features.push(heatMapFeature);
      }
    } catch (error) {
      console.error(`Error adding user ${user.id} to map:`, error);
    }
  });
  
  // Add all features in a single batch for better performance
  if (features.length > 0) {
    vectorSource.addFeatures(features);
  }
};

/**
 * Add marker for the current user to the map
 */
export const addCurrentUserMarker = (currentUser: AppUser | null, vectorSource: VectorSource) => {
  if (!currentUser?.location?.lat || !currentUser?.location?.lng || !vectorSource) return;
  
  try {
    // Check if current user has privacy enabled
    const isCurrentUserPrivacyEnabled = shouldObfuscateLocation(currentUser);
    
    // Skip adding the marker if privacy mode is enabled - we'll show privacy circle instead
    if (isCurrentUserPrivacyEnabled) {
      return;
    }
    
    // Only add marker if privacy mode is disabled
    const userFeature = new Feature({
      geometry: new Point(fromLonLat([currentUser.location.lng, currentUser.location.lat])),
      isCurrentUser: true,
      userId: currentUser.id,
      name: 'You',
      isPrivacyEnabled: false
    });
    
    vectorSource.addFeature(userFeature);
  } catch (error) {
    console.error("Error adding current user to map:", error);
  }
};
