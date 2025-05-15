
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { getConversation, sendMessage, markMessagesAsRead } from '@/lib/supabase';
import { Message, Chat } from '@/context/types';
import { toast } from 'sonner';

export function useChat(selectedChatId: string | null) {
  const { selectedChat, setSelectedChat, chats, setChats, currentUser, setUnreadMessageCount } = useAppContext();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const messagesCache = useRef<Record<string, Message[]>>({});
  const lastFetchTime = useRef<Record<string, number>>({});

  // Reset state when selectedChatId changes
  useEffect(() => {
    setMessage('');
    setIsLoading(selectedChatId !== null);
    setFetchError(null);
  }, [selectedChatId]);

  // Fetch conversation when selected chat changes, with caching
  useEffect(() => {
    let isMounted = true;
    const CACHE_TTL = 60000; // 1 minute cache validity
    
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
        if (cachedMessages.length > 0 && now - lastFetch < CACHE_TTL) {
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
          markUnreadMessagesAsRead(cachedMessages);
          return;
        }
        
        // Only fetch essential data
        const dbMessages = await getConversation(selectedChat.participantId);
        
        // Check if component is still mounted
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
        messagesCache.current[selectedChat.id] = formattedMessages;
        lastFetchTime.current[selectedChat.id] = now;
        
        // Mark unread messages as read
        markUnreadMessagesAsRead(dbMessages);
        
        // Update selected chat with messages from the database
        const updatedChat: Chat = {
          ...selectedChat,
          messages: formattedMessages,
          unreadCount: 0, // Set to zero since we're viewing this chat
        };
        
        if (formattedMessages.length > 0) {
          const lastMsg = formattedMessages[formattedMessages.length - 1];
          updatedChat.lastMessage = lastMsg.text || lastMsg.content || '';
          updatedChat.lastMessageTime = typeof lastMsg.timestamp === 'string' 
            ? parseInt(lastMsg.timestamp, 10) 
            : lastMsg.timestamp;
        }
        
        setSelectedChat(updatedChat);
        
        // Update chat in the list
        setChats(
          chats.map(chat => 
            chat.id === selectedChat.id ? updatedChat : chat
          )
        );
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
    
    const markUnreadMessagesAsRead = async (messages: any[]) => {
      if (!currentUser) return;
      
      const unreadMessageIds = messages
        .filter(msg => !msg.read && msg.receiver_id === currentUser.id)
        .map(msg => msg.id);
        
      if (unreadMessageIds.length > 0) {
        await markMessagesAsRead(unreadMessageIds);
        
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
  }, [selectedChatId, currentUser, selectedChat, setSelectedChat, chats, setChats, setUnreadMessageCount]);

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
    handleSendMessage
  };
}

export default useChat;
