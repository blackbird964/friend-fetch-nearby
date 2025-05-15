
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from '@/lib/supabase';
import { AppUser, Chat } from '@/context/types';
import { Conversation, ChatCacheItem, ChatParticipant } from './types';

// Constants
const MESSAGE_BATCH_SIZE = 25;
const CACHE_TTL = 600000; // 10 minutes

/**
 * Fetches messages from Supabase for the current user
 */
export async function fetchConversations(userId: string) {
  console.log("Fetching messages for user:", userId);
  
  try {
    // Get only the most recent message for each conversation
    const { data: conversations, error: convError } = await supabase.rpc(
      'get_unique_conversations',
      { user_id: userId, limit_per_conversation: 1 }
    );
    
    if (convError) {
      // Fallback to manual query if RPC function doesn't exist
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, created_at, read')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(MESSAGE_BATCH_SIZE);
      
      if (error) {
        console.error('Error fetching messages:', error);
        throw new Error('Failed to load chats');
      }
      
      console.log(`Fetched ${messages?.length || 0} messages`);
      
      if (!messages || messages.length === 0) {
        return [];
      }
      
      // Group messages by the other participant
      const participantMessages = new Map<string, any[]>();
      messages.forEach(msg => {
        const participantId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (!participantMessages.has(participantId)) {
          participantMessages.set(participantId, []);
        }
        participantMessages.get(participantId)?.push(msg);
      });
      
      return Array.from(participantMessages.entries());
    } else {
      // Process conversations from RPC function
      console.log(`Fetched ${conversations?.length || 0} conversations`);
      
      if (!conversations || conversations.length === 0) {
        return [];
      }
      
      // Group by participant
      const participantMessages = new Map<string, any[]>();
      (conversations as Conversation[])?.forEach((conv: Conversation) => {
        const participantId = conv.other_user_id;
        if (!participantMessages.has(participantId)) {
          participantMessages.set(participantId, []);
        }
        participantMessages.get(participantId)?.push(conv);
      });
      
      return Array.from(participantMessages.entries());
    }
  } catch (err) {
    console.error('Error loading chats:', err);
    throw new Error('Failed to load chats');
  }
}

/**
 * Process chat participants and create chat objects
 */
export async function processChatParticipants(
  participants: ChatParticipant[],
  currentUser: AppUser,
  chatCache: Map<string, ChatCacheItem>,
  now: number
): Promise<{ chats: Chat[], unreadCount: number }> {
  // Create a chat object for each participant
  const chatsList: Chat[] = [];
  let totalUnread = 0;

  console.log(`Found ${participants.length} chat participants`);
  
  // Process each participant
  for (const [participantId, participantMsgs] of participants) {
    // Use cached profile if available and not expired
    let profile;
    let shouldFetchProfile = true;
    
    if (chatCache.has(participantId)) {
      const cache = chatCache.get(participantId);
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
        if (chatCache.has(participantId)) {
          const existing = chatCache.get(participantId);
          chatCache.set(participantId, { 
            ...existing!,
            profile, 
            timestamp: now 
          });
        } else {
          chatCache.set(participantId, { 
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
  
  return { 
    chats: chatsList, 
    unreadCount: totalUnread 
  };
}
