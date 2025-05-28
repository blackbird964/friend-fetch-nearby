import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from '@/lib/supabase';
import { Chat } from '@/context/types';
import { toast } from 'sonner';

export function useFetchChats() {
  const { currentUser, setChats } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Optimized fetch function
  const fetchChats = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Fetching messages for user:", currentUser.id);
      
      // Get all messages involving the current user with a single optimized query
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: true }); // Changed to ascending to get proper chronological order
      
      if (error) {
        console.error('Error fetching messages:', error);
        setLoadError('Failed to load chats');
        toast.error('Failed to load chats');
        return;
      }
      
      console.log(`Fetched ${messages?.length || 0} messages`);
      
      if (!messages || messages.length === 0) {
        setChats([]);
        setIsLoading(false);
        return;
      }
      
      // Group messages by participant more efficiently
      const participantMap = new Map<string, any[]>();
      
      messages.forEach(msg => {
        const participantId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
        if (!participantMap.has(participantId)) {
          participantMap.set(participantId, []);
        }
        participantMap.get(participantId)!.push(msg);
      });
      
      // Fetch all profiles in parallel
      const participantIds = Array.from(participantMap.keys());
      const profilePromises = participantIds.map(id => getProfile(id));
      const profiles = await Promise.all(profilePromises);
      
      const chatsList: Chat[] = [];
      let totalUnread = 0;

      console.log(`Found ${participantIds.length} chat participants`);
      
      // Create chat objects more efficiently
      for (let i = 0; i < participantIds.length; i++) {
        const participantId = participantIds[i];
        const profile = profiles[i];
        
        if (profile) {
          const participantMessages = participantMap.get(participantId)!;
          
          // Sort messages chronologically to get the actual latest message
          participantMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          // Count unread messages
          const unreadMessages = participantMessages.filter(msg => 
            msg.sender_id === participantId && 
            msg.receiver_id === currentUser.id && 
            !msg.read
          );
          
          const unreadCount = unreadMessages.length;
          totalUnread += unreadCount;
          
          // Get the actual latest message (last in chronological order)
          const latestMessage = participantMessages[participantMessages.length - 1];
          
          if (latestMessage) {
            console.log(`Latest message for ${profile.name}:`, latestMessage.content, "at", latestMessage.created_at);
            
            chatsList.push({
              id: `chat-${participantId}`,
              name: profile.name || 'Anonymous',
              participants: [currentUser.id, participantId],
              participantId: participantId,
              participantName: profile.name || 'Anonymous',
              profilePic: profile.profile_pic || '',
              lastMessage: latestMessage.content,
              lastMessageTime: new Date(latestMessage.created_at).getTime(),
              messages: [],
              unreadCount: unreadCount,
            });
          }
        }
      }
      
      console.log(`Created ${chatsList.length} chat objects`);
      
      // Sort chats by latest message time (most recent first)
      chatsList.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
      
      // Update state in a single batch
      setChats(chatsList);
      setUnreadCount(totalUnread);
      setLoadError(null);
    } catch (err) {
      console.error('Error loading chats:', err);
      setLoadError('Failed to load chats');
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, setChats]);

  // Initial fetch
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `receiver_id=eq.${currentUser.id}` 
        },
        (payload) => {
          console.log('New message received in chat list:', payload);
          // Refresh chats when a new message is received
          fetchChats();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchChats]);

  return { 
    isLoading, 
    loadError, 
    unreadCount 
  };
}
