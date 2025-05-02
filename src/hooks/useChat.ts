
import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { getConversation, sendMessage, markMessagesAsRead } from '@/lib/supabase';
import { Message } from '@/context/types';
import { toast } from 'sonner';

export function useChat(selectedChatId: string | null) {
  const { selectedChat, setSelectedChat, chats, setChats, currentUser } = useAppContext();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Reset state when selectedChatId changes
  useEffect(() => {
    setMessage('');
    setIsLoading(selectedChatId !== null);
    setFetchError(null);
  }, [selectedChatId]);

  // Fetch conversation when selected chat changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchConversation = async () => {
      if (!selectedChat || !currentUser) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching conversation for chat:", selectedChat.id, selectedChat.participantId);
        
        // Fetch messages from the database
        const dbMessages = await getConversation(selectedChat.participantId);
        
        // Check if component is still mounted
        if (!isMounted) return;
        
        console.log(`Fetched ${dbMessages.length} messages for chat:`, selectedChat.id);
        
        // Transform database messages to our app format
        const formattedMessages = dbMessages.map(dbMsg => ({
          id: dbMsg.id,
          senderId: dbMsg.sender_id === currentUser.id ? 'current' : selectedChat.participantId,
          text: dbMsg.content,
          timestamp: new Date(dbMsg.created_at).getTime(),
        }));
        
        // Mark unread messages as read
        const unreadMessageIds = dbMessages
          .filter(msg => !msg.read && msg.receiver_id === currentUser.id)
          .map(msg => msg.id);
          
        if (unreadMessageIds.length > 0) {
          markMessagesAsRead(unreadMessageIds);
        }
        
        // Update selected chat with messages from the database
        const updatedChat = {
          ...selectedChat,
          messages: formattedMessages,
        };
        
        if (formattedMessages.length > 0) {
          const lastMsg = formattedMessages[formattedMessages.length - 1];
          updatedChat.lastMessage = lastMsg.text;
          updatedChat.lastMessageTime = lastMsg.timestamp;
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
  }, [selectedChatId, currentUser, selectedChat, setSelectedChat, chats, setChats]);

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
      const newMessage = {
        id: sentMessage.id,
        senderId: 'current',
        text: sentMessage.content,
        timestamp: new Date(sentMessage.created_at).getTime(),
      };
      
      // Update selected chat
      const updatedChat = {
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
