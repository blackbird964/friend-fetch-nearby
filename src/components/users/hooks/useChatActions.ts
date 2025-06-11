
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppUser } from '@/context/types';
import { useToast } from '@/hooks/use-toast';
import { useCreateChat } from '@/hooks/chat/useCreateChat';
import { useAppContext } from '@/context/AppContext';
import { toast as sonnerToast } from 'sonner';

export const useChatActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const { createChat, chats, setChats } = useCreateChat();
  const { setSelectedChat } = useAppContext();

  // Function to start a new chat or navigate to an existing one
  const startChat = useCallback(async (user: AppUser) => {
    console.log("[useChatActions] Starting chat with:", user.name, "ID:", user.id);
    
    if (!user || !user.id) {
      console.error("[useChatActions] Invalid user or missing ID:", user);
      toast({
        title: "Error",
        description: "Cannot start chat: Invalid user data",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log("[useChatActions] Checking for existing chat with user ID:", user.id);
      console.log("[useChatActions] Current chats:", chats);
      
      // First check if a chat with this user already exists
      const existingChat = chats.find(
        chat => chat.participants.some(
          participant => participant === user.id
        )
      );

      let chatToSelect;

      if (existingChat) {
        console.log("[useChatActions] Found existing chat:", existingChat.id);
        chatToSelect = existingChat;
        
        // Use sonner toast for notification
        sonnerToast.success("Opening chat", {
          description: `Chat with ${user.name}`
        });
        
      } else {
        console.log("[useChatActions] Creating new chat with user:", user.name);
        // Create a new chat
        const newChat = await createChat([user]);
        console.log("[useChatActions] New chat created:", newChat);
        
        if (!newChat) {
          throw new Error("Failed to create chat");
        }
        
        // Add the new chat to the chats list
        const updatedChats = [...chats, newChat];
        setChats(updatedChats);
        console.log("[useChatActions] Updated chats list with new chat");
        
        chatToSelect = newChat;
        
        // Use sonner toast for notification
        sonnerToast.success("Chat created", {
          description: `Started a new chat with ${user.name}`
        });
      }
      
      // Set the chat as selected
      console.log("[useChatActions] Setting selected chat:", chatToSelect.id);
      setSelectedChat(chatToSelect);
      
      // Navigate to the chat page
      console.log("[useChatActions] Navigating to chat page");
      navigate('/chat');
      
    } catch (error) {
      console.error("[useChatActions] Error starting chat:", error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive"
      });
      sonnerToast.error("Failed to start chat", {
        description: "Please try again"
      });
    } finally {
      setLoading(false);
    }
  }, [chats, navigate, setChats, createChat, toast, setSelectedChat]);

  return {
    startChat,
    loading
  };
};
