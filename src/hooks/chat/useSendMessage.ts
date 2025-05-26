
import { useState, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { sendMessage } from '@/lib/supabase';
import { Message, Chat } from '@/context/types';
import { toast } from 'sonner';
import { createOptimisticMessage } from './utils/messageFormatters';
import { useMessageCache } from './useMessageCache';

export function useSendMessage() {
  const { selectedChat, setSelectedChat, setChats, currentUser } = useAppContext();
  const [isSending, setIsSending] = useState(false);
  const { updateCachedMessage } = useMessageCache();

  const handleSendMessage = useCallback(async (message: string) => {
    if (!selectedChat || !message.trim() || !currentUser || isSending) return;
    
    const originalMessage = message.trim();
    const tempId = `temp-${Date.now()}`;
    const currentTimestamp = Date.now();
    
    // Optimistic update - add message immediately
    const optimisticMessage = createOptimisticMessage(
      originalMessage,
      selectedChat,
      tempId,
      currentTimestamp
    );
    
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
      updateCachedMessage(selectedChat.id, tempId, realMessage);
      
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
  }, [selectedChat, currentUser, setChats, setSelectedChat, isSending]);

  return {
    handleSendMessage,
    isSending
  };
}
