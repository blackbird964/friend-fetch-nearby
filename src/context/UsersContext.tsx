
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppUser, Location } from './types';
import { UsersContextType } from './AppContextTypes';
import { useAuthContext } from './AuthContext';
import { getNearbyUsers } from '@/services/user';
import { toast } from "sonner";

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuthContext();
  const [nearbyUsers, setNearbyUsers] = useState<AppUser[]>([]);
  const [radiusInKm, setRadiusInKm] = useState<number>(5);

  // Filter out blocked users from nearby users
  const filterBlockedUsers = useCallback((users: AppUser[]): AppUser[] => {
    if (!currentUser || !currentUser.blockedUsers || currentUser.blockedUsers.length === 0) {
      return users;
    }

    return users.filter(user => !currentUser.blockedUsers?.includes(user.id));
  }, [currentUser]);

  // Refresh nearby users
  const refreshNearbyUsers = useCallback(async (showToast: boolean = true) => {
    if (!currentUser || !currentUser.location) {
      console.log('Cannot refresh nearby users: no user or location');
      return;
    }

    try {
      console.log(`Fetching nearby users within ${radiusInKm}km radius`);
      
      // Get all users nearby first
      const allUsers = await getNearbyUsers(currentUser.id, currentUser.location, radiusInKm);
      
      // Filter out blocked users
      const filteredUsers = filterBlockedUsers(allUsers);
      
      setNearbyUsers(filteredUsers);
      
      if (showToast) {
        const hiddenCount = allUsers.length - filteredUsers.length;
        const message = hiddenCount > 0 
          ? `Found ${filteredUsers.length} nearby users (${hiddenCount} blocked users hidden)`
          : `Found ${filteredUsers.length} nearby users`;
          
        toast.success("Updated", {
          description: message
        });
      }
    } catch (error) {
      console.error('Error refreshing nearby users:', error);
      
      if (showToast) {
        toast.error("Error", {
          description: "Failed to get nearby users. Please try again."
        });
      }
    }
  }, [currentUser, radiusInKm, filterBlockedUsers]);

  useEffect(() => {
    if (currentUser && currentUser.location) {
      refreshNearbyUsers(false);
    }
  }, [currentUser, refreshNearbyUsers]);

  return (
    <UsersContext.Provider
      value={{
        nearbyUsers,
        setNearbyUsers,
        radiusInKm,
        setRadiusInKm,
        refreshNearbyUsers,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsersContext = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsersContext must be used within a UsersProvider');
  }
  return context;
};
