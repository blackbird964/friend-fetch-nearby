
import React, { useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { Vector as VectorSource } from 'ol/source';
import { AppUser } from '@/context/types';
import { filterOnlineAndUnblockedUsers } from './utils/markerUtils';
import { clusterNearbyUsers, createClusterMarkers } from './utils/markerClustering';
import { addCurrentUserMarker } from './utils/userMarkers';
import { shouldObfuscateLocation } from '@/utils/privacyUtils';

export const useOptimizedMarkerUpdater = () => {
  const lastUpdateRef = useRef<{
    users: string[];
    currentUserId: string | null;
    tracking: boolean;
    privacy: boolean;
  }>({ users: [], currentUserId: null, tracking: false, privacy: false });

  const isZoomingRef = useRef(false);
  const updateInProgressRef = useRef(false);

  // Track zoom state to prevent updates during zoom
  const handleZoomStart = useCallback(() => {
    isZoomingRef.current = true;
  }, []);

  const handleZoomEnd = useCallback(() => {
    // Add a small delay to ensure zoom animation is complete
    setTimeout(() => {
      isZoomingRef.current = false;
    }, 300);
  }, []);

  // Enhanced debounced update function that prevents conflicts
  const debouncedUpdateMarkers = useCallback(
    debounce(async (
      source: VectorSource,
      users: AppUser[],
      user: AppUser | null,
      radius: number,
      tracking: boolean,
      isBusiness: boolean,
      useHeatmap: boolean = true
    ) => {
      if (!source) {
        console.log("Skipping marker update - no source");
        return;
      }

      // Prevent concurrent updates that can cause markers to disappear
      if (updateInProgressRef.current) {
        console.log("Skipping marker update - update already in progress");
        return;
      }

      // Skip updates during zoom operations
      if (isZoomingRef.current) {
        console.log("Skipping marker update - zoom in progress");
        return;
      }
      
      updateInProgressRef.current = true;
      
      try {
        console.log("Optimized marker update: tracking=", tracking, "users=", users.length, "isBusiness=", isBusiness);
        
        // Check if we actually need to update
        const currentState = {
          users: users.map(u => u.id).sort(),
          currentUserId: user?.id || null,
          tracking,
          privacy: shouldObfuscateLocation(user)
        };
        
        const lastState = lastUpdateRef.current;
        const hasChanged = 
          JSON.stringify(currentState.users) !== JSON.stringify(lastState.users) ||
          currentState.currentUserId !== lastState.currentUserId ||
          currentState.tracking !== lastState.tracking ||
          currentState.privacy !== lastState.privacy;
        
        if (!hasChanged) {
          console.log("No changes detected, skipping marker update");
          return;
        }
        
        lastUpdateRef.current = currentState;
        
        // Clear only user markers efficiently, but preserve visibility state
        const features = source.getFeatures();
        const markersToRemove = features.filter(feature => {
          const isUserMarker = feature.get('userId') || feature.get('isCurrentUser') || feature.get('isCluster');
          const isNotCircle = !feature.get('isCircle');
          return isUserMarker && isNotCircle;
        });
        
        // Remove in batch
        markersToRemove.forEach(feature => source.removeFeature(feature));
        
        // Filter users (always show all online users, regardless of current user being business)
        const onlineUsers = filterOnlineAndUnblockedUsers(users, user);
        console.log(`Filtered to ${onlineUsers.length} online users`);
        
        // Use clustering for 3+ users (lowered threshold for better clustering across map)
        if (useHeatmap && onlineUsers.length >= 3) {
          console.log("Using cluster/heatmap mode for", onlineUsers.length, "users");
          
          // Use dynamic cluster radius based on user distribution
          const baseRadius = onlineUsers.length > 20 ? 0.3 : onlineUsers.length > 10 ? 0.5 : 0.8;
          const clusters = clusterNearbyUsers(onlineUsers, baseRadius);
          const clusterFeatures = createClusterMarkers(clusters, source, user);
          
          // Ensure all cluster features are visible by default
          clusterFeatures.forEach(feature => {
            feature.set('visible', true);
          });
          
          source.addFeatures(clusterFeatures);
        } else {
          // Use individual markers for very small groups
          const { addNearbyUserMarkers } = await import('./utils/userMarkers');
          await addNearbyUserMarkers(onlineUsers, user, radius, source);
        }
        
        // Add current user marker (for both business and regular users)
        const isPrivacyEnabled = shouldObfuscateLocation(user);
        if (tracking && user && !isPrivacyEnabled) {
          await addCurrentUserMarker(user, source);
        }
        
      } catch (error) {
        console.error("Error in debouncedUpdateMarkers:", error);
      } finally {
        updateInProgressRef.current = false;
      }
      
    }, 200, { leading: false, trailing: true }), // Increased debounce time
    []
  );
  
  return { 
    debouncedUpdateMarkers, 
    handleZoomStart, 
    handleZoomEnd 
  };
};
