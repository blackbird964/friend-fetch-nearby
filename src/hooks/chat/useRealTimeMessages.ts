
import { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { createRealTimeMessage } from './utils/messageFormatters';
import { normalizeTimestamp } from './utils/timestampUtils';
import { useMessageCache } from './useMessageCache';
import { Chat } from '@/context/types';
import { markMessagesAsRead } from '@/lib/supabase/messages';

export function useRealTimeMessages() {
  const { selectedChat, setSelectedChat, currentUser, setChats } = useAppContext();
  const { addMessageToCache } = useMessageCache();

  // Real-time message subscription
  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    const channel = supabase
      .channel(`chat-${selectedChat.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedChat.participantId}),and(sender_id.eq.${selectedChat.participantId},receiver_id.eq.${currentUser.id}))`
        },
        async (payload) => {
          console.log('New message received via realtime:', payload);
          const newDbMessage = payload.new;
          
          // Don't add our own sent messages (they're already added optimistically)
          if (newDbMessage.sender_id === currentUser.id) return;
          
          const newMessage = createRealTimeMessage(newDbMessage, selectedChat);
          
          // Mark this message as read immediately since the chat is open
          if (newDbMessage.sender_id === selectedChat.participantId && newDbMessage.receiver_id === currentUser.id) {
            await markMessagesAsRead([newDbMessage.id]);
          }
          
          // Update cache
          addMessageToCache(selectedChat.id, newMessage);
          
          // Update selected chat
          setSelectedChat((prev: Chat | null) => {
            if (!prev || prev.id !== selectedChat.id) return prev;
            return {
              ...prev,
              messages: [...(prev.messages || []), newMessage],
              lastMessage: newMessage.text || newMessage.content || '',
              lastMessageTime: normalizeTimestamp(newMessage.timestamp),
              unreadCount: 0 // Keep it at 0 since we're marking as read
            };
          });

          // Update the chat in the chat list to reflect the new message
          setChats(prev => prev.map(chat => 
            chat.id === selectedChat.id 
              ? {
                  ...chat,
                  lastMessage: newMessage.text || newMessage.content || '',
                  lastMessageTime: normalizeTimestamp(newMessage.timestamp),
                  unreadCount: 0 // Message is read since chat is open
                }
              : chat
          ));
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat?.id, currentUser?.id, setSelectedChat, setChats, addMessageToCache]);
}
