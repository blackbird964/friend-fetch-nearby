
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from '@/lib/supabase';
import { Chat } from '@/context/types';
import { toast } from 'sonner';

export function useChatList() {
  const { currentUser, setChats } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch chats for current user when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const fetchChats = async () => {
      if (!currentUser) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        console.log("Fetching messages for user:", currentUser.id);
        
        // Get all messages involving the current user
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching messages:', error);
          setLoadError('Failed to load chats');
          if (isMounted) toast.error('Failed to load chats');
          return;
        }
        
        // Check if component is still mounted
        if (!isMounted) return;
        
        console.log(`Fetched ${messages?.length || 0} messages`);
        
        if (!messages || messages.length === 0) {
          setChats([]);
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

        console.log(`Found ${participants.length} chat participants`);
        
        // Create a chat object for each participant
        for (const participantId of participants) {
          // Get the profile for this participant
          const profile = await getProfile(participantId);
          
          if (!isMounted) return;
          
          if (profile) {
            // Find the latest message with this participant
            const latestMessage = messages.find(msg => 
              msg.sender_id === participantId || msg.receiver_id === participantId
            );
            
            if (latestMessage) {
              // Create a chat object with required properties
              chatsList.push({
                id: `chat-${participantId}`,
                name: profile.name || 'Anonymous',
                participants: [currentUser.id, participantId],
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
        
        // Check if component is still mounted
        if (!isMounted) return;
        
        console.log(`Created ${chatsList.length} chat objects`);
        
        // Sort chats by latest message
        chatsList.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
        
        // Update the chats state
        setChats(chatsList);
        setLoadError(null);
      } catch (err) {
        console.error('Error loading chats:', err);
        setLoadError('Failed to load chats');
        if (isMounted) toast.error('Failed to load chats');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchChats();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [currentUser, setChats]);

  return { isLoading, loadError };
}
