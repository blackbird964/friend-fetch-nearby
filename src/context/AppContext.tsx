
import React, { useContext } from 'react';
import { AuthProvider, useAuthContext } from './AuthContext';
import { UsersProvider, useUsersContext } from './UsersContext';
import { SocialProvider, useSocialContext } from './SocialContext';
import { AppContextType } from './AppContextTypes';
import { useUserActions } from '@/hooks/useUserActions';

// Create a combined context
const AppContext = React.createContext<AppContextType | undefined>(undefined);

// Combined provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  // Get values from individual contexts
  const authContext = useAuthContext();
  const usersContext = useUsersContext();
  const socialContext = useSocialContext();
  
  // Add user actions with error handling
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
    userActionsLoading: userActionsLoading || false
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
