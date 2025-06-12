import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppUser } from '@/context/types';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { toast as sonnerToast } from 'sonner';

export const useChatActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const { chats, setChats, setSelectedChat } = useAppContext();

  // Simplified function to start a chat
  const startChat = useCallback(async (user: AppUser) => {
    console.log("[useChatActions] Starting chat with:", user?.name, "ID:", user?.id);
    
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
      
      // Ensure chats is an array before using find
      const chatsList = Array.isArray(chats) ? chats : [];
      
      // Check if a chat with this user already exists
      const existingChat = chatsList.find(
        chat => chat?.participants && Array.isArray(chat.participants) && chat.participants.includes(user.id)
      );

      let chatToSelect;

      if (existingChat) {
        console.log("[useChatActions] Found existing chat:", existingChat.id);
        chatToSelect = existingChat;
        
        sonnerToast.success("Opening existing chat", {
          description: `Chat with ${user.name}`
        });
        
      } else {
        console.log("[useChatActions] Creating new chat with user:", user.name);
        
        // Create a simple new chat object
        const newChatId = `chat-${Date.now()}-${user.id}`;
        const newChat = {
          id: newChatId,
          name: user.name || 'User',
          participants: [user.id],
          participantId: user.id,
          participantName: user.name || 'User',
          profilePic: user.profile_pic || '',
          lastMessage: "Start chatting!",
          lastMessageTime: Date.now(),
          messages: [],
          unreadCount: 0,
          isOnline: user.isOnline || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log("[useChatActions] New chat created:", newChat);
        
        // Add the new chat to the chats list
        setChats(prevChats => {
          const prevChatsList = Array.isArray(prevChats) ? prevChats : [];
          return [...prevChatsList, newChat];
        });
        
        chatToSelect = newChat;
        
        sonnerToast.success("New chat created", {
          description: `Started a chat with ${user.name}`
        });
      }
      
      // Set the chat as selected
      console.log("[useChatActions] Setting selected chat:", chatToSelect.id);
      setSelectedChat(chatToSelect);
      
      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to the chat page
      console.log("[useChatActions] Navigating to chat page");
      navigate('/chat', { replace: true });
      
    } catch (error) {
      console.error("[useChatActions] Error starting chat:", error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error("[useChatActions] Error message:", error.message);
        console.error("[useChatActions] Error stack:", error.stack);
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start chat. Please try again.",
        variant: "destructive"
      });
      
      sonnerToast.error("Failed to start chat", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setLoading(false);
    }
  }, [chats, navigate, setChats, toast, setSelectedChat]);

  return {
    startChat,
    loading
  };
};