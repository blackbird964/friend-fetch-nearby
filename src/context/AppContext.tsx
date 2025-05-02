
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { getProfile } from '@/lib/supabase';
import { AppUser, AppContextType, Chat, FriendRequest, Location } from './types';
import { updateUserLocation as updateLocation, updateUserProfile as updateProfile } from './userService';
import { useNearbyUsers } from '@/hooks/useNearbyUsers';
import { loadMockFriendRequests, loadMockChats } from './mockDataService';
import { DEFAULT_LOCATION } from '@/utils/locationUtils';
import { fetchFriendRequests } from '@/services/friendRequestService';

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
  const [loading, setLoading] = useState(false);
  
  // Use our custom hook for nearby users management
  const { nearbyUsers, setNearbyUsers, loading: nearbyUsersLoading, refreshNearbyUsers: fetchNearbyUsers, lastFetchTime } = useNearbyUsers(currentUser);
  
  // Wrapper for the user location and profile update functions to match expected types
  const updateUserLocation = async (userId: string, location: Location): Promise<void> => {
    await updateLocation(userId, location);
  };
  
  const updateUserProfile = async (userId: string, profileData: Partial<AppUser>): Promise<void> => {
    await updateProfile({ ...profileData, id: userId });
  };
  
  // Wrapper function to maintain API compatibility
  const refreshNearbyUsers = async (showToast: boolean = false) => {
    return fetchNearbyUsers(showToast);
  };

  // Refresh friend requests
  const refreshFriendRequests = async () => {
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
      setFriendRequests(loadMockFriendRequests());
    }
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
                  refreshFriendRequests(); // Refresh friend requests on login
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
            refreshFriendRequests(); // Refresh friend requests on initial load
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
  }, [isAuthenticated, currentUser]);

  // Update nearbyUsers when radius changes, but don't show toast for automatic updates
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      refreshNearbyUsers(false);
    }
  }, [radiusInKm, currentUser?.location]);

  // Load mock data for testing
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Only load mock chats as fallback - friend requests should come from the database
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
        updateUserProfile,
        refreshFriendRequests
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
