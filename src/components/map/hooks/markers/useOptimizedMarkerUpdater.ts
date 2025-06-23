
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

  // Re-enabled clustering with debounced update function
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
        
        // Use clustering for better organization - but handle businesses specially
        if (validUsers.length > 2 && useHeatmap) {
          // Separate business users from regular users
          const businessUsers: AppUser[] = [];
          const regularUsers: AppUser[] = [];
          
          // Import business detection functions
          const { getBusinessProfile, isLikelyBusinessName } = await import('@/lib/supabase/businessProfiles');
          
          // Classify users as business or regular
          for (const validUser of validUsers) {
            let isBusiness = false;
            
            try {
              const businessProfile = await getBusinessProfile(validUser.id);
              isBusiness = !!businessProfile;
            } catch (error) {
              console.warn(`Error checking business profile for ${validUser.id}:`, error);
            }
            
            // Fallback: check if name suggests business
            if (!isBusiness && validUser.name) {
              isBusiness = isLikelyBusinessName(validUser.name);
            }
            
            if (isBusiness) {
              businessUsers.push(validUser);
            } else {
              regularUsers.push(validUser);
            }
          }
          
          console.log(`Found ${businessUsers.length} business users and ${regularUsers.length} regular users`);
          
          // Add business users as individual star markers (never cluster them)
          const { addNearbyUserMarkers } = await import('./utils/userMarkers');
          if (businessUsers.length > 0) {
            await addNearbyUserMarkers(businessUsers, user, radius, source);
          }
          
          // Cluster regular users only
          if (regularUsers.length > 0) {
            const clusters = clusterNearbyUsers(regularUsers, 0.8); // Slightly larger radius for better clustering
            const clusterFeatures = createClusterMarkers(clusters, source, user);
            
            if (clusterFeatures.length > 0) {
              source.addFeatures(clusterFeatures);
              console.log(`✅ Added ${clusterFeatures.length} cluster markers for ${regularUsers.length} regular users`);
            }
          }
        } else {
          // For small numbers or when clustering is disabled, use individual markers
          const { addNearbyUserMarkers } = await import('./utils/userMarkers');
          await addNearbyUserMarkers(validUsers, user, radius, source);
        }
        
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
      
    }, 150, { leading: false, trailing: true }),
    []
  );
  
  // Simplified zoom handlers
  const handleZoomStart = useCallback(() => {
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
