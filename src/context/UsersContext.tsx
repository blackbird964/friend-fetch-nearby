
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser } from './types';
import { useNearbyUsers } from '@/hooks/useNearbyUsers';
import { UsersContextType } from './AppContextTypes';
import { useAuthContext } from './AuthContext';

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuthContext();
  const [radiusInKm, setRadiusInKm] = useState(60); // Expanded to 60km as requested
  
  // Use our custom hook for nearby users management
  const { 
    nearbyUsers, 
    setNearbyUsers, 
    refreshNearbyUsers: fetchNearbyUsers 
  } = useNearbyUsers(currentUser);
  
  // Wrapper function to maintain API compatibility
  const refreshNearbyUsers = async (showToast: boolean = false) => {
    return fetchNearbyUsers(showToast);
  };

  // Update nearbyUsers when radius changes, but don't show toast for automatic updates
  useEffect(() => {
    if (currentUser?.id) {
      refreshNearbyUsers(false);
    }
  }, [radiusInKm, currentUser?.location]);

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
