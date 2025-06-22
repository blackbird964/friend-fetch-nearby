
import React, { useContext } from 'react';
import { AuthProvider, useAuthContext } from './AuthContext';
import { UsersProvider, useUsersContext } from './UsersContext';
import { SocialProvider, useSocialContext } from './SocialContext';
import { AppContextType } from './AppContextTypes';
import { useUserActions } from '@/hooks/useUserActions';
import { useUserPresence } from '@/hooks/useUserPresence';

// Create a combined context
const AppContext = React.createContext<AppContextType | undefined>(undefined);

// Combined provider component with proper nesting
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <AuthProvidedWrapper>{children}</AuthProvidedWrapper>
    </AuthProvider>
  );
};

// This wrapper ensures AuthProvider is available before other providers
const AuthProvidedWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UsersProvider>
      <SocialProvider>
        <CombinedContextProvider>{children}</CombinedContextProvider>
      </SocialProvider>
    </UsersProvider>
  );
};

// This component combines all context values
const CombinedContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get values from individual contexts - these should now be available
  const authContext = useAuthContext();
  const usersContext = useUsersContext();
  const socialContext = useSocialContext();
  
  // Initialize user presence tracking for the entire app with required parameters
  useUserPresence({
    currentUser: authContext.currentUser,
    nearbyUsers: usersContext.nearbyUsers,
    setNearbyUsers: usersContext.setNearbyUsers,
    chats: socialContext.chats,
    setChats: socialContext.setChats
  });
  
  // Add user actions
  const { blockUser, unblockUser, reportUser, loading: userActionsLoading } = 
    useUserActions(authContext.currentUser, authContext.setCurrentUser);

  // Combine all context values
  const combinedValue: AppContextType = {
    ...authContext,
    ...usersContext,
    ...socialContext,
    blockUser,
    unblockUser,
    reportUser,
    userActionsLoading
  };

  return <AppContext.Provider value={combinedValue}>{children}</AppContext.Provider>;
};

// Hook to use the combined app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
