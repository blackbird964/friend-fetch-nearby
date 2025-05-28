
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
  const processedUserIds = new Set<string>();
  
  onlineUsers.forEach(user => {
    // Skip the current user - we'll add them separately
    if (currentUser && user.id === currentUser.id) {
      return;
    }
    
    // Skip already processed users to avoid duplicates
    if (processedUserIds.has(user.id)) {
      return;
    }
    
    if (!user.location || !user.location.lat || !user.location.lng) return;
    
    // Skip users outside the radius if we have user location
    if (!isUserWithinRadius(user, currentUser, radiusInKm)) {
      return;
    }
    
    // Check if user has privacy enabled (only for non-business users)
    const isPrivacyEnabled = !user.isBusiness && shouldObfuscateLocation(user);
    
    // Get the appropriate display location
    const displayLocation = isPrivacyEnabled ? getDisplayLocation(user) : user.location;
    
    if (!displayLocation) return;
    
    try {
      // Create the standard marker
      const userFeature = new Feature({
        geometry: new Point(fromLonLat([displayLocation.lng, displayLocation.lat])),
        userId: user.id,
        name: user.name || `User-${user.id.substring(0, 4)}`,
        isPrivacyEnabled: isPrivacyEnabled,
        isBusiness: user.isBusiness || false,
        businessType: user.businessType
      });
      
      features.push(userFeature);
      processedUserIds.add(user.id);
      
      // If privacy enabled (and not a business), also add a heatmap-style marker
      if (isPrivacyEnabled && !user.isBusiness) {
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
    
    // Look for existing current user markers and remove them to avoid duplicates
    const existingFeatures = vectorSource.getFeatures();
    existingFeatures.forEach(feature => {
      if (feature.get('isCurrentUser')) {
        vectorSource.removeFeature(feature);
      }
    });
    
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
