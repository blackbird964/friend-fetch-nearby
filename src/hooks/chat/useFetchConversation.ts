
import { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { formatMessages } from './utils/messageFormatters';
import { markMessagesAsRead } from '@/lib/supabase/messages';

export function useFetchConversation(selectedChatId: string | null) {
  const { selectedChat, setSelectedChat, currentUser, setChats } = useAppContext();

  useEffect(() => {
    if (!selectedChatId || !currentUser || !selectedChat) return;

    const fetchConversation = async () => {
      console.log(`[useFetchConversation] Fetching conversation for chat: ${selectedChatId}`);
      
      try {
        const participantId = selectedChat.participantId;
        if (!participantId) {
          console.warn('[useFetchConversation] No participant ID found for selected chat');
          return;
        }

        // Fetch messages between current user and the participant
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${currentUser.id})`)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('[useFetchConversation] Error fetching messages:', error);
          return;
        }

        console.log(`[useFetchConversation] Fetched ${messages?.length || 0} messages`);
        
        if (messages) {
          // Mark unread messages from the other user as read
          const unreadMessages = messages.filter(msg => 
            msg.sender_id === participantId && 
            msg.receiver_id === currentUser.id && 
            !msg.read
          );
          
          if (unreadMessages.length > 0) {
            console.log(`[useFetchConversation] Marking ${unreadMessages.length} messages as read`);
            const messageIds = unreadMessages.map(msg => msg.id);
            await markMessagesAsRead(messageIds);
            
            // Update the chat list to reflect the read status
            setChats(prev => prev.map(chat => 
              chat.id === selectedChatId 
                ? { ...chat, unreadCount: 0 }
                : chat
            ));
          }
          
          // Format messages and filter out meetup requests
          const formattedMessages = formatMessages(messages);
          console.log(`[useFetchConversation] Displaying ${formattedMessages.length} messages (filtered out meetup requests)`);
          
          // Update the selected chat with the messages
          setSelectedChat(prev => {
            if (!prev || prev.id !== selectedChatId) return prev;
            return {
              ...prev,
              messages: formattedMessages,
              unreadCount: 0 // Reset unread count when chat is opened
            };
          });
        }
      } catch (error) {
        console.error('[useFetchConversation] Unexpected error:', error);
      }
    };

    fetchConversation();
  }, [selectedChatId, currentUser, selectedChat?.participantId, setSelectedChat, setChats]);

  return {
    isLoading: false,
    fetchError: null
  };
}
