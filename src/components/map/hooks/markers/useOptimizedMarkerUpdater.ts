
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

  // Listen for zoom events to prevent updates during zoom
  const setupZoomListeners = useCallback(() => {
    const handleZoomStart = () => {
      isZoomingRef.current = true;
    };
    
    const handleZoomEnd = () => {
      setTimeout(() => {
        isZoomingRef.current = false;
      }, 200);
    };
    
    window.addEventListener('map-zoom-start', handleZoomStart);
    window.addEventListener('map-zoom-end', handleZoomEnd);
    
    return () => {
      window.removeEventListener('map-zoom-start', handleZoomStart);
      window.removeEventListener('map-zoom-end', handleZoomEnd);
    };
  }, []);

  // Set up zoom listeners on first render
  React.useEffect(() => {
    return setupZoomListeners();
  }, [setupZoomListeners]);

  // Debounced update function to prevent rapid flickering
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
      if (!source || isZoomingRef.current) {
        console.log("Skipping marker update - zooming in progress");
        return;
      }
      
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
      
      // Clear only user markers efficiently
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
      
      // Always use heatmap/clustering when there are more than 5 users (lowered threshold)
      if (useHeatmap && onlineUsers.length > 5) {
        console.log("Using cluster/heatmap mode for", onlineUsers.length, "users");
        const clusters = clusterNearbyUsers(onlineUsers, 0.3); // 300m cluster radius
        const clusterFeatures = createClusterMarkers(clusters, source, user);
        source.addFeatures(clusterFeatures);
      } else {
        // Use individual markers for smaller groups
        const { addNearbyUserMarkers } = await import('./utils/userMarkers');
        await addNearbyUserMarkers(onlineUsers, user, radius, source);
      }
      
      // Add current user marker (for both business and regular users)
      const isPrivacyEnabled = shouldObfuscateLocation(user);
      if (tracking && user && !isPrivacyEnabled) {
        await addCurrentUserMarker(user, source);
      }
      
    }, 150, { leading: false, trailing: true }),
    []
  );
  
  return { debouncedUpdateMarkers };
};
