
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { getConversation, sendMessage, markMessagesAsRead } from '@/lib/supabase';
import { Message, Chat } from '@/context/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Helper function to ensure timestamp is always a number
const normalizeTimestamp = (timestamp: string | number): number => {
  return typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
};

export function useChat(selectedChatId: string | null) {
  const { selectedChat, setSelectedChat, chats, setChats, currentUser, setUnreadMessageCount } = useAppContext();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const lastFetchedChatId = useRef<string | null>(null);
  const messagesCache = useRef<Map<string, Message[]>>(new Map());

  // Reset state when selectedChatId changes
  useEffect(() => {
    setMessage('');
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
        const cached = messagesCache.current.get(selectedChat.id);
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
        
        // Transform database messages to our app format
        const formattedMessages: Message[] = dbMessages.map(dbMsg => ({
          id: dbMsg.id,
          chatId: selectedChat.id,
          senderId: dbMsg.sender_id === currentUser.id ? 'current' : selectedChat.participantId,
          text: dbMsg.content,
          content: dbMsg.content,
          timestamp: new Date(dbMsg.created_at).getTime(),
          status: dbMsg.sender_id === currentUser.id ? 'sent' : 'received',
        }));
        
        // Cache the messages
        messagesCache.current.set(selectedChat.id, formattedMessages);
        
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
        
        if (formattedMessages.length > 0) {
          const lastMsg = formattedMessages[formattedMessages.length - 1];
          updatedChat.lastMessage = lastMsg.text || lastMsg.content || '';
          updatedChat.lastMessageTime = normalizeTimestamp(lastMsg.timestamp);
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

  // Real-time message subscription
  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    const channel = supabase
      .channel(`chat-${selectedChat.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedChat.participantId}),and(sender_id.eq.${selectedChat.participantId},receiver_id.eq.${currentUser.id}))`
        },
        (payload) => {
          console.log('New message received via realtime:', payload);
          const newDbMessage = payload.new;
          
          // Don't add our own sent messages (they're already added optimistically)
          if (newDbMessage.sender_id === currentUser.id) return;
          
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
          const cached = messagesCache.current.get(selectedChat.id) || [];
          const updatedMessages = [...cached, newMessage];
          messagesCache.current.set(selectedChat.id, updatedMessages);
          
          // Update selected chat
          setSelectedChat((prev: Chat | null) => {
            if (!prev || prev.id !== selectedChat.id) return prev;
            return {
              ...prev,
              messages: [...(prev.messages || []), newMessage],
              lastMessage: newMessage.text || newMessage.content || '',
              lastMessageTime: normalizeTimestamp(newMessage.timestamp),
            };
          });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat?.id, currentUser?.id]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChat || !message.trim() || !currentUser || isSending) return;
    
    const originalMessage = message.trim();
    const tempId = `temp-${Date.now()}`;
    const currentTimestamp = Date.now();
    
    // Optimistic update - add message immediately
    const optimisticMessage: Message = {
      id: tempId,
      chatId: selectedChat.id,
      senderId: 'current',
      text: originalMessage,
      content: originalMessage,
      timestamp: currentTimestamp,
      status: 'sending',
    };
    
    setMessage(''); // Clear input immediately
    setIsSending(true);
    
    // Update UI immediately
    setSelectedChat((prev: Chat | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...(prev.messages || []), optimisticMessage],
        lastMessage: originalMessage,
        lastMessageTime: currentTimestamp,
      };
    });
    
    try {
      console.log("Sending message:", originalMessage);
      
      // Save the message in the database
      const sentMessage = await sendMessage(selectedChat.participantId, originalMessage);
      
      if (!sentMessage) {
        throw new Error("Failed to send message");
      }
      
      console.log("Message sent successfully:", sentMessage);
      
      // Replace optimistic message with real one
      const realMessage: Message = {
        id: sentMessage.id,
        chatId: selectedChat.id,
        senderId: 'current',
        text: sentMessage.content,
        content: sentMessage.content,
        timestamp: new Date(sentMessage.created_at).getTime(),
        status: 'sent',
      };
      
      // Update cache
      const cached = messagesCache.current.get(selectedChat.id) || [];
      const updatedCache = cached.map(msg => 
        msg.id === tempId ? realMessage : msg
      );
      messagesCache.current.set(selectedChat.id, updatedCache);
      
      // Update selected chat and chats list
      setSelectedChat((prev: Chat | null) => {
        if (!prev) return prev;
        const updatedMessages = prev.messages.map(msg => 
          msg.id === tempId ? realMessage : msg
        );
        return {
          ...prev,
          messages: updatedMessages,
          lastMessage: originalMessage,
          lastMessageTime: new Date(sentMessage.created_at).getTime(),
        };
      });
      
      setChats((prevChats: Chat[]) =>
        prevChats.map(chat => 
          chat.id === selectedChat.id 
            ? {
                ...chat,
                lastMessage: originalMessage,
                lastMessageTime: new Date(sentMessage.created_at).getTime(),
              }
            : chat
        )
      );
    } catch (err) {
      console.error("Error sending message:", err);
      
      // Remove optimistic message on error
      setSelectedChat((prev: Chat | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter(msg => msg.id !== tempId),
        };
      });
      
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  }, [message, selectedChat, currentUser, setChats, setSelectedChat, isSending]);

  return {
    message,
    setMessage,
    isLoading,
    fetchError,
    handleSendMessage
  };
}

export default useChat;
