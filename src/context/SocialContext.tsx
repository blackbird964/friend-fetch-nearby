
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Chat, FriendRequest } from './types';
import { loadMockChats } from './mockDataService';
import { fetchFriendRequests } from '@/services/friend-requests';
import { SocialContextType } from './AppContextTypes';
import { useAuthContext } from './AuthContext';
import { toast } from "sonner";

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuthContext();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Refresh friend requests
  const refreshFriendRequests = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      console.log("Fetching friend requests for user:", currentUser.id);
      const requests = await fetchFriendRequests(currentUser.id);
      
      if (requests && requests.length > 0) {
        console.log("Received friend requests:", requests);
        setFriendRequests(requests);
        
        // Update chats based on accepted friend requests
        const acceptedFriends = requests.filter(req => req.status === 'accepted');
        
        if (acceptedFriends.length > 0) {
          // Create or update chats for accepted friend requests
          const existingChatIds = chats.map(chat => chat.participantId);
          
          const newChats = acceptedFriends.reduce((acc: Chat[], req: FriendRequest) => {
            // Determine which user is the friend based on the current user
            const isReceiver = req.receiverId === currentUser.id;
            const friendId = isReceiver ? req.senderId : req.receiverId;
            const friendName = isReceiver ? req.senderName || 'User' : req.receiverName || 'User';
            const friendPic = isReceiver ? req.senderProfilePic : req.receiverProfilePic;
            
            // Only add if not already in chats
            if (!existingChatIds.includes(friendId)) {
              acc.push({
                id: `chat-${friendId}-${Date.now()}`,
                name: friendName,
                participantId: friendId,
                participantName: friendName,
                profilePic: friendPic || '',
                participants: [currentUser.id, friendId],
                messages: [],
                lastMessage: "Say hello!",
                lastMessageTime: Date.now(),
              });
            }
            
            return acc;
          }, []);
          
          if (newChats.length > 0) {
            setChats(prev => [...prev, ...newChats]);
          }
        }
      } else {
        console.log("No friend requests found or error fetching");
        // Keep the current state if no requests are found
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      toast.error("Error fetching friend requests", {
        description: "Please try again later."
      });
    }
  }, [currentUser, chats]);

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
      // Check if we already have chats before loading mock data
      if (chats.length === 0) {
        const mockChats = loadMockChats();
        setChats(mockChats);
      }
    }
  }, [isAuthenticated, currentUser, chats.length]);

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
