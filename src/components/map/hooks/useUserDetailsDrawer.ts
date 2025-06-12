
import { useState } from 'react';
import { AppUser } from '@/context/types';
import { useChatActions } from '@/components/users/hooks/useChatActions';

export const useUserDetailsDrawer = () => {
  const [drawerSelectedUser, setDrawerSelectedUser] = useState<AppUser | null>(null);
  const { startChat } = useChatActions();

  const handleUserSelect = (user: AppUser) => {
    console.log("[useUserDetailsDrawer] User selected from side panel:", user.name);
    setDrawerSelectedUser(user);
  };

  const handleStartChat = async (user: AppUser) => {
    console.log("[useUserDetailsDrawer] Starting chat with user:", user.name, "ID:", user.id);
    
    if (!user || !user.id) {
      console.error("[useUserDetailsDrawer] Invalid user data:", user);
      return;
    }

    try {
      console.log("[useUserDetailsDrawer] Calling startChat with user:", user);
      await startChat(user);
      console.log("[useUserDetailsDrawer] Chat started successfully");
      
      // Close the drawer after successful chat start
      setDrawerSelectedUser(null);
    } catch (error) {
      console.error("[useUserDetailsDrawer] Error starting chat:", error);
      // Don't close drawer on error so user can try again
    }
  };

  const handleCloseDrawer = () => {
    console.log("[useUserDetailsDrawer] Closing drawer");
    setDrawerSelectedUser(null);
  };

  return {
    drawerSelectedUser,
    handleUserSelect,
    handleStartChat,
    handleCloseDrawer
  };
};
