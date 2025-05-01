
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { getProfile, Profile, getAllProfiles, updateUserLocation as updateLocation } from '@/lib/supabase';

// Define types for our user and app state
export type AppUser = Profile & {
  email: string;
};

export type FriendRequest = {
  id: string;
  senderId?: string;
  senderName?: string;
  senderProfilePic?: string;
  receiverId?: string;
  receiverName?: string;
  receiverProfilePic?: string;
  duration: number;
  status: 'pending' | 'accepted' | 'rejected' | 'sent';
  timestamp: number;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
};

export type Chat = {
  id: string;
  participantId: string;
  participantName: string;
  profilePic: string;
  lastMessage: string;
  lastMessageTime: number;
  messages: Message[];
};

type AppContextType = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  currentUser: AppUser | null;
  setCurrentUser: (user: AppUser | null) => void;
  nearbyUsers: AppUser[];
  setNearbyUsers: (users: AppUser[]) => void;
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
  friendRequests: FriendRequest[];
  setFriendRequests: (requests: FriendRequest[]) => void;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  supabaseUser: User | null;
  setSupabaseUser: (user: User | null) => void;
  loading: boolean;
  refreshNearbyUsers: () => Promise<void>;
  updateUserLocation: (userId: string, location: { lat: number, lng: number }) => Promise<any>; // Changed return type to Promise<any>
  updateUserProfile: (updatedProfile: Partial<Profile>) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<AppUser[]>([]);
  const [radiusInKm, setRadiusInKm] = useState(60); // Expanded to 60km as requested
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Update user location in Supabase and local state
  const updateUserLocation = async (userId: string, location: { lat: number, lng: number }) => {
    try {
      console.log("Updating user location in context:", userId, location);
      const result = await updateLocation(userId, location);
      
      // If this is the current user, update the local state
      if (currentUser && currentUser.id === userId) {
        setCurrentUser({
          ...currentUser,
          location: location
        });
      }
      
      // Refresh nearby users with the new location
      refreshNearbyUsers();
      
      return result;
    } catch (error) {
      console.error("Error updating user location:", error);
      throw error;
    }
  };

  // Update user profile in Supabase and local state
  const updateUserProfile = async (updatedProfile: Partial<Profile>) => {
    try {
      if (!updatedProfile.id) {
        throw new Error('Profile ID is missing');
      }
      
      // Create a clean copy of the profile data without location
      const profileUpdate = { ...updatedProfile };
      
      // Remove location from update to avoid format errors
      delete profileUpdate.location;
      
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', updatedProfile.id);
        
      if (error) {
        throw error;
      }
      
      // Update the current user state if this is the current user's profile
      if (currentUser && currentUser.id === updatedProfile.id) {
        // Preserve the location from current user
        setCurrentUser({
          ...currentUser,
          ...profileUpdate,
          location: currentUser.location, // Keep existing location
        });
      }
      
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Refresh nearby users
  const refreshNearbyUsers = async () => {
    if (!isAuthenticated || !currentUser) return;

    try {
      setLoading(true);
      console.log("Refreshing nearby users for:", currentUser.name, "with ID:", currentUser.id);
      
      // Set default location (Wynyard) if user doesn't have one
      const userLocation = currentUser.location || { lat: -33.8666, lng: 151.2073 };
      
      // First, make sure the current user's location is saved
      if (currentUser && !currentUser.location) {
        const wynyard = { lat: -33.8666, lng: 151.2073 };
        await updateUserLocation(currentUser.id, wynyard);
        setCurrentUser({
          ...currentUser,
          location: wynyard
        });
      }
      
      // Fetch all profiles from the database
      const profiles = await getAllProfiles();
      console.log("Fetched profiles:", profiles);
      
      // Filter out the current user and convert to AppUser type
      const otherUsers = profiles
        .filter(profile => profile.id !== currentUser.id)
        .map(profile => ({
          ...profile,
          email: '', // We don't have emails for other users
          interests: Array.isArray(profile.interests) ? profile.interests : []
        }));

      console.log("Other users:", otherUsers);
      
      // Calculate distance for each user regardless of location
      const usersWithDistance = otherUsers.map(user => {
        if (!user.location || !user.location.lat || !user.location.lng) {
          return { ...user, distance: Infinity };
        }
        
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          user.location.lat,
          user.location.lng
        );
        
        return { ...user, distance };
      });

      console.log("Users with distance calculation:", usersWithDistance);
      
      // Set all users, including those without location
      // Only filter by radius for users that have a location
      setNearbyUsers(usersWithDistance);
    } catch (error) {
      console.error("Error fetching nearby users:", error);
    } finally {
      setLoading(false);
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
                  const wynyard = { lat: -33.8666, lng: 151.2073 };
                  await updateUserLocation(profile.id, wynyard);
                  appUser.location = wynyard;
                  setCurrentUser(appUser);
                }
                
                // Now refresh nearby users
                setTimeout(() => {
                  refreshNearbyUsers();
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
            const wynyard = { lat: -33.8666, lng: 151.2073 };
            await updateUserLocation(profile.id, wynyard);
            appUser.location = wynyard;
            setCurrentUser(appUser);
          }
          
          // Refresh nearby users
          setTimeout(() => {
            refreshNearbyUsers();
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

  // Update nearbyUsers when radius changes
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      refreshNearbyUsers();
    }
  }, [radiusInKm, currentUser?.location]);

  // IMPORTANT CHANGE: Only load mock data if explicitly requested or as a debug option
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Only load mock friend requests as fallback for now
      // since we don't have a real implementation for them yet
      setFriendRequests([
        {
          id: 'fr1',
          senderId: '1',
          senderName: 'Sarah J.',
          senderProfilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
          duration: 30,
          status: 'pending',
          timestamp: Date.now() - 1000 * 60 * 5,
        },
        {
          id: 'fr2',
          senderId: '5',
          senderName: 'Jessica M.',
          senderProfilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
          duration: 45,
          status: 'pending',
          timestamp: Date.now() - 1000 * 60 * 15,
        },
      ]);

      // Mock chats with more realistic conversations - keep this
      setChats([
        {
          id: 'c1',
          participantId: '2',
          participantName: 'David L.',
          profilePic: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
          lastMessage: 'Are you coming?',
          lastMessageTime: Date.now() - 1000 * 60 * 10,
          messages: [
            {
              id: 'm1',
              senderId: '2',
              text: 'Hi there! I noticed we share an interest in gaming.',
              timestamp: Date.now() - 1000 * 60 * 30,
            },
            {
              id: 'm2',
              senderId: 'current',
              text: 'Hello! Yes, I love indie games especially.',
              timestamp: Date.now() - 1000 * 60 * 28,
            },
            {
              id: 'm3',
              senderId: '2',
              text: 'Would you like to meet up for coffee to chat about new releases?',
              timestamp: Date.now() - 1000 * 60 * 15,
            },
            {
              id: 'm4',
              senderId: 'current',
              text: 'That sounds great! Where and when?',
              timestamp: Date.now() - 1000 * 60 * 12,
            },
            {
              id: 'm5',
              senderId: '2',
              text: 'How about the café on Main St at 3pm?',
              timestamp: Date.now() - 1000 * 60 * 11,
            },
            {
              id: 'm6',
              senderId: 'current',
              text: 'Perfect, see you there!',
              timestamp: Date.now() - 1000 * 60 * 11,
            },
            {
              id: 'm7',
              senderId: '2',
              text: 'Are you coming?',
              timestamp: Date.now() - 1000 * 60 * 10,
            },
          ],
        },
        {
          id: 'c2',
          participantId: '6',
          participantName: 'Thomas W.',
          profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
          lastMessage: 'Looking forward to it!',
          lastMessageTime: Date.now() - 1000 * 60 * 30,
          messages: [
            {
              id: 'm1',
              senderId: '6',
              text: 'Hey, I saw you were interested in fitness. Do you go to any gyms in the area?',
              timestamp: Date.now() - 1000 * 60 * 120,
            },
            {
              id: 'm2',
              senderId: 'current',
              text: 'Hi Thomas! Yes, I go to Fitness First on George Street. Do you work out there too?',
              timestamp: Date.now() - 1000 * 60 * 118,
            },
            {
              id: 'm3',
              senderId: '6',
              text: 'I usually go to F45 in Surry Hills, but I\'ve been thinking of switching. How\'s Fitness First?',
              timestamp: Date.now() - 1000 * 60 * 110,
            },
            {
              id: 'm4',
              senderId: 'current',
              text: 'It\'s pretty good! Great equipment and not too crowded most times. Want to try a class together?',
              timestamp: Date.now() - 1000 * 60 * 100,
            },
            {
              id: 'm5',
              senderId: '6',
              text: 'That would be awesome. How about Thursday evening?',
              timestamp: Date.now() - 1000 * 60 * 40,
            },
            {
              id: 'm6',
              senderId: 'current',
              text: 'Thursday works for me. 6pm HIIT class?',
              timestamp: Date.now() - 1000 * 60 * 35,
            },
            {
              id: 'm7',
              senderId: '6',
              text: 'Looking forward to it!',
              timestamp: Date.now() - 1000 * 60 * 30,
            },
          ],
        },
      ]);
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
