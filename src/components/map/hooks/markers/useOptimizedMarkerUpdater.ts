
import React, { useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { Vector as VectorSource } from 'ol/source';
import { AppUser } from '@/context/types';
import { filterOnlineAndUnblockedUsers } from './utils/markerUtils';
import { clusterNearbyUsers, createClusterMarkers } from './utils/markerClustering';
import { addCurrentUserMarker } from './utils/userMarkers';
import { shouldObfuscateLocation } from '@/utils/privacyUtils';

export const useOptimizedMarkerUpdater = () => {
  const updateInProgressRef = useRef(false);

  // Simplified debounced update function
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

      // Prevent concurrent updates
      if (updateInProgressRef.current) {
        console.log("Skipping marker update - update already in progress");
        return;
      }
      
      updateInProgressRef.current = true;
      
      try {
        console.log("🗺️  Updating markers: tracking=", tracking, "users=", users.length, "isBusiness=", isBusiness);
        
        // Clear only user markers efficiently
        const features = source.getFeatures();
        const markersToRemove = features.filter(feature => {
          const isUserMarker = feature.get('userId') || feature.get('isCurrentUser') || feature.get('isCluster');
          const isNotCircle = !feature.get('isCircle');
          return isUserMarker && isNotCircle;
        });
        
        // Remove in batch
        markersToRemove.forEach(feature => source.removeFeature(feature));
        
        console.log(`🧹 Removed ${markersToRemove.length} existing markers`);
        
        // Filter users - show ALL valid users
        const validUsers = users.filter(u => {
          // Basic validation
          if (!u.id || !u.location) return false;
          
          // Skip test/mock users
          if (String(u.id).includes('test') || String(u.id).includes('mock')) return false;
          
          // Skip current user
          if (user && u.id === user.id) return false;
          
          // Skip blocked users
          if (user?.blockedUsers?.includes(u.id)) return false;
          if (u.blockedUsers?.includes(user?.id || '')) return false;
          
          return true;
        });
        
        console.log(`📍 Processing ${validUsers.length} valid users out of ${users.length} total`);
        
        // Always use individual markers to ensure businesses show as stars
        // Don't use clustering for now to ensure business stars are visible
        const { addNearbyUserMarkers } = await import('./utils/userMarkers');
        await addNearbyUserMarkers(validUsers, user, radius, source);
        
        // Add current user marker if tracking and not privacy enabled
        const isPrivacyEnabled = shouldObfuscateLocation(user);
        if (tracking && user && !isPrivacyEnabled) {
          await addCurrentUserMarker(user, source);
        }
        
        console.log("✅ Marker update completed successfully");
        
      } catch (error) {
        console.error("❌ Error in debouncedUpdateMarkers:", error);
      } finally {
        updateInProgressRef.current = false;
      }
      
    }, 150, { leading: false, trailing: true }), // Reduced debounce time
    []
  );
  
  // Simplified zoom handlers
  const handleZoomStart = useCallback(() => {
    // Don't prevent updates during zoom - just log
    console.log("🔍 Zoom started");
  }, []);

  const handleZoomEnd = useCallback(() => {
    console.log("🔍 Zoom ended");
  }, []);
  
  return { 
    debouncedUpdateMarkers, 
    handleZoomStart, 
    handleZoomEnd 
  };
};
