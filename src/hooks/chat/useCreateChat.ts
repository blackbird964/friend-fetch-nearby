
import { useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Chat, AppUser } from '@/context/types';

export function useCreateChat() {
  const { currentUser, chats, setChats } = useAppContext();

  const createChat = useCallback(async (participants: AppUser[]) => {
    console.log("[useCreateChat] Creating new chat with participants:", participants);
    
    if (!currentUser) {
      console.error("[useCreateChat] Cannot create chat: No current user");
      throw new Error("User not authenticated");
    }
    
    if (!participants || participants.length === 0) {
      console.error("[useCreateChat] Cannot create chat: No participants provided");
      throw new Error("No participants provided");
    }

    const targetUser = participants[0];
    if (!targetUser || !targetUser.id) {
      console.error("[useCreateChat] Cannot create chat: Invalid target user", targetUser);
      throw new Error("Invalid target user");
    }

    try {
      // Check if chat already exists
      const existingChat = chats.find(chat => 
        chat.participants.includes(targetUser.id) && 
        chat.participants.includes(currentUser.id)
      );

      if (existingChat) {
        console.log("[useCreateChat] Found existing chat:", existingChat.id);
        return existingChat;
      }

      // Generate a unique chat ID
      const chatId = `chat-${currentUser.id}-${targetUser.id}-${Date.now()}`;
      
      // Create a new chat object
      const newChat: Chat = {
        id: chatId,
        name: targetUser.name || 'User',
        participants: [currentUser.id, targetUser.id],
        participantId: targetUser.id,
        participantName: targetUser.name || 'User',
        profilePic: targetUser.profile_pic || '',
        lastMessage: "Say hello!",
        lastMessageTime: Date.now(),
        messages: [],
        unreadCount: 0,
        isOnline: targetUser.isOnline || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log("[useCreateChat] Created new chat object:", newChat);
      return newChat;
    } catch (error) {
      console.error("[useCreateChat] Error creating chat:", error);
      throw error;
    }
  }, [currentUser, chats]);

  return { 
    createChat,
    chats,
    setChats
  };
}
