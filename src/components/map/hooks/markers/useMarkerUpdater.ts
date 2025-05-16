
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
  radiusInKm: number,
  isTracking: boolean = true
) => {
  // Update map markers when user data changes
  useEffect(() => {
    if (!mapLoaded || !vectorSource.current) {
      console.log("Map not loaded or vector source not available");
      return;
    }

    console.log("Updating markers with nearby users:", nearbyUsers.length);
    console.log("Current user:", currentUser?.id);
    console.log("Radius in km:", radiusInKm);
    console.log("Tracking enabled:", isTracking);
    
    // Clear existing user markers (but keep circle markers)
    const features = vectorSource.current.getFeatures();
    features.forEach(feature => {
      const isCircle = feature.get('isCircle');
      const isUserMarker = feature.get('isCurrentUser') || feature.get('userId');
      const isHeatMap = feature.get('isHeatMap');
      
      if ((!isCircle && isUserMarker) || isHeatMap) {
        vectorSource.current?.removeFeature(feature);
      }
    });
    
    // Filter to only show online users that aren't blocked
    const onlineUsers = nearbyUsers
      .filter(user => user.isOnline === true)
      .filter(user => {
        // Filter out users that the current user has blocked
        if (currentUser?.blockedUsers?.includes(user.id)) {
          console.log(`User ${user.id} is blocked, not showing on map`);
          return false;
        }
        return true;
      });
    
    console.log(`Found ${onlineUsers.length} online users out of ${nearbyUsers.length} nearby users`);
    
    // Add markers for nearby ONLINE users with their locations
    onlineUsers.forEach(user => {
      if (user.location && user.location.lat && user.location.lng) {
        console.log(`Processing online user ${user.id} with location:`, user.location);
        
        // Skip users outside the radius if we have user location
        if (currentUser?.location) {
          const distance = calculateDistance(
            currentUser.location.lat,
            currentUser.location.lng,
            user.location.lat,
            user.location.lng
          );
          
          if (distance > radiusInKm) {
            console.log(`User ${user.id} is outside radius (${distance.toFixed(2)}km > ${radiusInKm}km), not showing`);
            return;
          }
          
          console.log(`User ${user.id} is within radius (${distance.toFixed(2)}km <= ${radiusInKm}km)`);
        }
        
        // Check if user has privacy enabled
        const isPrivacyEnabled = shouldObfuscateLocation(user);
        console.log(`User ${user.id} privacy enabled:`, isPrivacyEnabled);
        
        // Get the appropriate display location
        // For privacy users, we'll use an obfuscated location
        const displayLocation = isPrivacyEnabled ? getDisplayLocation(user) : user.location;
        
        if (!displayLocation) return;
        
        console.log(`Adding online user ${user.id} to map (privacy: ${isPrivacyEnabled ? 'enabled' : 'disabled'})`);
        
        try {
          // Create the standard marker
          const userFeature = new Feature({
            geometry: new Point(fromLonLat([displayLocation.lng, displayLocation.lat])),
            userId: user.id,
            name: user.name || `User-${user.id.substring(0, 4)}`,
            isPrivacyEnabled: isPrivacyEnabled
          });
          
          vectorSource.current?.addFeature(userFeature);
          
          // If privacy enabled, also add a heatmap-style marker (larger, semi-transparent)
          if (isPrivacyEnabled) {
            const heatMapFeature = new Feature({
              geometry: new Point(fromLonLat([displayLocation.lng, displayLocation.lat])),
              userId: user.id,
              isHeatMap: true,
            });
            
            vectorSource.current?.addFeature(heatMapFeature);
            console.log(`Added heatmap for user ${user.id} with privacy enabled`);
          }
        } catch (error) {
          console.error(`Error adding user ${user.id} to map:`, error);
        }
      } else {
        console.log(`User ${user.id} has no location data`);
      }
    });

    // Add current user marker with the updated location, but only if tracking is enabled
    if (currentUser?.location?.lat && currentUser?.location?.lng && isTracking) {
      console.log(`Adding current user to map at ${currentUser.location.lat},${currentUser.location.lng}`);
      
      try {
        // Check if current user has privacy enabled
        const isCurrentUserPrivacyEnabled = shouldObfuscateLocation(currentUser);
        console.log("Current user privacy enabled:", isCurrentUserPrivacyEnabled);
        
        // For the current user's own view, always show actual location (not privacy-offset location)
        const userFeature = new Feature({
          geometry: new Point(fromLonLat([currentUser.location.lng, currentUser.location.lat])),
          isCurrentUser: true,
          userId: currentUser.id,
          name: 'You',
          isPrivacyEnabled: isCurrentUserPrivacyEnabled
        });
        
        vectorSource.current?.addFeature(userFeature);
        
        // If privacy enabled for current user, add a heatmap for them too
        if (isCurrentUserPrivacyEnabled) {
          const heatMapFeature = new Feature({
            geometry: new Point(fromLonLat([currentUser.location.lng, currentUser.location.lat])),
            userId: currentUser.id,
            isCurrentUser: true,
            isHeatMap: true,
          });
          
          vectorSource.current?.addFeature(heatMapFeature);
          console.log(`Added heatmap for current user with privacy enabled`);
        }
        
        // Dispatch an event to notify that user's location has been updated on the map
        window.dispatchEvent(new CustomEvent('user-marker-updated'));
      } catch (error) {
        console.error("Error adding current user to map:", error);
      }
    } else if (!isTracking) {
      console.log("Tracking disabled, not adding current user marker");
    } else {
      console.log("Current user has no location");
    }
  }, [nearbyUsers, mapLoaded, currentUser?.location, vectorSource, radiusInKm, 
      currentUser?.locationSettings?.hideExactLocation, currentUser?.blockedUsers, isTracking]);

  // Also listen for manual location updates
  useEffect(() => {
    const handleLocationChange = () => {
      console.log("Location change event detected - will update markers");
      // The next render cycle will update the markers
    };
    
    window.addEventListener('user-location-changed', handleLocationChange);
    
    return () => {
      window.removeEventListener('user-location-changed', handleLocationChange);
    };
  }, []);
};
