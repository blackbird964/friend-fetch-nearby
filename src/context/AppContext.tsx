
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
                setCurrentUser({
                  ...profile,
                  email: session.user.email || '',
                });
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
          setCurrentUser({
            ...profile,
            email: data.session.user.email || '',
          });
        }
      }
      
      setLoading(false);
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Demo data for the MVP
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Mock nearby users - expanded with more realistic data and Sydney locations
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
          location: { lat: -33.8688, lng: 151.2093 }, // Town Hall
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
          location: { lat: -33.8568, lng: 151.2153 }, // The Rocks
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
          location: { lat: -33.8736, lng: 151.2014 }, // Darling Harbour
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
          location: { lat: -33.9509, lng: 151.1825 }, // Bankstown
        },
        {
          id: '5',
          name: 'Jessica M.',
          email: 'jessica@example.com',
          profile_pic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
          age: 27,
          gender: 'Female',
          interests: ['Fashion', 'Design', 'Art'],
          bio: 'Fashion designer who loves modern art.',
          location: { lat: -33.7480, lng: 151.2414 }, // Chatswood
        },
        {
          id: '6',
          name: 'Thomas W.',
          email: 'thomas@example.com',
          profile_pic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
          age: 34,
          gender: 'Male',
          interests: ['Surfing', 'Beach', 'Fitness'],
          bio: 'Surf instructor and fitness enthusiast.',
          location: { lat: -33.8914, lng: 151.2766 }, // Bondi
        },
        {
          id: '7',
          name: 'Lisa T.',
          email: 'lisa@example.com',
          profile_pic: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
          age: 29,
          gender: 'Female',
          interests: ['Cooking', 'Languages', 'Travel'],
          bio: 'Polyglot who loves cooking international dishes.',
          location: { lat: -33.7281, lng: 150.9686 }, // Blacktown
        },
        {
          id: '8',
          name: 'Daniel H.',
          email: 'daniel@example.com',
          profile_pic: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
          age: 31,
          gender: 'Male',
          interests: ['Business', 'Networking', 'Books'],
          bio: 'Entrepreneur who loves reading business books.',
          location: { lat: -33.9657, lng: 150.8444 }, // Liverpool
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

      // Mock chats with more realistic conversations
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
