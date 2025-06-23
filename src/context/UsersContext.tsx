
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

  // Filter users based on shared today activities
  const filterUsersBySharedActivities = useCallback((users: AppUser[]): AppUser[] => {
    if (!currentUser || !currentUser.todayActivities || currentUser.todayActivities.length === 0) {
      console.log('No current user activities to filter by, showing all users');
      return users;
    }

    const currentUserActivities = currentUser.todayActivities;
    console.log('Current user activities:', currentUserActivities);

    const filteredUsers = users.filter(user => {
      if (!user.todayActivities || user.todayActivities.length === 0) {
        return false; // Don't show users with no activities
      }

      // Check if user has at least one shared activity with current user
      const hasSharedActivity = user.todayActivities.some(activity => 
        currentUserActivities.includes(activity)
      );

      console.log(`User ${user.name}: activities=${user.todayActivities}, hasSharedActivity=${hasSharedActivity}`);
      
      return hasSharedActivity;
    });

    console.log(`Filtered ${filteredUsers.length} users with shared activities out of ${users.length} total`);
    return filteredUsers;
  }, [currentUser]);

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
      const allUsers = await nearbyUsersService.getNearbyUsers(
        currentUser.id,
        currentUser.location,
        radiusInKm
      );
      
      // Filter out the current user FIRST, then filter blocked users, then filter by shared activities
      const otherUsers = allUsers.filter(user => user.id !== currentUser.id);
      const unblockedUsers = filterBlockedUsers(otherUsers);
      const usersWithSharedActivities = filterUsersBySharedActivities(unblockedUsers);
      
      console.log('UsersContext - All users fetched:', allUsers.length);
      console.log('UsersContext - After removing current user:', otherUsers.length);
      console.log('UsersContext - After filtering blocked users:', unblockedUsers.length);
      console.log('UsersContext - After filtering by shared activities:', usersWithSharedActivities.length);
      console.log('UsersContext - Current user ID:', currentUser.id);
      console.log('UsersContext - Current user activities:', currentUser.todayActivities);
      
      setNearbyUsers(usersWithSharedActivities);
      
      if (showToast) {
        const hiddenByBlocking = otherUsers.length - unblockedUsers.length;
        const hiddenByActivities = unblockedUsers.length - usersWithSharedActivities.length;
        
        let message = `Found ${usersWithSharedActivities.length} nearby users with shared activities`;
        if (hiddenByBlocking > 0) {
          message += ` (${hiddenByBlocking} blocked users hidden)`;
        }
        if (hiddenByActivities > 0) {
          message += ` (${hiddenByActivities} users with no shared activities hidden)`;
        }
          
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
  }, [currentUser, radiusInKm, filterBlockedUsers, filterUsersBySharedActivities]);

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
