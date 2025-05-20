
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
      
      // Navigate immediately to chat page
      console.log("Navigating to existing chat");
      navigate('/chat');
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
    
    // Update the chats array with the new chat
    const updatedChats = [...chats, newChat];
    setChats(updatedChats);
    
    // Set the selected chat
    setSelectedChat(newChat);
    
    // Navigate to chat page immediately
    console.log("Navigating to new chat");
    navigate('/chat');
    
  }, [chats, setChats, setSelectedChat, currentUser, navigate]);

  return { startChat };
};
