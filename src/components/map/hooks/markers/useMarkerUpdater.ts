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
    if (!mapLoaded || !vectorSource.current) {
      console.log("Map not loaded or vector source not available");
      return;
    }

    console.log("Updating markers with nearby users:", nearbyUsers.length);
    console.log("Current user:", currentUser);
    console.log("Radius in km:", radiusInKm);
    
    // Clear existing user markers (but keep current user and circle markers)
    const features = vectorSource.current.getFeatures();
    features.forEach(feature => {
      const isCurrentUser = feature.get('isCurrentUser');
      const isCircle = feature.get('isCircle');
      
      if (!isCurrentUser && !isCircle) {
        vectorSource.current?.removeFeature(feature);
      }
    });
    
    // Add markers for nearby users with their locations
    nearbyUsers.forEach(user => {
      if (user.location && user.location.lat && user.location.lng) {
        console.log(`Processing user ${user.id} with location:`, user.location);
        
        // Skip users outside the radius if we have user location
        if (currentUser?.location) {
          const distance = calculateDistance(
            currentUser.location.lat,
            currentUser.location.lng,
            user.location.lat,
            user.location.lng
          );
          
          if (distance > radiusInKm) {
            console.log(`User ${user.id} is outside radius (${distance.toFixed(2)}km), not showing`);
            return;
          }
          
          console.log(`User ${user.id} is within radius (${distance.toFixed(2)}km)`);
        }
        
        // Get display location based on privacy settings
        const isPrivacyEnabled = shouldObfuscateLocation(user);
        const displayLocation = isPrivacyEnabled 
          ? getDisplayLocation(user) 
          : user.location;
        
        if (!displayLocation) {
          console.log(`User ${user.id} has no valid location to display`);
          return;
        }
        
        console.log(`Adding user ${user.id} to map at ${displayLocation.lat},${displayLocation.lng}`);
        
        try {
          const userFeature = new Feature({
            geometry: new Point(fromLonLat([displayLocation.lng, displayLocation.lat])),
            userId: user.id,
            name: user.name || `User-${user.id.substring(0, 4)}`,
            isPrivacyEnabled: isPrivacyEnabled
          });
          
          vectorSource.current?.addFeature(userFeature);
        } catch (error) {
          console.error(`Error adding user ${user.id} to map:`, error);
        }
      } else {
        console.log(`User ${user.id} has no location data`);
      }
    });

    // Remove any existing current user marker
    if (vectorSource.current) {
      const existingUserFeatures = vectorSource.current.getFeatures().filter(feature => 
        feature.get('isCurrentUser') === true
      );
      existingUserFeatures.forEach(feature => {
        vectorSource.current?.removeFeature(feature);
      });
    }

    // Add current user marker with the updated location
    if (currentUser?.location?.lat && currentUser?.location?.lng) {
      console.log(`Adding current user to map at ${currentUser.location.lat},${currentUser.location.lng}`);
      
      try {
        // Check if current user has privacy enabled
        const isCurrentUserPrivacyEnabled = shouldObfuscateLocation(currentUser);
        
        // For the current user's own view, always show actual location (not privacy-offset location)
        const userFeature = new Feature({
          geometry: new Point(fromLonLat([currentUser.location.lng, currentUser.location.lat])),
          isCurrentUser: true,
          name: 'You',
          isPrivacyEnabled: isCurrentUserPrivacyEnabled
        });
        
        vectorSource.current?.addFeature(userFeature);
      } catch (error) {
        console.error("Error adding current user to map:", error);
      }
    } else {
      console.log("Current user has no location");
    }
  }, [nearbyUsers, mapLoaded, currentUser?.location, vectorSource, radiusInKm, 
      currentUser?.locationSettings?.hideExactLocation, currentUser?.location_settings?.hide_exact_location]);
};
