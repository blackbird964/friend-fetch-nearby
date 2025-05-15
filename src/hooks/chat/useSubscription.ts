
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppUser } from '@/context/types';

/**
 * Hook to set up real-time message subscription
 */
export function useMessageSubscription(currentUser: AppUser | null, onNewMessage: () => void) {
  const subscriptionRef = useRef<any>(null);

  // Setup subscription for new messages
  useEffect(() => {
    if (!currentUser) return;
    
    // Clean up previous subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }
    
    // Set up a subscription for new messages with more specific filters
    subscriptionRef.current = supabase
      .channel('filtered-messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUser.id}` },
        (payload) => {
          console.log('New message received:', payload);
          // Refresh chats when a new message is received
          onNewMessage();
        }
      )
      .subscribe();
    
    // Clean up subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [currentUser, onNewMessage]);
}
