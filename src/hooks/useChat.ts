
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { getConversation, sendMessage, markMessagesAsRead } from '@/lib/supabase';
import { Message, Chat } from '@/context/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useChat(selectedChatId: string | null) {
  const { selectedChat, setSelectedChat, chats, setChats, currentUser, setUnreadMessageCount } = useAppContext();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [page, setPage] = useState(0);
  const messagesCache = useRef<Record<string, Message[]>>({});
  const lastFetchTime = useRef<Record<string, number>>({});
  const channelRef = useRef<any>(null);
  const initialMessageCount = 10; // Initial number of messages to load
  const PAGE_SIZE = 10; // Number of additional messages to load when paginating

  // Reset state when selectedChatId changes
  useEffect(() => {
    setMessage('');
    setIsLoading(selectedChatId !== null);
    setFetchError(null);
    setPage(0);
    setHasMoreMessages(false);
  }, [selectedChatId]);

  // Setup realtime subscription for the selected chat
  useEffect(() => {
    if (!selectedChat || !currentUser) return;
    
    console.log("Setting up chat subscription for:", selectedChat.participantId);
    
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    channelRef.current = supabase
      .channel(`chat-${selectedChat.participantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedChat.participantId}),and(sender_id.eq.${selectedChat.participantId},receiver_id.eq.${currentUser.id}))`
        },
        (payload) => {
          const newDbMessage = payload.new as any;
          if (newDbMessage.sender_id !== currentUser.id) {
            // Message from the other user - add to our chat
            const newMessage: Message = {
              id: newDbMessage.id,
              chatId: selectedChat.id,
              senderId: selectedChat.participantId,
              text: newDbMessage.content,
              content: newDbMessage.content,
              timestamp: new Date(newDbMessage.created_at).getTime(),
              status: 'received',
            };
            
            // Update cache
            const currentCachedMessages = messagesCache.current[selectedChat.id] || [];
            messagesCache.current[selectedChat.id] = [...currentCachedMessages, newMessage];
            
            // Update selected chat
            if (selectedChat.messages) {
              const updatedChat: Chat = {
                ...selectedChat,
                messages: [...selectedChat.messages, newMessage],
                lastMessage: newDbMessage.content,
                lastMessageTime: new Date(newDbMessage.created_at).getTime(),
              };
              setSelectedChat(updatedChat);
            }
            
            // Mark as read since we're viewing this chat
            markMessagesAsRead([newDbMessage.id]);
          }
        }
      )
      .subscribe();
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [selectedChat, currentUser, setSelectedChat]);

  // Fetch conversation when selected chat changes, with caching and pagination
  useEffect(() => {
    let isMounted = true;
    const CACHE_TTL = 120000; // 2 minutes cache validity
    
    const fetchConversation = async () => {
      if (!selectedChat || !currentUser) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching conversation for chat:", selectedChat.id, selectedChat.participantId);
        
        const now = Date.now();
        const lastFetch = lastFetchTime.current[selectedChat.id] || 0;
        const cachedMessages = messagesCache.current[selectedChat.id] || [];
        
        // Use cached messages if they're recent enough
        if (cachedMessages.length > 0 && now - lastFetch < CACHE_TTL && page === 0) {
          console.log("Using cached messages for chat:", selectedChat.id);
          
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
        
        // Fetch paginated messages with a specific range
        console.log(`Fetching messages for chat ${selectedChat.id}, range: ${from}-${to}`);
        
        // Get conversation with pagination - only essential fields
        const { data: dbMessages, error, count } = await supabase
          .from('messages')
          .select('id, sender_id, receiver_id, content, created_at, read', { count: 'exact' })
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedChat.participantId}),and(sender_id.eq.${selectedChat.participantId},receiver_id.eq.${currentUser.id})`)
          .order('created_at', { ascending: false })
          .range(from, to);
        
        if (error) throw error;
        
        // Check if component is still mounted
        if (!isMounted) return;
        
        // Check if there are more messages to load
        if (count) {
          setHasMoreMessages(from + messageCount < count);
        }
        
        console.log(`Fetched ${dbMessages.length} messages for chat:`, selectedChat.id);
        
        // Transform database messages to our app format
        const formattedMessages: Message[] = dbMessages.map(dbMsg => ({
          id: dbMsg.id,
          chatId: selectedChat.id,
          senderId: dbMsg.sender_id === currentUser.id ? 'current' : selectedChat.participantId,
          text: dbMsg.content,
          content: dbMsg.content,
          timestamp: new Date(dbMsg.created_at).getTime(),
          status: dbMsg.sender_id === currentUser.id ? 'sent' : 'received',
        })).reverse(); // Reverse to get chronological order
        
        // On first page, replace cache. On subsequent pages, append to existing messages
        if (page === 0) {
          messagesCache.current[selectedChat.id] = formattedMessages;
          lastFetchTime.current[selectedChat.id] = now;
          
          // Update selected chat with new messages
          const updatedChat: Chat = {
            ...selectedChat,
            messages: formattedMessages,
            unreadCount: 0, // Set to zero since we're viewing this chat
          };
          
          setSelectedChat(updatedChat);
        } else {
          // For additional pages, prepend the older messages to the cached and displayed messages
          const existingMessages = selectedChat.messages || [];
          const allMessages = [...formattedMessages, ...existingMessages];
          
          // Update cache
          messagesCache.current[selectedChat.id] = allMessages;
          
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
      if (!currentUser) return;
      
      try {
        // Only get message IDs to mark as read
        const { data: unreadIds } = await supabase
          .from('messages')
          .select('id')
          .eq('sender_id', participantId)
          .eq('receiver_id', currentUser.id)
          .eq('read', false);
          
        if (unreadIds && unreadIds.length > 0) {
          const ids = unreadIds.map(item => item.id);
          await markMessagesAsRead(ids);
          
          // Update the unread count for this chat
          const updatedChats = chats.map(chat => {
            if (chat.id === selectedChat?.id) {
              return { ...chat, unreadCount: 0 };
            }
            return chat;
          });
          
          setChats(updatedChats);
          
          // Recalculate total unread messages
          const totalUnread = updatedChats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
          setUnreadMessageCount(totalUnread);
        }
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    };

    if (selectedChat && currentUser) {
      console.log("Selected chat changed, fetching messages...");
      fetchConversation();
    } else {
      setIsLoading(false);
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [selectedChatId, currentUser, selectedChat, setSelectedChat, chats, setChats, setUnreadMessageCount, page]);

  const loadMoreMessages = () => {
    if (hasMoreMessages && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChat || !message.trim() || !currentUser || isSending) return;
    
    const originalMessage = message.trim();
    setMessage(''); // Clear input field immediately for better UX
    setIsSending(true);
    
    try {
      console.log("Sending message:", originalMessage);
      
      // Save the message in the database
      const sentMessage = await sendMessage(selectedChat.participantId, originalMessage);
      
      if (!sentMessage) {
        console.error("Failed to send message");
        toast.error("Failed to send message");
        return;
      }
      
      console.log("Message sent successfully:", sentMessage);
      
      // Create the message object for our app
      const newMessage: Message = {
        id: sentMessage.id,
        chatId: selectedChat.id,
        senderId: 'current',
        text: sentMessage.content,
        content: sentMessage.content,
        timestamp: new Date(sentMessage.created_at).getTime(),
        status: 'sent',
      };
      
      // Update the messages cache
      const currentCachedMessages = messagesCache.current[selectedChat.id] || [];
      messagesCache.current[selectedChat.id] = [...currentCachedMessages, newMessage];
      lastFetchTime.current[selectedChat.id] = Date.now();
      
      // Update selected chat
      const updatedChat: Chat = {
        ...selectedChat,
        messages: [...(selectedChat.messages || []), newMessage],
        lastMessage: originalMessage,
        lastMessageTime: new Date(sentMessage.created_at).getTime(),
      };
      
      setChats(
        chats.map(chat => 
          chat.id === selectedChat.id ? updatedChat : chat
        )
      );
      
      setSelectedChat(updatedChat);
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  }, [message, selectedChat, currentUser, setChats, setSelectedChat, chats, isSending]);

  return {
    message,
    setMessage,
    isLoading,
    fetchError,
    handleSendMessage,
    hasMoreMessages,
    loadMoreMessages
  };
}

export default useChat;
