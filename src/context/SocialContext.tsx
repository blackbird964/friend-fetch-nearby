
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Chat, FriendRequest } from './types';
import { loadMockChats } from './mockDataService';
import { fetchFriendRequests } from '@/services/friendRequestService';
import { SocialContextType } from './AppContextTypes';
import { useAuthContext } from './AuthContext';

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuthContext();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Refresh friend requests
  const refreshFriendRequests = useCallback(async () => {
    if (currentUser) {
      try {
        const requests = await fetchFriendRequests(currentUser.id);
        if (requests && requests.length > 0) {
          setFriendRequests(requests);
          return;
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
      
      // Fallback to mock data if needed
      const mockRequests = [];
      setFriendRequests(mockRequests);
    }
  }, [currentUser]);

  // Set up a periodic refresh for friend requests
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      refreshFriendRequests();
      
      // Set up periodic refresh every 30 seconds
      const interval = setInterval(() => {
        refreshFriendRequests();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, currentUser, refreshFriendRequests]);

  // Load mock data for testing
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Only load mock chats as fallback - friend requests should come from the database
      setChats(loadMockChats());
    }
  }, [isAuthenticated, currentUser]);

  return (
    <SocialContext.Provider
      value={{
        friendRequests,
        setFriendRequests,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        showSidebar,
        setShowSidebar,
        refreshFriendRequests,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocialContext = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocialContext must be used within a SocialProvider');
  }
  return context;
};
