
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { debounce } from 'lodash';

export function useUserPresence() {
  const { currentUser, nearbyUsers, setNearbyUsers, chats, setChats } = useAppContext();
  const updateStatusRef = useRef<any>(null);
  const channelRef = useRef<any>(null);
  const lastStatusUpdate = useRef<number>(0);
  const PRESENCE_THROTTLE = 60000; // Only update presence every minute
  const RELEVANT_USER_CACHE_TIME = 300000; // 5 minutes
  const relevantUserIdsRef = useRef<Set<string>>(new Set());
  const lastRelevantUserUpdate = useRef<number>(0);
  
  // Even more aggressively debounced update function
  const updateStatus = useCallback(
    debounce(async (isOnline: boolean) => {
      if (!currentUser?.id) return;
      
      const now = Date.now();
      if (!isOnline || now - lastStatusUpdate.current > PRESENCE_THROTTLE) {
        try {
          console.log(`Setting user ${currentUser.id} online status to ${isOnline}`);
          await supabase
            .from('profiles')
            .update({ 
              is_online: isOnline,
              last_seen: new Date().toISOString() 
            })
            .eq('id', currentUser.id);
          
          lastStatusUpdate.current = now;
        } catch (error) {
          console.error('Error updating online status:', error);
        }
      } else {
        console.log("Skipping online status update - throttled");
      }
    }, 500),
    [currentUser?.id]
  );
  
  // Update the user's online status when they connect/disconnect
  useEffect(() => {
    if (!currentUser?.id) return;

    // Store reference to the debounced function
    updateStatusRef.current = updateStatus;

    // Mark user as online when they load the app
    updateStatusRef.current(true);

    // Set up event listeners with reduced event handling
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

    // Get only the most relevant user IDs to track
    const getRelevantUserIds = (): string[] => {
      const now = Date.now();
      
      // Only recalculate relevant users every 5 minutes to reduce processing
      if (relevantUserIdsRef.current.size === 0 || 
          now - lastRelevantUserUpdate.current > RELEVANT_USER_CACHE_TIME) {
        
        const userIdsSet = new Set<string>();
        
        // Add only nearby users that are visible on screen or most relevant
        // Limit to 10 users maximum based on distance
        const closestUsers = [...nearbyUsers]
          .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
          .slice(0, 10);
          
        closestUsers.forEach(user => {
          if (user.id) userIdsSet.add(user.id);
        });
        
        // Add only active chat participants (recent conversations)
        const recentChats = chats
          .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
          .slice(0, 5); // Only track the 5 most recent conversations
          
        recentChats.forEach(chat => {
          if (chat.participantId) userIdsSet.add(chat.participantId);
        });
        
        // Update the ref
        relevantUserIdsRef.current = userIdsSet;
        lastRelevantUserUpdate.current = now;
      }
      
      // Convert to array and remove current user
      return Array.from(relevantUserIdsRef.current).filter(id => id !== currentUser.id);
    };
    
    // Create an extremely optimized subscription that only tracks the most relevant profiles
    const setupRealtimeSubscription = () => {
      const userIdsArray = getRelevantUserIds();
      
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
      // Only track is_online field updates to minimize data transfer
      channelRef.current = supabase
        .channel('minimal-profile-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `or(${filterCondition})`,
          },
          (payload) => {
            const updatedProfile = payload.new as any;
            console.log('Profile update received:', updatedProfile.id, 'online:', updatedProfile.is_online);
            
            // Update only online status in the corresponding lists
            if (nearbyUsers.some(user => user.id === updatedProfile.id)) {
              setNearbyUsers(
                nearbyUsers.map(user => 
                  user.id === updatedProfile.id 
                    ? { ...user, isOnline: updatedProfile.is_online } 
                    : user
                )
              );
            }
            
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
    
    // Set up the subscription with a delay to allow initial data to load
    const subscriptionTimer = setTimeout(() => {
      setupRealtimeSubscription();
    }, 3000);
    
    // Periodically refresh the subscription to update the list of relevant users
    const refreshSubscriptionTimer = setInterval(() => {
      setupRealtimeSubscription();
    }, RELEVANT_USER_CACHE_TIME); // Refresh every 5 minutes

    // Clean up function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(subscriptionTimer);
      clearInterval(refreshSubscriptionTimer);
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
