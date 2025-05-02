
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { AppUser, Chat } from '@/context/types';

export const useChatActions = () => {
  const { 
    currentUser, 
    chats, 
    setChats, 
    setSelectedChat
  } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const startChat = (user: AppUser) => {
    if (!currentUser) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to chat",
        variant: "destructive"
      });
      return;
    }
    
    // Check if chat already exists
    const existingChat = chats.find(chat => chat.participantId === user.id);
    
    if (existingChat) {
      setSelectedChat(existingChat);
      toast({
        title: "Chat exists",
        description: `Opening your chat with ${user.name}`,
      });
    } else {
      // Create new chat with required properties
      const newChat: Chat = {
        id: `chat-${user.id}`,
        name: user.name || 'Chat',
        participants: [currentUser.id, user.id],
        participantId: user.id,
        participantName: user.name,
        profilePic: user.profile_pic || '',
        lastMessage: "Start chatting now",
        lastMessageTime: Date.now(),
        messages: [],
      };
      
      setChats([newChat, ...chats]);
      setSelectedChat(newChat);
      
      toast({
        title: "Chat created",
        description: `Started a new chat with ${user.name}`,
      });
    }
    
    // Navigate to chat page
    navigate('/chat');
  };

  return { startChat };
};
