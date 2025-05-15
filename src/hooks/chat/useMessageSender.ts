
import { useState, useCallback } from 'react';
import { sendMessage } from '@/lib/supabase/messages';
import { Message, Chat, MessageStatus } from '@/context/types';
import { toast } from 'sonner';
import { useMessageCache } from './useMessageCache';

/**
 * Hook for sending messages
 */
export function useMessageSender(
  selectedChat: Chat | null,
  currentUserId: string | undefined,
  updateChat: (chatId: string, lastMessage: string, lastMessageTime: number) => void
) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { addMessageToCache } = useMessageCache();
  
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChat || !message.trim() || !currentUserId || isSending) return;
    
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
      
      // Create the message object
      const newMessage: Message = {
        id: sentMessage.id,
        chatId: selectedChat.id,
        senderId: 'current',
        text: sentMessage.content,
        content: sentMessage.content,
        timestamp: new Date(sentMessage.created_at).getTime(),
        status: 'sent' as MessageStatus,
      };
      
      // Add to cache
      addMessageToCache(selectedChat.id, newMessage);
      
      // Update chat with new last message info
      updateChat(
        selectedChat.id, 
        originalMessage,
        new Date(sentMessage.created_at).getTime()
      );
      
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  }, [message, selectedChat, currentUserId, isSending, addMessageToCache, updateChat]);

  return {
    message,
    setMessage,
    isSending,
    handleSendMessage
  };
}
