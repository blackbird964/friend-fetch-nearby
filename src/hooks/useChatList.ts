
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from '@/lib/supabase';
import { Chat, Message as MessageType } from '@/context/types';
import { toast } from 'sonner';
import { debounce } from 'lodash';

// Define proper types for conversation objects
interface Conversation {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  other_user_id: string;
}

export function useChatList() {
  const { currentUser, setChats } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatCacheRef = useRef<Map<string, { profile: any, lastMessage: any, timestamp: number }>>(new Map());
  const lastFetchRef = useRef<number>(0);
  const MESSAGE_BATCH_SIZE = 25; // Reduced batch size
  const CACHE_TTL = 600000; // 10 minutes cache validity
  const subscriptionRef = useRef<any>(null);

  // Debounced fetch function to prevent multiple rapid fetches
  const debouncedFetch = useCallback(
    debounce((forceRefresh: boolean = false) => fetchChats(forceRefresh), 500),
    [currentUser]
  );

  // Fetch chats for current user when component mounts
  const fetchChats = async (forceRefresh: boolean = false) => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    
    try {
      const now = Date.now();
      
      // Skip fetching if we've fetched recently, unless forced
      if (!forceRefresh && now - lastFetchRef.current < 30000) {
        console.log("Skipping chat list fetch - throttled");
        return;
      }
      
      setIsLoading(true);
      lastFetchRef.current = now;
      
      console.log("Fetching messages for user:", currentUser.id);
      
      // Get only the most recent message for each conversation
      const { data: conversations, error: convError } = await supabase.rpc<Conversation, { user_id: string, limit_per_conversation: number }>(
        'get_unique_conversations',
        { user_id: currentUser.id, limit_per_conversation: 1 }
      );
      
      if (convError) {
        // Fallback to manual query if RPC function doesn't exist
        const { data: messages, error } = await supabase
          .from('messages')
          .select('id, sender_id, receiver_id, content, created_at, read')
          .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
          .order('created_at', { ascending: false })
          .limit(MESSAGE_BATCH_SIZE);
        
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
        
        // Group messages by the other participant
        const participantMessages = new Map<string, any[]>();
        messages.forEach(msg => {
          const participantId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
          if (!participantMessages.has(participantId)) {
            participantMessages.set(participantId, []);
          }
          participantMessages.get(participantId)?.push(msg);
        });
        
        processChatParticipants(Array.from(participantMessages.entries()), now);
      } else {
        // Process conversations from RPC function
        console.log(`Fetched ${conversations?.length || 0} conversations`);
        
        if (!conversations || conversations.length === 0) {
          setChats([]);
          setIsLoading(false);
          return;
        }
        
        // Group by participant
        const participantMessages = new Map<string, any[]>();
        conversations?.forEach((conv: Conversation) => {
          const participantId = conv.other_user_id;
          if (!participantMessages.has(participantId)) {
            participantMessages.set(participantId, []);
          }
          participantMessages.get(participantId)?.push(conv);
        });
        
        processChatParticipants(Array.from(participantMessages.entries()), now);
      }
    } catch (err) {
      console.error('Error loading chats:', err);
      setLoadError('Failed to load chats');
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process chat participants and create chat objects
  const processChatParticipants = async (participants: [string, any[]][], now: number) => {
    // Create a chat object for each participant
    const chatsList: Chat[] = [];
    let totalUnread = 0;

    console.log(`Found ${participants.length} chat participants`);
    
    // Process each participant
    for (const [participantId, participantMsgs] of participants) {
      // Use cached profile if available and not expired
      let profile;
      let shouldFetchProfile = true;
      
      if (chatCacheRef.current.has(participantId)) {
        const cache = chatCacheRef.current.get(participantId);
        if (cache && now - cache.timestamp < CACHE_TTL) {
          profile = cache.profile;
          shouldFetchProfile = false;
          console.log("Using cached profile for:", participantId);
        }
      }
      
      // Fetch profile only if needed
      if (shouldFetchProfile) {
        profile = await getProfile(participantId);
        if (profile) {
          // Update cache
          if (chatCacheRef.current.has(participantId)) {
            const existing = chatCacheRef.current.get(participantId);
            chatCacheRef.current.set(participantId, { 
              ...existing!,
              profile, 
              timestamp: now 
            });
          } else {
            chatCacheRef.current.set(participantId, { 
              profile, 
              lastMessage: participantMsgs[0], 
              timestamp: now 
            });
          }
        }
      }
      
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
    
    console.log(`Created ${chatsList.length} chat objects`);
    
    // Sort chats by latest message
    chatsList.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    
    // Update the chats state
    setChats(chatsList);
    setUnreadCount(totalUnread);
    setLoadError(null);
  };

  // Setup subscription and initial fetch
  useEffect(() => {
    let isMounted = true;
    
    if (currentUser) {
      // Initial fetch
      fetchChats();
      
      // Set up a subscription for new messages - using more specific filters
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      
      subscriptionRef.current = supabase
        .channel('filtered-messages')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUser.id}` },
          (payload) => {
            console.log('New message received:', payload);
            // Refresh chats when a new message is received - debounced to prevent multiple fetches
            debouncedFetch();
          }
        )
        .subscribe();
    }
    
    // Clean up subscription
    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [currentUser, debouncedFetch]);

  return { 
    isLoading, 
    loadError, 
    unreadCount, 
    refreshChats: () => fetchChats(true) 
  };
}

// Add this RPC function to Supabase to optimize chat fetching
// Use this in a SQL migration if you want to create it
/*
CREATE OR REPLACE FUNCTION get_unique_conversations(
  user_id UUID,
  limit_per_conversation INTEGER DEFAULT 1
)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  receiver_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  read BOOLEAN,
  other_user_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_messages AS (
    SELECT 
      m.id,
      m.sender_id,
      m.receiver_id,
      m.content,
      m.created_at,
      m.read,
      CASE 
        WHEN m.sender_id = user_id THEN m.receiver_id 
        ELSE m.sender_id 
      END AS other_user_id,
      ROW_NUMBER() OVER (
        PARTITION BY 
          CASE 
            WHEN m.sender_id = user_id THEN m.receiver_id 
            ELSE m.sender_id 
          END
        ORDER BY m.created_at DESC
      ) as rn
    FROM 
      messages m
    WHERE 
      m.sender_id = user_id OR m.receiver_id = user_id
  )
  SELECT 
    rm.id,
    rm.sender_id,
    rm.receiver_id,
    rm.content,
    rm.created_at,
    rm.read,
    rm.other_user_id
  FROM 
    ranked_messages rm
  WHERE 
    rm.rn <= limit_per_conversation
  ORDER BY 
    rm.created_at DESC;
END;
$$;
*/
