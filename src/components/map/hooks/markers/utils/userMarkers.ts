
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { AppUser } from '@/context/types';
import { getDisplayLocation, shouldObfuscateLocation } from '@/utils/privacyUtils';
import { isUserWithinRadius } from './markerUtils';
import { getBusinessProfile } from '@/lib/supabase/businessProfiles';

/**
 * Add markers for nearby users to the map
 */
export const addNearbyUserMarkers = async (
  onlineUsers: AppUser[], 
  currentUser: AppUser | null,
  radiusInKm: number,
  vectorSource: VectorSource
) => {
  if (!vectorSource) return;
  
  const features: Feature[] = [];
  const processedUserIds = new Set<string>();
  
  for (const user of onlineUsers) {
    // Skip the current user - we'll add them separately
    if (currentUser && user.id === currentUser.id) {
      continue;
    }
    
    // Skip already processed users to avoid duplicates
    if (processedUserIds.has(user.id)) {
      continue;
    }
    
    if (!user.location || !user.location.lat || !user.location.lng) continue;
    
    // Skip users outside the radius if we have user location
    if (!isUserWithinRadius(user, currentUser, radiusInKm)) {
      continue;
    }
    
    // Check if user has privacy enabled
    const isPrivacyEnabled = shouldObfuscateLocation(user);
    
    // Get the appropriate display location
    const displayLocation = isPrivacyEnabled ? getDisplayLocation(user) : user.location;
    
    if (!displayLocation) continue;
    
    try {
      // Check if this user is a business - this is critical for star icons
      const businessProfile = await getBusinessProfile(user.id);
      const isBusiness = !!businessProfile;
      
      console.log(`User ${user.name} is business:`, isBusiness, businessProfile?.business_name);
      
      // Create the standard marker with business info
      const userFeature = new Feature({
        geometry: new Point(fromLonLat([displayLocation.lng, displayLocation.lat])),
        userId: user.id,
        name: isBusiness ? businessProfile?.business_name || user.name : (user.name || `User-${user.id.substring(0, 4)}`),
        isPrivacyEnabled: isPrivacyEnabled,
        isBusiness: isBusiness, // This is crucial for star icon rendering
        businessName: businessProfile?.business_name,
        businessDescription: businessProfile?.description
      });
      
      features.push(userFeature);
      processedUserIds.add(user.id);
      
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
  }
  
  // Add all features in a single batch for better performance
  if (features.length > 0) {
    console.log(`Adding ${features.length} user markers to map`);
    vectorSource.addFeatures(features);
  }
};

/**
 * Add marker for the current user to the map
 */
export const addCurrentUserMarker = async (currentUser: AppUser | null, vectorSource: VectorSource) => {
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
    
    // Check if current user is a business
    const businessProfile = await getBusinessProfile(currentUser.id);
    const isBusiness = !!businessProfile;
    
    console.log(`Current user ${currentUser.name} is business:`, isBusiness, businessProfile?.business_name);
    
    // Only add marker if privacy mode is disabled
    const userFeature = new Feature({
      geometry: new Point(fromLonLat([currentUser.location.lng, currentUser.location.lat])),
      isCurrentUser: true,
      userId: currentUser.id,
      name: isBusiness ? businessProfile?.business_name || 'You' : 'You',
      isPrivacyEnabled: false,
      isBusiness: isBusiness, // This ensures current user business gets star icon too
      businessName: businessProfile?.business_name,
      businessDescription: businessProfile?.description
    });
    
    vectorSource.addFeature(userFeature);
  } catch (error) {
    console.error("Error adding current user to map:", error);
  }
};
