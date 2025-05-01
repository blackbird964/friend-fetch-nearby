
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from '@/lib/supabase';
import { Chat } from '@/context/types';

export function useChatList() {
  const { currentUser, setChats } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch chats for current user when component mounts
  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        
        // Get all messages involving the current user
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }
        
        if (!messages || messages.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Group messages by the other participant
        const chatParticipants = new Set<string>();
        messages.forEach(msg => {
          const participantId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
          chatParticipants.add(participantId);
        });
        
        // Fetch profiles for all participants
        const participants = Array.from(chatParticipants);
        const chatsList: Chat[] = [];
        
        // Create a chat object for each participant
        for (const participantId of participants) {
          // Get the profile for this participant
          const profile = await getProfile(participantId);
          
          if (profile) {
            // Find the latest message with this participant
            const latestMessage = messages.find(msg => 
              msg.sender_id === participantId || msg.receiver_id === participantId
            );
            
            if (latestMessage) {
              // Create a chat object
              chatsList.push({
                id: `chat-${participantId}`,
                participantId: participantId,
                participantName: profile.name || 'Anonymous',
                profilePic: profile.profile_pic || '',
                lastMessage: latestMessage.content,
                lastMessageTime: new Date(latestMessage.created_at).getTime(),
                messages: [], // Messages will be loaded when chat is selected
              });
            }
          }
        }
        
        // Sort chats by latest message
        chatsList.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        
        // Update the chats state
        setChats(chatsList);
      } catch (err) {
        console.error('Error loading chats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [currentUser, setChats]);

  return { isLoading };
}
