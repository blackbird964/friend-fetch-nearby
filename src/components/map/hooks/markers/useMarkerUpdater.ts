
import { useEffect } from 'react';
import { AppUser } from '@/context/types';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { calculateDistance } from '@/utils/locationUtils';
import { getDisplayLocation, shouldObfuscateLocation } from '@/utils/privacyUtils';

export const useMarkerUpdater = (
  vectorSource: React.MutableRefObject<VectorSource | null>,
  nearbyUsers: AppUser[],
  currentUser: AppUser | null,
  mapLoaded: boolean,
  radiusInKm: number
) => {
  // Update map markers when user data changes
  useEffect(() => {
    if (!mapLoaded || !vectorSource.current) return;

    // Clear existing user markers
    const features = vectorSource.current.getFeatures();
    features.forEach(feature => {
      if (!feature.get('isCurrentUser')) {
        vectorSource.current?.removeFeature(feature);
      }
    });

    // Add markers for nearby users with their locations, but only if they're within the radius
    nearbyUsers.forEach(user => {
      if (user.location && user.location.lat && user.location.lng) {
        // Skip users outside the radius if we have user location
        if (currentUser?.location) {
          const distance = calculateDistance(
            currentUser.location.lat,
            currentUser.location.lng,
            user.location.lat,
            user.location.lng
          );
          
          // If user is outside the radius, don't add them to the map
          if (distance > radiusInKm) {
            return;
          }
        }
        
        // Get display location based on privacy settings
        // For other users, we need to respect their privacy settings
        const isPrivacyEnabled = shouldObfuscateLocation(user);
        const displayLocation = getDisplayLocation(user);
        
        if (!displayLocation) return;
        
        const userFeature = new Feature({
          geometry: new Point(fromLonLat([displayLocation.lng, displayLocation.lat])),
          userId: user.id,
          name: user.name || `User-${user.id.substring(0, 4)}`,
          isPrivacyEnabled: isPrivacyEnabled
        });
        vectorSource.current?.addFeature(userFeature);
      }
    });

    // Add current user marker with the updated location
    if (currentUser?.location?.lat && currentUser?.location?.lng) {
      // Remove any existing current user marker
      const existingUserFeatures = vectorSource.current.getFeatures().filter(feature => feature.get('isCurrentUser'));
      existingUserFeatures.forEach(feature => {
        vectorSource.current?.removeFeature(feature);
      });
      
      // Check if current user has privacy enabled
      const isCurrentUserPrivacyEnabled = shouldObfuscateLocation(currentUser);

      // For the current user's own view, always show actual location (not privacy-offset location)
      // This ensures the user always sees their true position on their own device
      const userFeature = new Feature({
        geometry: new Point(fromLonLat([currentUser.location.lng, currentUser.location.lat])),
        isCurrentUser: true,
        name: 'You',
        isPrivacyEnabled: isCurrentUserPrivacyEnabled
      });
      vectorSource.current.addFeature(userFeature);
    }
  }, [nearbyUsers, mapLoaded, currentUser?.location, vectorSource, radiusInKm, 
       currentUser?.locationSettings?.hideExactLocation, currentUser?.location_settings?.hide_exact_location]); 
};
