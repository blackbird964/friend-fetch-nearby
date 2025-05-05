
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { debounce } from 'lodash';

export function useUserPresence() {
  const { currentUser, nearbyUsers, setNearbyUsers, chats, setChats } = useAppContext();
  const updateStatusRef = useRef<any>(null);
  
  // Update the user's online status when they connect/disconnect
  useEffect(() => {
    if (!currentUser?.id) return;

    // Create a debounced function for updating status to prevent flickering
    if (!updateStatusRef.current) {
      updateStatusRef.current = debounce(async (isOnline: boolean) => {
        try {
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
      }, 300); // 300ms debounce to reduce flicker
    }

    // Mark user as online when they load the app
    updateStatusRef.current(true);

    // Set up event listeners to handle page visibility changes and before unload
    const handleVisibilityChange = () => {
      updateStatusRef.current(document.visibilityState === 'visible');
    };

    const handleBeforeUnload = () => {
      // Use the REST API URL instead of accessing the protected supabaseUrl property
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
          
          // Update nearbyUsers if the changed profile is in that list
          if (nearbyUsers.some(user => user.id === updatedProfile.id)) {
            setNearbyUsers(
              nearbyUsers.map(user => 
                user.id === updatedProfile.id 
                  ? { ...user, isOnline: updatedProfile.is_online, location: updatedProfile.location ? parseLocationFromPostgres(updatedProfile.location) : user.location } 
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
      updateStatusRef.current.cancel(); // Cancel any pending debounced calls
      updateStatusRef.current(false); // Set status to offline
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, nearbyUsers, setNearbyUsers, chats, setChats]);
}
