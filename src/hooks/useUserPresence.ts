
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { debounce } from 'lodash';

export function useUserPresence() {
  const { currentUser, nearbyUsers, setNearbyUsers, chats, setChats } = useAppContext();
  const updateStatusRef = useRef<any>(null);
  const channelRef = useRef<any>(null);
  
  // Debounced update function to prevent excessive database calls
  const updateStatus = useCallback(
    debounce(async (isOnline: boolean) => {
      if (!currentUser?.id) return;
      
      try {
        console.log(`Setting user ${currentUser.id} online status to ${isOnline}`);
        await supabase
          .from('profiles')
          .update({ 
            is_online: isOnline,
            last_seen: new Date().toISOString() 
          })
          .eq('id', currentUser.id);
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    }, 300),
    [currentUser?.id]
  );
  
  // Update the user's online status when they connect/disconnect
  useEffect(() => {
    if (!currentUser?.id) return;

    // Store reference to the debounced function
    updateStatusRef.current = updateStatus;

    // Mark user as online when they load the app
    updateStatusRef.current(true);

    // Set up event listeners to handle page visibility changes and before unload
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      console.log(`Visibility change: ${isVisible ? 'visible' : 'hidden'}`);
      updateStatusRef.current(isVisible);
    };

    const handleBeforeUnload = () => {
      console.log('User leaving page, updating status to offline');
      navigator.sendBeacon(
        `https://sqrlsxmwvmgmbmcyaxcq.supabase.co/rest/v1/profiles?id=eq.${currentUser.id}`,
        JSON.stringify({ 
          is_online: false,
          last_seen: new Date().toISOString() 
        })
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Create an optimized subscription that only tracks the profiles we care about
    const setupRealtimeSubscription = () => {
      // Get IDs of users we're interested in (nearby users and chat participants)
      const relevantUserIds = new Set<string>();
      
      // Add nearby users
      nearbyUsers.forEach(user => {
        if (user.id) relevantUserIds.add(user.id);
      });
      
      // Add chat participants
      chats.forEach(chat => {
        if (chat.participantId) relevantUserIds.add(chat.participantId);
      });
      
      // Convert to array and remove current user
      const userIdsArray = Array.from(relevantUserIds).filter(id => id !== currentUser.id);
      
      if (userIdsArray.length === 0) {
        console.log('No relevant users to track, skipping realtime subscription');
        return;
      }
      
      // Create a filter condition for the subscription
      const filterCondition = userIdsArray.map(id => `id.eq.${id}`).join(',');
      
      console.log('Setting up optimized realtime subscription for users:', userIdsArray);
      
      if (channelRef.current) {
        console.log('Removing existing channel subscription');
        supabase.removeChannel(channelRef.current);
      }
      
      // Subscribe to real-time changes only for relevant profiles
      channelRef.current = supabase
        .channel('filtered-profiles')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `or(${filterCondition})`
          },
          (payload) => {
            const updatedProfile = payload.new as any;
            console.log('Profile update received:', updatedProfile);
            
            // Update nearbyUsers if the changed profile is in that list
            if (nearbyUsers.some(user => user.id === updatedProfile.id)) {
              console.log(`Updating nearby user ${updatedProfile.id}, online status: ${updatedProfile.is_online}`);
              setNearbyUsers(
                nearbyUsers.map(user => 
                  user.id === updatedProfile.id 
                    ? { 
                        ...user, 
                        isOnline: updatedProfile.is_online, 
                        location: updatedProfile.location ? parseLocationFromPostgres(updatedProfile.location) : user.location 
                      } 
                    : user
                )
              );
            }
            
            // Update chats if the changed profile is a chat participant
            const chatWithUser = chats.find(chat => chat.participantId === updatedProfile.id);
            if (chatWithUser) {
              setChats(
                chats.map(chat => 
                  chat.participantId === updatedProfile.id 
                    ? { ...chat, isOnline: updatedProfile.is_online } 
                    : chat
                )
              );
            }
          }
        )
        .subscribe();
    };
    
    // Set up the subscription with a small delay to allow initial data to load
    const subscriptionTimer = setTimeout(() => {
      setupRealtimeSubscription();
    }, 2000);

    // Helper function to parse location from PostgreSQL point format
    function parseLocationFromPostgres(pgLocation: any): { lat: number, lng: number } | null {
      if (!pgLocation) return null;
      
      try {
        // Handle string format from Postgres: "(lng,lat)"
        if (typeof pgLocation === 'string' && pgLocation.startsWith('(')) {
          const match = pgLocation.match(/\(([^,]+),([^)]+)\)/);
          if (match) {
            return {
              lng: parseFloat(match[1]),
              lat: parseFloat(match[2])
            };
          }
        }
        // Handle if it's already parsed as an object
        else if (typeof pgLocation === 'object' && pgLocation !== null) {
          if ('lat' in pgLocation && 'lng' in pgLocation) {
            return {
              lat: pgLocation.lat,
              lng: pgLocation.lng
            };
          }
        }
      } catch (e) {
        console.error('Error parsing location data:', e);
      }
      
      return null;
    }

    // Clean up function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(subscriptionTimer);
      if (updateStatusRef.current && updateStatusRef.current.cancel) {
        updateStatusRef.current.cancel(); // Cancel any pending debounced calls
      }
      updateStatusRef.current(false); // Set status to offline
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentUser?.id, nearbyUsers, setNearbyUsers, chats, setChats, updateStatus]);
}
