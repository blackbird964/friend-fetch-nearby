
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppUser, Location } from './types';
import { UsersContextType } from './AppContextTypes';
import { useAuthContext } from './AuthContext';
import { nearbyUsersService } from '@/services/user';
import { toast } from "sonner";

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuthContext();
  const [nearbyUsers, setNearbyUsers] = useState<AppUser[]>([]);
  const [radiusInKm, setRadiusInKm] = useState<number>(60); // Updated default radius to 60km

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
      console.log(`Fetching nearby users within ${radiusInKm}km radius with updated data`);
      
      // Get all users nearby with fresh data from the database
      const allUsers = await nearbyUsersService.getNearbyUsers(currentUser.location, radiusInKm);
      
      // Filter out the current user FIRST, then filter blocked users
      const otherUsers = allUsers.filter(user => user.id !== currentUser.id);
      const filteredUsers = filterBlockedUsers(otherUsers);
      
      console.log('UsersContext - All users fetched:', allUsers.length);
      console.log('UsersContext - After removing current user:', otherUsers.length);
      console.log('UsersContext - After filtering blocked users:', filteredUsers.length);
      console.log('UsersContext - Current user ID:', currentUser.id);
      console.log('UsersContext - Users with activities:', filteredUsers.map(u => ({
        id: u.id,
        name: u.name,
        activities: u.todayActivities,
        interests: u.interests,
        duration: u.preferredHangoutDuration
      })));
      
      setNearbyUsers(filteredUsers);
      
      if (showToast) {
        const hiddenCount = otherUsers.length - filteredUsers.length;
        const message = hiddenCount > 0 
          ? `Found ${filteredUsers.length} nearby users (${hiddenCount} blocked users hidden)`
          : `Found ${filteredUsers.length} nearby users with updated preferences`;
          
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
