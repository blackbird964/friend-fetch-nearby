
import { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { formatMessages } from './utils/messageFormatters';

export function useFetchConversation(selectedChatId: string | null) {
  const { selectedChat, setSelectedChat, currentUser } = useAppContext();

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
          // Format messages and filter out meetup requests
          const formattedMessages = formatMessages(messages);
          console.log(`[useFetchConversation] Displaying ${formattedMessages.length} messages (filtered out meetup requests)`);
          
          // Update the selected chat with the messages
          setSelectedChat(prev => {
            if (!prev || prev.id !== selectedChatId) return prev;
            return {
              ...prev,
              messages: formattedMessages
            };
          });
        }
      } catch (error) {
        console.error('[useFetchConversation] Unexpected error:', error);
      }
    };

    fetchConversation();
  }, [selectedChatId, currentUser, selectedChat?.participantId, setSelectedChat]);

  return {
    isLoading: false,
    fetchError: null
  };
}
