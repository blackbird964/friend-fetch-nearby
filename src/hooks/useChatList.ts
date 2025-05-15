
import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from '@/lib/supabase';
import { Chat, Message as MessageType } from '@/context/types';
import { toast } from 'sonner';

export function useChatList() {
  const { currentUser, setChats } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatCacheRef = useRef<Map<string, { profile: any, lastMessage: any }>>(new Map());

  // Fetch chats for current user when component mounts
  useEffect(() => {
    let isMounted = true;
    const MESSAGE_BATCH_SIZE = 50;
    
    const fetchChats = async () => {
      if (!currentUser) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        console.log("Fetching messages for user:", currentUser.id);
        
        // Get only the latest messages for each conversation to reduce data transfer
        // This query needs to be optimized on the database side ideally
        const { data: messages, error } = await supabase
          .from('messages')
          .select('id, sender_id, receiver_id, content, created_at, read')
          .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
          .order('created_at', { ascending: false })
          .limit(MESSAGE_BATCH_SIZE);
        
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
        const participantMessages = new Map<string, any[]>();
        messages.forEach(msg => {
          const participantId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
          if (!participantMessages.has(participantId)) {
            participantMessages.set(participantId, []);
          }
          participantMessages.get(participantId)?.push(msg);
        });
        
        // Create a chat object for each participant
        const chatsList: Chat[] = [];
        let totalUnread = 0;

        console.log(`Found ${participantMessages.size} chat participants`);
        
        // Process each participant
        for (const [participantId, participantMsgs] of participantMessages.entries()) {
          // Use cached profile if available
          let profile;
          if (chatCacheRef.current.has(participantId)) {
            profile = chatCacheRef.current.get(participantId)?.profile;
            console.log("Using cached profile for:", participantId);
          } else {
            profile = await getProfile(participantId);
            if (profile) {
              chatCacheRef.current.set(participantId, { 
                profile, 
                lastMessage: participantMsgs[0] 
              });
            }
          }
          
          if (!isMounted) return;
          
          if (profile) {
            // Count unread messages from this participant
            const unreadMessages = participantMsgs.filter(msg => 
              msg.sender_id === participantId && 
              msg.receiver_id === currentUser.id && 
              !msg.read
            );
            
            const unreadCount = unreadMessages.length;
            totalUnread += unreadCount;
            
            // Find the latest message with this participant
            const latestMessage = participantMsgs[0];
            
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
                messages: [], // Don't load all messages immediately
                unreadCount: unreadCount,
                isOnline: profile.is_online || false
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
        setUnreadCount(totalUnread);
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
    
    // Set up a subscription for new messages
    if (currentUser) {
      const channel = supabase
        .channel('public:messages')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUser.id}` },
          (payload) => {
            console.log('New message received:', payload);
            // Refresh chats when a new message is received
            fetchChats();
          }
        )
        .subscribe();
        
      // Clean up subscription
      return () => {
        supabase.removeChannel(channel);
        isMounted = false;
      };
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [currentUser, setChats]);

  return { isLoading, loadError, unreadCount };
}
