
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { debounce } from 'lodash';

export function useUserPresence() {
  const { currentUser, nearbyUsers, setNearbyUsers, chats, setChats } = useAppContext();
  const updateStatusRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<any>(null);
  
  // Update the user's online status when they connect/disconnect
  useEffect(() => {
    if (!currentUser?.id) return;

    // Create a debounced function for updating status to prevent flickering
    if (!updateStatusRef.current) {
      updateStatusRef.current = debounce(async (isOnline: boolean) => {
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
      }, 300);
    }

    // Mark user as online when they load the app
    updateStatusRef.current(true);

    // Set up heartbeat to maintain online status every 30 seconds
    // This ensures only actively logged in users stay marked as online
    heartbeatIntervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateStatusRef.current(true);
      }
    }, 30000); // 30 seconds heartbeat

    // Set up event listeners to handle page visibility changes and before unload
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      console.log(`Visibility change: ${isVisible ? 'visible' : 'hidden'}`);
      
      if (isVisible) {
        // User came back to the app - mark as online
        updateStatusRef.current(true);
      } else {
        // User left the app - mark as offline after a short delay
        setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            updateStatusRef.current(false);
          }
        }, 5000); // 5 second grace period
      }
    };

    const handleBeforeUnload = () => {
      console.log('User leaving page, updating status to offline');
      // Use the REST API URL instead of accessing the protected supabaseUrl property
      navigator.sendBeacon(
        `https://sqrlsxmwvmgmbmcyaxcq.supabase.co/rest/v1/profiles?id=eq.${currentUser.id}`,
        JSON.stringify({ 
          is_online: false,
          last_seen: new Date().toISOString() 
        })
      );
    };

    // Add focus/blur listeners for additional accuracy
    const handleFocus = () => {
      updateStatusRef.current(true);
    };

    const handleBlur = () => {
      // Don't immediately mark as offline on blur, wait for visibility change
      setTimeout(() => {
        if (document.visibilityState === 'hidden') {
          updateStatusRef.current(false);
        }
      }, 10000); // 10 second delay before marking offline
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Subscribe to real-time changes in the profiles table
    const channel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
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
                      isOnline: Boolean(updatedProfile.is_online), // Strict boolean conversion
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
                  ? { ...chat, isOnline: Boolean(updatedProfile.is_online) } 
                  : chat
              )
            );
          }
        }
      )
      .subscribe();

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
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      updateStatusRef.current.cancel(); // Cancel any pending debounced calls
      updateStatusRef.current(false); // Set status to offline
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, nearbyUsers, setNearbyUsers, chats, setChats]);
}
