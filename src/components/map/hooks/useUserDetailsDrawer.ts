
import { useState } from 'react';
import { AppUser } from '@/context/types';

export const useUserDetailsDrawer = () => {
  const [drawerSelectedUser, setDrawerSelectedUser] = useState<AppUser | null>(null);

  const handleUserSelect = (user: AppUser) => {
    console.log("[useUserDetailsDrawer] User selected from side panel:", user.name);
    setDrawerSelectedUser(user);
  };

  const handleCloseDrawer = () => {
    console.log("[useUserDetailsDrawer] Closing drawer");
    setDrawerSelectedUser(null);
  };

  return {
    drawerSelectedUser,
    handleUserSelect,
    handleCloseDrawer
  };
};
