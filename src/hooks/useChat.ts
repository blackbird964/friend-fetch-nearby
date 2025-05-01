
import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { getConversation, sendMessage, markMessagesAsRead } from '@/lib/supabase';
import { Message } from '@/context/types';

export function useChat(selectedChatId: string | null) {
  const { selectedChat, setSelectedChat, chats, setChats, currentUser } = useAppContext();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch conversation when selected chat changes
  useEffect(() => {
    const fetchConversation = async () => {
      if (!selectedChat || !currentUser) return;
      
      setIsLoading(true);
      try {
        // Fetch messages from the database
        const dbMessages = await getConversation(selectedChat.participantId);
        
        if (dbMessages.length > 0) {
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
        }
      } catch (err) {
        console.error("Error fetching conversation:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [selectedChatId, currentUser, selectedChat, setSelectedChat, chats, setChats]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChat || !message.trim() || !currentUser) return;
    
    try {
      // Save the message in the database
      const sentMessage = await sendMessage(selectedChat.participantId, message.trim());
      
      if (!sentMessage) {
        console.error("Failed to send message");
        return;
      }
      
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
        messages: [...selectedChat.messages, newMessage],
        lastMessage: message.trim(),
        lastMessageTime: new Date(sentMessage.created_at).getTime(),
      };
      
      setChats(
        chats.map(chat => 
          chat.id === selectedChat.id ? updatedChat : chat
        )
      );
      
      setSelectedChat(updatedChat);
      setMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }, [message, selectedChat, currentUser, setChats, setSelectedChat, chats]);

  return {
    message,
    setMessage,
    isLoading,
    handleSendMessage
  };
}

export default useChat;
