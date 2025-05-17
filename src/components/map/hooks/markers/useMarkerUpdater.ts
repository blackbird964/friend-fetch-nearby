import { useEffect, useCallback, useRef } from 'react';
import { AppUser } from '@/context/types';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { calculateDistance } from '@/utils/locationUtils';
import { getDisplayLocation, shouldObfuscateLocation } from '@/utils/privacyUtils';
import { throttle } from 'lodash';

export const useMarkerUpdater = (
  vectorSource: React.MutableRefObject<VectorSource | null>,
  nearbyUsers: AppUser[],
  currentUser: AppUser | null,
  mapLoaded: boolean,
  radiusInKm: number,
  isTracking: boolean = true
) => {
  // Use refs to track previous state and avoid unnecessary updates
  const prevTrackingRef = useRef(isTracking);
  const prevRadiusRef = useRef(radiusInKm);
  const updateTimeoutRef = useRef<number | null>(null);
  const nearbyUsersRef = useRef(nearbyUsers);
  const currentUserRef = useRef(currentUser);
  
  // Create a throttled update function for better performance
  const throttledUpdateMarkers = useCallback(
    throttle((
      source: VectorSource,
      users: AppUser[],
      user: AppUser | null,
      radius: number,
      tracking: boolean
    ) => {
      // Don't proceed if there's no source
      if (!source) return;
      
      // Clear existing user markers (but keep circle markers)
      clearExistingUserMarkers(source);
      
      // If tracking is disabled, don't show any users
      if (!tracking) return;
      
      // Filter to only show online and unblocked users
      const onlineUsers = filterOnlineAndUnblockedUsers(users, user);
      
      // Add markers for nearby users
      addNearbyUserMarkers(onlineUsers, user, radius, source);
      
      // Check if privacy is enabled for current user
      const isPrivacyEnabled = user ? shouldObfuscateLocation(user) : false;
      
      // Only add user marker if privacy is OFF and tracking is ON
      if (tracking && user && !isPrivacyEnabled) {
        addCurrentUserMarker(user, source);
      }
      
    }, 100, { leading: true, trailing: true }),
    []
  );
  
  // Update refs when props change to use in cleanup functions
  useEffect(() => {
    nearbyUsersRef.current = nearbyUsers;
    currentUserRef.current = currentUser;
    prevRadiusRef.current = radiusInKm;
    prevTrackingRef.current = isTracking;
  }, [nearbyUsers, currentUser, radiusInKm, isTracking]);
  
  // Update map markers when user data changes
  useEffect(() => {
    if (!mapLoaded || !vectorSource.current) return;
    
    // Schedule update with a slight delay for better performance
    if (updateTimeoutRef.current) {
      window.clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = window.setTimeout(() => {
      throttledUpdateMarkers(
        vectorSource.current!, 
        nearbyUsers, 
        currentUser, 
        radiusInKm, 
        isTracking
      );
      updateTimeoutRef.current = null;
    }, 50);
    
    // Cleanup function
    return () => {
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, [
    nearbyUsers, 
    mapLoaded, 
    currentUser?.location, 
    vectorSource, 
    radiusInKm, 
    currentUser?.locationSettings?.hideExactLocation, 
    currentUser?.location_settings?.hide_exact_location, 
    currentUser?.blockedUsers, 
    isTracking,
    throttledUpdateMarkers
  ]);

  // Listen for manual location updates and privacy changes
  useEffect(() => {
    const handleLocationChange = () => {
      if (!vectorSource.current || !mapLoaded) return;
      
      // Use timeout to avoid too frequent updates
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
      }
      
      updateTimeoutRef.current = window.setTimeout(() => {
        throttledUpdateMarkers(
          vectorSource.current!, 
          nearbyUsersRef.current, 
          currentUserRef.current, 
          prevRadiusRef.current, 
          prevTrackingRef.current
        );
        updateTimeoutRef.current = null;
      }, 50);
    };
    
    // Handle privacy mode changes
    const handlePrivacyModeChange = (event: CustomEvent) => {
      if (!vectorSource.current || !mapLoaded) return;
      
      if (event.detail && event.detail.isPrivacyEnabled !== undefined) {
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
          if (prevTrackingRef.current && currentUserRef.current?.location) {
            addCurrentUserMarker(currentUserRef.current, vectorSource.current);
          }
        }
        
        // Force an update after privacy change
        throttledUpdateMarkers(
          vectorSource.current!, 
          nearbyUsersRef.current, 
          currentUserRef.current, 
          prevRadiusRef.current, 
          prevTrackingRef.current
        );
      }
    };
    
    window.addEventListener('user-location-changed', handleLocationChange);
    window.addEventListener('privacy-mode-changed', handlePrivacyModeChange as EventListener);
    
    return () => {
      window.removeEventListener('user-location-changed', handleLocationChange);
      window.removeEventListener('privacy-mode-changed', handlePrivacyModeChange as EventListener);
      
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
      }
      
      // Cancel any pending throttled updates
      throttledUpdateMarkers.cancel();
    };
  }, [throttledUpdateMarkers, mapLoaded]);
};

// Helper functions to clean up main effect
const clearExistingUserMarkers = (vectorSource: VectorSource) => {
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
  if (!vectorSource) return;
  
  const features: Feature[] = [];
  
  onlineUsers.forEach(user => {
    if (!user.location || !user.location.lat || !user.location.lng) return;
    
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

const addCurrentUserMarker = (currentUser: AppUser | null, vectorSource: VectorSource) => {
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
