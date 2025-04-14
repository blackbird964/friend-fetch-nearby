
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { getProfile, Profile } from '@/lib/supabase';

// Define types for our user and app state
export type AppUser = Profile & {
  email: string;
  location?: {
    lat: number;
    lng: number;
  };
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
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<AppUser[]>([]);
  const [radiusInKm, setRadiusInKm] = useState(5);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        const user = session?.user || null;
        setSupabaseUser(user);
        setIsAuthenticated(!!user);
        
        if (user) {
          // Use setTimeout to prevent deadlocks
          setTimeout(async () => {
            try {
              const profile = await getProfile(user.id);
              if (profile) {
                setCurrentUser({
                  ...profile,
                  email: user.email || '',
                });
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null;
      setSupabaseUser(user);
      setIsAuthenticated(!!user);
      
      if (user) {
        getProfile(user.id).then((profile) => {
          if (profile) {
            setCurrentUser({
              ...profile,
              email: user.email || '',
            });
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Demo data for the MVP
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Mock nearby users
      setNearbyUsers([
        {
          id: '1',
          name: 'Sarah J.',
          email: 'sarah@example.com',
          profile_pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
          age: 28,
          gender: 'Female',
          interests: ['Hiking', 'Photography', 'Coffee'],
          bio: 'Adventure seeker and coffee enthusiast.',
          location: { lat: 40.730610, lng: -73.935242 },
        },
        {
          id: '2',
          name: 'David L.',
          email: 'david@example.com',
          profile_pic: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
          age: 32,
          gender: 'Male',
          interests: ['Gaming', 'Tech', 'Movies'],
          bio: 'Tech geek with a passion for sci-fi films.',
          location: { lat: 40.728610, lng: -73.937242 },
        },
        {
          id: '3',
          name: 'Emma R.',
          email: 'emma@example.com',
          profile_pic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
          age: 25,
          gender: 'Female',
          interests: ['Yoga', 'Reading', 'Travel'],
          bio: 'Yoga instructor and avid reader.',
          location: { lat: 40.732610, lng: -73.934242 },
        },
        {
          id: '4',
          name: 'Michael K.',
          email: 'michael@example.com',
          profile_pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
          age: 30,
          gender: 'Male',
          interests: ['Music', 'Cooking', 'Sports'],
          bio: 'Music producer and amateur chef.',
          location: { lat: 40.729610, lng: -73.932242 },
        },
      ]);

      // Mock friend requests
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
      ]);

      // Mock chats
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
