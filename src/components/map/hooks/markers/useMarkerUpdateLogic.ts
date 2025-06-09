import { useCallback } from 'react';
import { throttle } from 'lodash';
import { Vector as VectorSource } from 'ol/source';
import { AppUser } from '@/context/types';
import { clearExistingUserMarkers, filterOnlineAndUnblockedUsers } from './utils/markerUtils';
import { addNearbyUserMarkers, addCurrentUserMarker } from './utils/userMarkers';
import { shouldObfuscateLocation } from '@/utils/privacyUtils';

export const useMarkerUpdateLogic = () => {
  // Create a throttled update function for better performance
  const throttledUpdateMarkers = useCallback(
    throttle(async (
      source: VectorSource,
      users: AppUser[],
      user: AppUser | null,
      radius: number,
      tracking: boolean,
      isBusiness: boolean
    ) => {
      // Don't proceed if there's no source
      if (!source) return;
      
      console.log("updateMarkers: tracking=", tracking, "users=", users.length, "isBusiness=", isBusiness);
      
      // Clear existing user markers (but keep circle markers)
      clearExistingUserMarkers(source);
      
      // For business users, only add their own marker - no other user markers
      if (isBusiness) {
        console.log("Business user - only adding own marker");
        
        // Check if privacy is enabled for current user
        const isPrivacyEnabled = shouldObfuscateLocation(user);
        
        // Only add business user's own marker if privacy is OFF and tracking is ON
        if (tracking && user && !isPrivacyEnabled) {
          await addCurrentUserMarker(user, source);
        }
        
        return;
      }
      
      // Filter to only show online and unblocked users
      const onlineUsers = filterOnlineAndUnblockedUsers(users, user);
      console.log(`Filtered to ${onlineUsers.length} online users out of ${users.length} total`);
      
      // ALWAYS add markers for nearby users, regardless of tracking state
      // This ensures users are clickable even when tracking is off
      await addNearbyUserMarkers(onlineUsers, user, radius, source);
      
      // Check if privacy is enabled for current user
      const isPrivacyEnabled = shouldObfuscateLocation(user);
      
      // Only add user marker if privacy is OFF and tracking is ON
      if (tracking && user && !isPrivacyEnabled) {
        await addCurrentUserMarker(user, source);
      }
      
    }, 100, { leading: true, trailing: true }),
    []
  );
  
  return { throttledUpdateMarkers };
};
