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
      return;
    }

    // Clear existing user markers (but keep circle markers)
    clearExistingUserMarkers(vectorSource.current);
    
    // If tracking is disabled, don't show any users at all
    if (!isTracking) {
      return;
    }
    
    // Filter to only show online users that aren't blocked
    const onlineUsers = filterOnlineAndUnblockedUsers(nearbyUsers, currentUser);
    
    // Add markers for nearby ONLINE users with their locations
    addNearbyUserMarkers(onlineUsers, currentUser, radiusInKm, vectorSource.current);

    // Only add current user marker if:
    // 1. Tracking is enabled
    // 2. We have a current user
    // 3. Privacy mode is disabled
    const isPrivacyEnabled = currentUser ? shouldObfuscateLocation(currentUser) : false;
    
    if (isTracking && currentUser && !isPrivacyEnabled) {
      addCurrentUserMarker(currentUser, vectorSource.current);
    }
  }, [nearbyUsers, mapLoaded, currentUser?.location, vectorSource, radiusInKm, 
      currentUser?.locationSettings?.hideExactLocation, currentUser?.location_settings?.hide_exact_location, 
      currentUser?.blockedUsers, isTracking]);

  // Also listen for manual location updates
  useEffect(() => {
    const handleLocationChange = () => {
      // The next render cycle will update the markers
    };
    
    // Listen for privacy mode changes
    const handlePrivacyModeChange = (event: CustomEvent) => {
      if (event.detail && event.detail.isPrivacyEnabled !== undefined) {
        // If privacy mode changed, update markers
        if (vectorSource.current && currentUser) {
          // Clear current user marker when privacy is enabled
          if (event.detail.isPrivacyEnabled) {
            const features = vectorSource.current.getFeatures();
            features.forEach(feature => {
              if (feature.get('isCurrentUser')) {
                vectorSource.current?.removeFeature(feature);
              }
            });
          } else {
            // Re-add current user marker when privacy is disabled
            if (isTracking && currentUser.location) {
              addCurrentUserMarker(currentUser, vectorSource.current);
            }
          }
        }
      }
    };
    
    window.addEventListener('user-location-changed', handleLocationChange);
    window.addEventListener('privacy-mode-changed', handlePrivacyModeChange as EventListener);
    
    return () => {
      window.removeEventListener('user-location-changed', handleLocationChange);
      window.removeEventListener('privacy-mode-changed', handlePrivacyModeChange as EventListener);
    };
  }, [currentUser, isTracking, vectorSource]);
};

// Helper functions to clean up main effect
const clearExistingUserMarkers = (vectorSource: VectorSource) => {
  const features = vectorSource.getFeatures();
  features.forEach(feature => {
    const isCircle = feature.get('isCircle');
    const isUserMarker = feature.get('isCurrentUser') || feature.get('userId');
    const isHeatMap = feature.get('isHeatMap');
    
    if ((!isCircle && isUserMarker) || isHeatMap) {
      vectorSource.removeFeature(feature);
    }
  });
};

const filterOnlineAndUnblockedUsers = (nearbyUsers: AppUser[], currentUser: AppUser | null): AppUser[] => {
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

const addNearbyUserMarkers = (
  onlineUsers: AppUser[], 
  currentUser: AppUser | null,
  radiusInKm: number,
  vectorSource: VectorSource
) => {
  onlineUsers.forEach(user => {
    if (user.location && user.location.lat && user.location.lng) {
      // Skip users outside the radius if we have user location
      if (currentUser?.location) {
        const distance = calculateDistance(
          currentUser.location.lat,
          currentUser.location.lng,
          user.location.lat,
          user.location.lng
        );
        
        if (distance > radiusInKm) {
          return;
        }
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
        
        vectorSource.addFeature(userFeature);
        
        // If privacy enabled, also add a heatmap-style marker (larger, semi-transparent)
        if (isPrivacyEnabled) {
          const heatMapFeature = new Feature({
            geometry: new Point(fromLonLat([displayLocation.lng, displayLocation.lat])),
            userId: user.id,
            isHeatMap: true,
          });
          
          vectorSource.addFeature(heatMapFeature);
        }
      } catch (error) {
        console.error(`Error adding user ${user.id} to map:`, error);
      }
    }
  });
};

const addCurrentUserMarker = (currentUser: AppUser | null, vectorSource: VectorSource) => {
  if (currentUser?.location?.lat && currentUser?.location?.lng) {
    try {
      // Check if current user has privacy enabled
      const isCurrentUserPrivacyEnabled = shouldObfuscateLocation(currentUser);
      
      // Skip adding the marker if privacy mode is enabled
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
      
      // Dispatch an event to notify that user's location has been updated on the map
      window.dispatchEvent(new CustomEvent('user-marker-updated'));
    } catch (error) {
      console.error("Error adding current user to map:", error);
    }
  }
};
