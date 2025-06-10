
import { useCallback, useRef } from 'react';
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
      if (!source) return;
      
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
      
      // For business users, only add their own marker
      if (isBusiness) {
        console.log("Business user - only adding own marker");
        const isPrivacyEnabled = shouldObfuscateLocation(user);
        
        if (tracking && user && !isPrivacyEnabled) {
          await addCurrentUserMarker(user, source);
        }
        return;
      }
      
      // Filter users
      const onlineUsers = filterOnlineAndUnblockedUsers(users, user);
      console.log(`Filtered to ${onlineUsers.length} online users`);
      
      // Add user markers with clustering if enabled and there are many users
      if (useHeatmap && onlineUsers.length > 10) {
        console.log("Using cluster mode for", onlineUsers.length, "users");
        const clusters = clusterNearbyUsers(onlineUsers, 0.3); // 300m cluster radius
        const clusterFeatures = createClusterMarkers(clusters, source, user);
        source.addFeatures(clusterFeatures);
      } else {
        // Use individual markers for smaller groups
        const { addNearbyUserMarkers } = await import('./utils/userMarkers');
        await addNearbyUserMarkers(onlineUsers, user, radius, source);
      }
      
      // Add current user marker
      const isPrivacyEnabled = shouldObfuscateLocation(user);
      if (tracking && user && !isPrivacyEnabled) {
        await addCurrentUserMarker(user, source);
      }
      
    }, 150, { leading: false, trailing: true }),
    []
  );
  
  return { debouncedUpdateMarkers };
};
