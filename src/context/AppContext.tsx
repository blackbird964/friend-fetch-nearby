
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { getProfile } from '@/lib/supabase';
import { AppUser, AppContextType, Chat, FriendRequest } from './types';
import { updateUserLocation, updateUserProfile } from './userService';
import { useNearbyUsers } from '@/hooks/useNearbyUsers';
import { loadMockFriendRequests, loadMockChats } from './mockDataService';
import { DEFAULT_LOCATION } from '@/utils/locationUtils';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [radiusInKm, setRadiusInKm] = useState(60); // Expanded to 60km as requested
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  
  // Use our custom hook for nearby users management
  const { nearbyUsers, setNearbyUsers, loading: nearbyUsersLoading, refreshNearbyUsers: fetchNearbyUsers, lastFetchTime } = useNearbyUsers(currentUser);
  
  // Wrapper function to maintain API compatibility
  const refreshNearbyUsers = async (showToast: boolean = true) => {
    return fetchNearbyUsers(showToast);
  };

  // Auth state listener
  useEffect(() => {
    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setLoading(true);
        
        if (session?.user) {
          setSupabaseUser(session.user);
          setIsAuthenticated(true);
          
          // Use setTimeout to prevent deadlocks
          setTimeout(async () => {
            try {
              const profile = await getProfile(session.user.id);
              console.log("Profile fetched after auth change:", profile);
              
              if (profile) {
                const appUser = {
                  ...profile,
                  email: session.user.email || '',
                };
                setCurrentUser(appUser);
                
                // Set default location if none exists
                if (!profile.location) {
                  const defaultLocation = DEFAULT_LOCATION;
                  await updateUserLocation(profile.id, defaultLocation);
                  appUser.location = defaultLocation;
                  setCurrentUser(appUser);
                }
                
                // Now refresh nearby users - don't show toast on initial load
                setTimeout(() => {
                  refreshNearbyUsers(false);
                }, 0);
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setSupabaseUser(null);
          setIsAuthenticated(false);
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      console.log("Initial session check:", data.session);
      
      if (data.session?.user) {
        setSupabaseUser(data.session.user);
        setIsAuthenticated(true);
        
        const profile = await getProfile(data.session.user.id);
        console.log("Initial profile:", profile);
        
        if (profile) {
          const appUser = {
            ...profile,
            email: data.session.user.email || '',
          };
          setCurrentUser(appUser);
          
          // Set default location if none exists
          if (!profile.location) {
            const defaultLocation = DEFAULT_LOCATION;
            await updateUserLocation(profile.id, defaultLocation);
            appUser.location = defaultLocation;
            setCurrentUser(appUser);
          }
          
          // Refresh nearby users - don't show toast on initial load
          setTimeout(() => {
            refreshNearbyUsers(false);
          }, 100);
        }
      }
      
      setLoading(false);
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update nearbyUsers when radius changes, but don't show toast for automatic updates
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      refreshNearbyUsers(false);
    }
  }, [radiusInKm, currentUser?.location]);

  // Load mock data for testing
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Only load mock friend requests as fallback for now
      setFriendRequests(loadMockFriendRequests());
      
      // Mock chats with realistic conversations
      setChats(loadMockChats());
    }
  }, [isAuthenticated, currentUser]);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        setCurrentUser,
        nearbyUsers,
        setNearbyUsers,
        radiusInKm,
        setRadiusInKm,
        friendRequests,
        setFriendRequests,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        showSidebar,
        setShowSidebar,
        supabaseUser,
        setSupabaseUser,
        loading,
        refreshNearbyUsers,
        updateUserLocation,
        updateUserProfile
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
