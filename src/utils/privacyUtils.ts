
import { Location } from '@/context/types';

/**
 * Generates a random offset within a 50m radius for privacy purposes
 * 
 * @param originalLocation The original user location
 * @returns A new location approximately 50m away from the original
 */
export const getPrivacyOffset = (originalLocation: Location): Location => {
  if (!originalLocation || !originalLocation.lat || !originalLocation.lng) return originalLocation;
  
  // Convert meters to degrees (approximate)
  // 1 degree of latitude = ~111km, so 50m = ~0.00045 degrees
  // 1 degree of longitude varies, but at the equator it's ~111km, so 50m = ~0.00045 degrees
  const metersToDegreesLat = 0.00045;
  const metersToDegreesLng = 0.00045;
  
  // Generate random angle and distance (up to 50m)
  const angle = Math.random() * 2 * Math.PI; // Random angle in radians
  const distance = Math.random() * 50; // Random distance up to 50m
  
  // Calculate distance in lat/lng
  const distanceInDegreesLat = (distance / 50) * metersToDegreesLat;
  const distanceInDegreesLng = (distance / 50) * metersToDegreesLng;
  
  // Calculate offset based on angle
  const latOffset = Math.sin(angle) * distanceInDegreesLat;
  const lngOffset = Math.cos(angle) * distanceInDegreesLng;
  
  // Apply offset
  return {
    lat: originalLocation.lat + latOffset,
    lng: originalLocation.lng + lngOffset
  };
};

/**
 * Check if a location should be obfuscated based on user settings
 */
export const shouldObfuscateLocation = (user: any): boolean => {
  if (!user) return false;
  
  // Check both camelCase and snake_case versions of the setting
  const privacyEnabled = !!(
    (user.locationSettings?.hideExactLocation) || 
    (user.location_settings?.hide_exact_location)
  );
  
  return privacyEnabled;
};

/**
 * Get the appropriate location for display based on privacy settings
 */
export const getDisplayLocation = (user: any): Location | undefined => {
  if (!user || !user.location) return undefined;
  
  if (shouldObfuscateLocation(user)) {
    // Use a consistent offset for a user to prevent flickering/jumping
    // By using the user ID as part of the seed for randomization
    const userId = user.id || '';
    const seed = userId.length > 0 ? userId.charCodeAt(0) / 255 : Math.random();
    
    // Generate deterministic angle based on user ID
    const angle = seed * 2 * Math.PI;
    
    // Fixed distance (30-50m) for consistency
    const distance = 30 + (seed * 20); // Between 30-50m
    
    // Convert meters to degrees (approximate)
    const metersToDegreesLat = 0.00045;
    const metersToDegreesLng = 0.00045;
    
    // Calculate distance in lat/lng
    const distanceInDegreesLat = (distance / 50) * metersToDegreesLat;
    const distanceInDegreesLng = (distance / 50) * metersToDegreesLng;
    
    // Calculate offset based on angle
    const latOffset = Math.sin(angle) * distanceInDegreesLat;
    const lngOffset = Math.cos(angle) * distanceInDegreesLng;
    
    // Apply offset
    return {
      lat: user.location.lat + latOffset,
      lng: user.location.lng + lngOffset
    };
  }
  
  return user.location;
};

/**
 * Get radius in meters for privacy circle
 */
export const getPrivacyCircleRadius = (): number => {
  // 3km (3000m) radius for privacy circle - changed from 5km to 3km as requested
  return 3000;
};

/**
 * Get animation parameters for privacy circle
 */
export const getPrivacyCircleAnimation = () => {
  return {
    pulseDuration: 3000, // Pulse animation duration in ms
    pulseMinOpacity: 0.2, // Minimum opacity during pulse animation
    pulseMaxOpacity: 0.4  // Maximum opacity during pulse animation
  };
};
