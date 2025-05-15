
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Chat, Message, MessageStatus } from '@/context/types';
import { markMessagesAsRead } from '@/lib/supabase';
import { toast } from 'sonner';
import { useMessageCache } from './useMessageCache';

/**
 * Hook for loading and paginating messages
 */
export function useMessageLoader(
  selectedChat: Chat | null,
  currentUserId: string | undefined,
  setSelectedChat: (chat: Chat) => void,
  updateUnreadCounts: (chatId: string) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [page, setPage] = useState(0);
  
  const initialMessageCount = 10; // Initial number of messages to load
  const PAGE_SIZE = 10; // Number of messages per page
  const { getCachedMessages, setCachedMessages, isCacheValid } = useMessageCache();
  
  // Reset state when selected chat changes
  useEffect(() => {
    setIsLoading(selectedChat !== null);
    setFetchError(null);
    setPage(0);
    setHasMoreMessages(false);
  }, [selectedChat?.id]);

  // Fetch conversation when selected chat changes, with caching and pagination
  useEffect(() => {
    let isMounted = true;
    
    const fetchConversation = async () => {
      if (!selectedChat || !currentUserId) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching conversation for chat:", selectedChat.id, selectedChat.participantId);
        
        // Use cached messages if they're recent enough and on first page
        if (isCacheValid(selectedChat.id) && page === 0) {
          console.log("Using cached messages for chat:", selectedChat.id);
          
          const cachedMessages = getCachedMessages(selectedChat.id);
          
          // Update selected chat with cached messages
          const updatedChat: Chat = {
            ...selectedChat,
            messages: cachedMessages,
            unreadCount: 0, // Set to zero since we're viewing this chat
          };
          
          setSelectedChat(updatedChat);
          setIsLoading(false);
          
          // Still mark messages as read in the background
          markUnreadMessagesAsRead(selectedChat.participantId);
          return;
        }
        
        // Calculate message range based on current page
        const messageCount = page === 0 ? initialMessageCount : PAGE_SIZE;
        const from = page * PAGE_SIZE;
        const to = from + messageCount - 1;
        
        console.log(`Fetching messages for chat ${selectedChat.id}, range: ${from}-${to}`);
        
        // Get conversation with pagination - only essential fields
        const { data: dbMessages, error, count } = await supabase
          .from('messages')
          .select('id, sender_id, receiver_id, content, created_at, read', { count: 'exact' })
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedChat.participantId}),and(sender_id.eq.${selectedChat.participantId},receiver_id.eq.${currentUserId})`)
          .order('created_at', { ascending: false })
          .range(from, to);
        
        if (error) throw error;
        
        // Check if component is still mounted
        if (!isMounted) return;
        
        // Check if there are more messages to load
        if (count) {
          setHasMoreMessages(from + messageCount < count);
        }
        
        console.log(`Fetched ${dbMessages?.length} messages for chat:`, selectedChat.id);
        
        // Transform database messages to our app format
        const formattedMessages: Message[] = dbMessages.map(dbMsg => ({
          id: dbMsg.id,
          chatId: selectedChat.id,
          senderId: dbMsg.sender_id === currentUserId ? 'current' : selectedChat.participantId,
          text: dbMsg.content,
          content: dbMsg.content,
          timestamp: new Date(dbMsg.created_at).getTime(),
          status: dbMsg.sender_id === currentUserId ? 'sent' as MessageStatus : 'received' as MessageStatus,
        })).reverse(); // Reverse to get chronological order
        
        // On first page, replace cache. On subsequent pages, append to existing messages
        if (page === 0) {
          setCachedMessages(selectedChat.id, formattedMessages);
          
          // Update selected chat with new messages
          const updatedChat: Chat = {
            ...selectedChat,
            messages: formattedMessages,
            unreadCount: 0, // Set to zero since we're viewing this chat
          };
          
          setSelectedChat(updatedChat);
        } else {
          // For additional pages, prepend the older messages
          const existingMessages = selectedChat.messages || [];
          const allMessages = [...formattedMessages, ...existingMessages];
          
          // Update cache
          setCachedMessages(selectedChat.id, allMessages);
          
          // Update selected chat
          const updatedChat: Chat = {
            ...selectedChat,
            messages: allMessages,
          };
          
          setSelectedChat(updatedChat);
        }
        
        // Mark unread messages as read
        markUnreadMessagesAsRead(selectedChat.participantId);
        
        setFetchError(null);
      } catch (err) {
        console.error("Error fetching conversation:", err);
        setFetchError("Failed to load messages. Please try again.");
        if (isMounted) {
          toast.error("Failed to load messages");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    const markUnreadMessagesAsRead = async (participantId: string) => {
      if (!currentUserId) return;
      
      try {
        // Only get message IDs to mark as read
        const { data: unreadIds } = await supabase
          .from('messages')
          .select('id')
          .eq('sender_id', participantId)
          .eq('receiver_id', currentUserId)
          .eq('read', false);
          
        if (unreadIds && unreadIds.length > 0) {
          const ids = unreadIds.map(item => item.id);
          await markMessagesAsRead(ids);
          
          // Update the unread count for this chat
          updateUnreadCounts(selectedChat.id);
        }
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    };

    if (selectedChat && currentUserId) {
      console.log("Selected chat changed, fetching messages...");
      fetchConversation();
    } else {
      setIsLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [selectedChat, currentUserId, page, setSelectedChat, updateUnreadCounts]);

  const loadMoreMessages = () => {
    if (hasMoreMessages && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  return {
    isLoading,
    fetchError,
    hasMoreMessages,
    loadMoreMessages
  };
}
