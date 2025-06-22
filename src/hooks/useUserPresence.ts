
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from 'lodash';
import { AppUser, Chat } from '@/context/types';

interface UseUserPresenceProps {
  currentUser: AppUser | null;
  nearbyUsers: AppUser[];
  setNearbyUsers: (users: AppUser[]) => void;
  chats: Chat[];
  setChats: (chats: Chat[] | ((prev: Chat[]) => Chat[])) => void;
}

export function useUserPresence({ 
  currentUser, 
  nearbyUsers, 
  setNearbyUsers, 
  chats, 
  setChats 
}: UseUserPresenceProps) {
  const updateStatusRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  
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

    // Mark user as online immediately when they load any page
    const markUserOnline = async () => {
      if (!isInitializedRef.current) {
        console.log('Initializing user presence - marking user as ONLINE');
        updateStatusRef.current(true);
        isInitializedRef.current = true;
      }
    };

    markUserOnline();

    // Set up aggressive heartbeat to maintain online status every 15 seconds
    // This ensures users stay marked as online while actively using the app
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      // Only send heartbeat if page is visible and user is active
      if (document.visibilityState === 'visible') {
        console.log('Heartbeat: Keeping user online');
        updateStatusRef.current(true);
      }
    }, 15000); // More frequent heartbeat (15 seconds)

    // Set up event listeners to handle page visibility changes and before unload
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      console.log(`Visibility change: ${isVisible ? 'visible' : 'hidden'}`);
      
      if (isVisible) {
        // User came back to the app - immediately mark as online
        console.log('User returned to app - marking ONLINE');
        updateStatusRef.current(true);
      } else {
        // User left the app - mark as offline after a short delay
        console.log('User left app - will mark OFFLINE in 10 seconds');
        setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            console.log('User still away - marking OFFLINE');
            updateStatusRef.current(false);
          }
        }, 10000); // 10 second grace period
      }
    };

    const handleBeforeUnload = () => {
      console.log('User leaving page, updating status to offline');
      // Use synchronous approach for immediate offline status
      try {
        // Use sendBeacon for reliable delivery when page is unloading
        const payload = JSON.stringify({ 
          is_online: false,
          last_seen: new Date().toISOString() 
        });
        
        const url = `https://sqrlsxmwvmgmbmcyaxcq.supabase.co/rest/v1/profiles?id=eq.${currentUser.id}`;
        const headers = {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcmxzeG13dm1nbWJtY3lheGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTcyMTAsImV4cCI6MjA2MDAzMzIxMH0.xZQ0SGg82QG_TdYtxQU7ccy0mvb_3HvyQj8xbT8FUYA',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcmxzeG13dm1nbWJtY3lheGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTcyMTAsImV4cCI6MjA2MDAzMzIxMH0.xZQ0SGg82QG_TdYtxQU7ccy0mvb_3HvyQj8xbT8FUYA`
        };
        
        // Try sendBeacon first (more reliable for page unload)
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
        }
      } catch (error) {
        console.error('Error setting offline status on unload:', error);
      }
    };

    // Add focus/blur listeners for additional accuracy
    const handleFocus = () => {
      console.log('Window focused - marking user ONLINE');
      updateStatusRef.current(true);
    };

    const handleBlur = () => {
      console.log('Window blurred - will check if user should be marked offline');
      // Don't immediately mark as offline on blur, wait for visibility change
      setTimeout(() => {
        if (document.visibilityState === 'hidden') {
          console.log('Window still hidden after blur - marking OFFLINE');
          updateStatusRef.current(false);
        }
      }, 5000); // 5 second delay before marking offline on blur
    };

    // Add page load/unload listeners
    const handlePageShow = () => {
      console.log('Page shown - marking user ONLINE');
      updateStatusRef.current(true);
    };

    const handlePageHide = () => {
      console.log('Page hidden - marking user OFFLINE');
      updateStatusRef.current(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('pagehide', handlePageHide);

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
      console.log('Cleaning up user presence hook - marking user OFFLINE');
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      if (updateStatusRef.current) {
        updateStatusRef.current.cancel(); // Cancel any pending debounced calls
        updateStatusRef.current(false); // Set status to offline immediately
      }
      
      supabase.removeChannel(channel);
      isInitializedRef.current = false;
    };
  }, [currentUser?.id, nearbyUsers, setNearbyUsers, chats, setChats]);
}
