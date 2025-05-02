
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';

export function useUserPresence() {
  const { currentUser, nearbyUsers, setNearbyUsers, chats, setChats } = useAppContext();

  // Update the user's online status when they connect/disconnect
  useEffect(() => {
    if (!currentUser?.id) return;

    // Mark the current user as online
    const updateUserStatus = async (isOnline: boolean) => {
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
    };

    // Mark user as online when they load the app
    updateUserStatus(true);

    // Set up event listeners to handle page visibility changes and before unload
    const handleVisibilityChange = () => {
      updateUserStatus(document.visibilityState === 'visible');
    };

    const handleBeforeUnload = () => {
      // Attempt to update status before the user leaves
      navigator.sendBeacon(
        `${supabase.supabaseUrl}/rest/v1/profiles?id=eq.${currentUser.id}`,
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
                  ? { ...user, isOnline: updatedProfile.is_online } 
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

    // Clean up function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateUserStatus(false);
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, nearbyUsers, setNearbyUsers, chats, setChats]);
}
