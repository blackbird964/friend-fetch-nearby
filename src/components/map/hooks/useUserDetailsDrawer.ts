
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
    console.log("[useUserDetailsDrawer] Starting chat with user:", user.name);
    try {
      await startChat(user);
    } catch (error) {
      console.error("[useUserDetailsDrawer] Error starting chat:", error);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerSelectedUser(null);
  };

  return {
    drawerSelectedUser,
    handleUserSelect,
    handleStartChat,
    handleCloseDrawer
  };
};
