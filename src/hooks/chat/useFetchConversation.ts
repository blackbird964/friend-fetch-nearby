
import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { getConversation, markMessagesAsRead } from '@/lib/supabase';
import { Message, Chat } from '@/context/types';
import { toast } from 'sonner';
import { formatDbMessageToAppMessage } from './utils/messageFormatters';
import { normalizeTimestamp } from './utils/timestampUtils';
import { useMessageCache } from './useMessageCache';

export function useFetchConversation(selectedChatId: string | null) {
  const { selectedChat, setSelectedChat, chats, setChats, currentUser, setUnreadMessageCount } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const lastFetchedChatId = useRef<string | null>(null);
  const { getCachedMessages, setCachedMessages } = useMessageCache();

  // Reset state when selectedChatId changes
  useEffect(() => {
    setFetchError(null);
    if (selectedChatId !== lastFetchedChatId.current) {
      setIsLoading(true);
    }
  }, [selectedChatId]);

  // Optimized conversation fetching with caching
  useEffect(() => {
    let isMounted = true;
    
    const fetchConversation = async () => {
      if (!selectedChat || !currentUser || selectedChatId === lastFetchedChatId.current) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      try {
        // Check cache first
        const cached = getCachedMessages(selectedChat.id);
        if (cached) {
          const updatedChat: Chat = {
            ...selectedChat,
            messages: cached,
            unreadCount: 0,
          };
          setSelectedChat(updatedChat);
          setIsLoading(false);
          lastFetchedChatId.current = selectedChatId;
          return;
        }

        console.log("Fetching conversation for chat:", selectedChat.id, selectedChat.participantId);
        
        // Fetch messages from the database
        const dbMessages = await getConversation(selectedChat.participantId);
        
        if (!isMounted) return;
        
        console.log(`Fetched ${dbMessages.length} messages for chat:`, selectedChat.id);
        
        // Transform database messages to our app format and sort by timestamp
        const formattedMessages: Message[] = dbMessages
          .map(dbMsg => formatDbMessageToAppMessage(dbMsg, selectedChat, currentUser.id))
          .sort((a, b) => {
            const timestampA = normalizeTimestamp(a.timestamp);
            const timestampB = normalizeTimestamp(b.timestamp);
            return timestampA - timestampB; // Sort ascending (oldest first)
          });
        
        console.log("Formatted and sorted messages:", formattedMessages.length);
        
        // Cache the messages
        setCachedMessages(selectedChat.id, formattedMessages);
        
        // Mark unread messages as read
        const unreadMessageIds = dbMessages
          .filter(msg => !msg.read && msg.receiver_id === currentUser.id)
          .map(msg => msg.id);
          
        if (unreadMessageIds.length > 0) {
          await markMessagesAsRead(unreadMessageIds);
          
          // Update the unread count for this chat efficiently
          setChats((prevChats: Chat[]) => {
            const updatedChats = prevChats.map(chat => {
              if (chat.id === selectedChat.id) {
                return { ...chat, unreadCount: 0 };
              }
              return chat;
            });
            
            // Recalculate total unread messages
            const totalUnread = updatedChats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
            setUnreadMessageCount(totalUnread);
            
            return updatedChats;
          });
        }
        
        // Update selected chat with messages from the database
        const updatedChat: Chat = {
          ...selectedChat,
          messages: formattedMessages,
          unreadCount: 0,
        };
        
        // Update last message info with the actual last message (most recent)
        if (formattedMessages.length > 0) {
          const lastMsg = formattedMessages[formattedMessages.length - 1]; // Get last message (most recent)
          updatedChat.lastMessage = lastMsg.text || lastMsg.content || '';
          updatedChat.lastMessageTime = normalizeTimestamp(lastMsg.timestamp);
          console.log("Updated last message:", updatedChat.lastMessage, "at", new Date(updatedChat.lastMessageTime));
        }
        
        setSelectedChat(updatedChat);
        lastFetchedChatId.current = selectedChatId;
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

    if (selectedChat && currentUser) {
      fetchConversation();
    } else {
      setIsLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [selectedChatId, currentUser?.id, selectedChat?.id]);

  return {
    isLoading,
    fetchError
  };
}
