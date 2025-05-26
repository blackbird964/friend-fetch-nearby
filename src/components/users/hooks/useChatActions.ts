
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppUser, Chat } from '@/context/types';
import { useToast } from '@/hooks/use-toast';
import { useChatList } from '@/hooks/useChatList';
import { useAppContext } from '@/context/AppContext';
import { toast as sonnerToast } from 'sonner';

export const useChatActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const { chats, setChats, createChat } = useChatList();
  const { setSelectedChat } = useAppContext();

  // Function to start a new chat or navigate to an existing one
  const startChat = useCallback(async (user: AppUser) => {
    console.log("[useChatActions] Starting chat with:", user.name);
    if (!user || !user.id) {
      console.error("[useChatActions] Invalid user or missing ID:", user);
      return;
    }

    setLoading(true);

    try {
      console.log("[useChatActions] Checking for existing chat with user ID:", user.id);
      // First check if a chat with this user already exists
      const existingChat = chats.find(
        chat => chat.participants.some(
          participant => participant === user.id
        )
      );

      if (existingChat) {
        console.log("[useChatActions] Found existing chat:", existingChat.id);
        
        // Set the selected chat
        setSelectedChat(existingChat);
        
        // Navigate to the chat page
        navigate('/chat');
        
        // Use sonner toast for notification
        sonnerToast.success("Opening chat", {
          description: `Chat with ${user.name}`
        });
        
      } else {
        console.log("[useChatActions] Creating new chat with user:", user.name);
        // Create a new chat
        const newChat = await createChat([user]);
        console.log("[useChatActions] New chat created:", newChat);
        
        // Add the new chat to the chats list by passing the updated array directly
        setChats([...chats, newChat]);
        
        // Set the newly created chat as selected
        setSelectedChat(newChat);
        
        // Navigate to the chat page
        console.log("[useChatActions] Navigating to chat page");
        navigate('/chat');
        
        // Use sonner toast for notification
        sonnerToast.success("Chat created", {
          description: `Started a new chat with ${user.name}`
        });
      }
    } catch (error) {
      console.error("[useChatActions] Error starting chat:", error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive"
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
