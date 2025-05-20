
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { AppUser, Chat } from '@/context/types';
import { v4 as uuidv4 } from 'uuid';

export const useChatActions = () => {
  const navigate = useNavigate();
  const { chats, setChats, setSelectedChat, currentUser } = useAppContext();

  const startChat = useCallback((targetUser: AppUser) => {
    if (!currentUser) {
      console.error("Cannot start chat: Current user is not defined");
      return;
    }
    
    console.log("Starting chat with user:", targetUser);
    
    // Check if we already have a chat with this user
    const existingChat = chats.find(chat => 
      chat.participants.includes(targetUser.id) && 
      chat.participants.includes(currentUser.id)
    );

    if (existingChat) {
      console.log("Found existing chat:", existingChat);
      setSelectedChat(existingChat);
      
      // Use setTimeout to ensure state is updated before navigation
      setTimeout(() => {
        navigate('/chat', { replace: true });
      }, 0);
      
      return;
    }

    // Create a new chat
    const newChat: Chat = {
      id: uuidv4(),
      name: targetUser.name || 'Chat',
      participants: [currentUser.id, targetUser.id],
      messages: [],
      participantId: targetUser.id,
      participantName: targetUser.name,
      profilePic: targetUser.profile_pic,
      lastMessage: '',
      lastMessageTime: Date.now(),
    };

    console.log("Created new chat:", newChat);
    
    // Update chats with the new chat - using direct array instead of updater function
    setChats([...chats, newChat]);
    setSelectedChat(newChat);
    
    // Use setTimeout to ensure state is updated before navigation
    setTimeout(() => {
      navigate('/chat', { replace: true });
    }, 0);
  }, [chats, setChats, setSelectedChat, currentUser, navigate]);

  return { startChat };
};
