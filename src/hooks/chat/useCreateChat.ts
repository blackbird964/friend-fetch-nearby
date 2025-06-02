
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

    try {
      // Create a new chat object
      const newChat: Chat = {
        id: `chat-${participants[0].id}-${Date.now()}`,
        name: participants[0].name || 'User',
        participants: [currentUser.id, ...participants.map(p => p.id)],
        participantId: participants[0].id,
        participantName: participants[0].name || 'User',
        profilePic: participants[0].profile_pic || '',
        lastMessage: "Say hello!",
        lastMessageTime: Date.now(),
        messages: [],
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log("[useCreateChat] Created new chat:", newChat);
      return newChat;
    } catch (error) {
      console.error("[useCreateChat] Error creating chat:", error);
      throw error;
    }
  }, [currentUser]);

  return { 
    createChat,
    chats,
    setChats
  };
}
