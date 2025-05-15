
import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Message, Chat, MessageStatus } from '@/context/types';
import { useMessageLoader } from './chat/useMessageLoader';
import { useMessageSender } from './chat/useMessageSender';
import { useMessageSubscription } from './chat/useMessageSubscription';
import { UseMessagesResult } from './chat/types';

export function useChat(selectedChatId: string | null): UseMessagesResult {
  const { 
    selectedChat, 
    setSelectedChat, 
    chats, 
    setChats, 
    currentUser, 
    setUnreadMessageCount 
  } = useAppContext();

  // Handler for updating messages when a new message is received
  const handleNewMessage = useCallback((newMessage: Message) => {
    if (!selectedChat) return;
    
    // Update selected chat with the new message
    const updatedChat: Chat = {
      ...selectedChat,
      messages: [...(selectedChat.messages || []), newMessage],
      lastMessage: newMessage.content,
      lastMessageTime: newMessage.timestamp as number,
    };
    
    setSelectedChat(updatedChat);
  }, [selectedChat, setSelectedChat]);

  // Handler for updating chat list when a message is sent
  const updateChatList = useCallback((chatId: string, lastMessage: string, lastMessageTime: number) => {
    // Update chat list with new message info
    setChats(chats.map(chat => {
      if (chat.id === chatId) {
        const updatedChat = {
          ...chat,
          lastMessage,
          lastMessageTime,
        };
        
        // Also update selected chat if this is the active chat
        if (selectedChat && selectedChat.id === chatId) {
          const updatedSelectedChat = {
            ...selectedChat,
            lastMessage,
            lastMessageTime,
            messages: [...(selectedChat.messages || []), {
              id: Date.now().toString(), // Temporary ID until we get the real one
              chatId,
              senderId: 'current',
              content: lastMessage,
              text: lastMessage,
              timestamp: lastMessageTime,
              status: 'sent' as MessageStatus,
            }]
          };
          setSelectedChat(updatedSelectedChat);
        }
        
        return updatedChat;
      }
      return chat;
    }));
  }, [chats, setChats, selectedChat, setSelectedChat]);

  // Handler for updating unread counts
  const updateUnreadCounts = useCallback((chatId: string) => {
    // Update the unread count for this chat
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, unreadCount: 0 };
      }
      return chat;
    });
    
    setChats(updatedChats);
    
    // Recalculate total unread messages
    const totalUnread = updatedChats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
    setUnreadMessageCount(totalUnread);
  }, [chats, setChats, setUnreadMessageCount]);

  // Set up real-time message subscription
  useMessageSubscription(
    selectedChat, 
    currentUser?.id, 
    handleNewMessage
  );
  
  // Use message loading hook
  const { 
    isLoading, 
    fetchError, 
    hasMoreMessages, 
    loadMoreMessages 
  } = useMessageLoader(
    selectedChat,
    currentUser?.id,
    setSelectedChat,
    updateUnreadCounts
  );
  
  // Use message sending hook
  const { 
    message, 
    setMessage, 
    isSending, 
    handleSendMessage 
  } = useMessageSender(
    selectedChat,
    currentUser?.id,
    updateChatList
  );

  return {
    message,
    setMessage,
    isLoading,
    isSending,
    fetchError,
    handleSendMessage,
    hasMoreMessages,
    loadMoreMessages
  };
}

export default useChat;
