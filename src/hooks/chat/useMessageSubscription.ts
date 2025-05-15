
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, Chat } from '@/context/types';
import { markMessagesAsRead } from '@/lib/supabase';

/**
 * Hook to set up real-time message subscription
 */
export function useMessageSubscription(
  selectedChat: Chat | null,
  currentUserId: string | undefined,
  updateMessages: (newMessage: Message) => void
) {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!selectedChat || !currentUserId) return;
    
    console.log("Setting up chat subscription for:", selectedChat.participantId);
    
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    channelRef.current = supabase
      .channel(`chat-${selectedChat.participantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedChat.participantId}),and(sender_id.eq.${selectedChat.participantId},receiver_id.eq.${currentUserId}))`
        },
        (payload) => {
          const newDbMessage = payload.new as any;
          if (newDbMessage.sender_id !== currentUserId) {
            // Message from the other user - create message object
            const newMessage: Message = {
              id: newDbMessage.id,
              chatId: selectedChat.id,
              senderId: selectedChat.participantId,
              text: newDbMessage.content,
              content: newDbMessage.content,
              timestamp: new Date(newDbMessage.created_at).getTime(),
              status: 'received',
            };
            
            // Pass the new message up to be handled
            updateMessages(newMessage);
            
            // Mark as read since we're viewing this chat
            markMessagesAsRead([newDbMessage.id]);
          }
        }
      )
      .subscribe();
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [selectedChat, currentUserId, updateMessages]);
}
