import { User } from '@supabase/supabase-js';
import { Profile } from '@/lib/supabase';

// Define types for our user and app state
export type AppUser = Profile & {
  email: string;
  distance?: number; // Add distance property as optional
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

export type AppContextType = {
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
  updateUserLocation: (userId: string, location: { lat: number, lng: number }) => Promise<any>;
  updateUserProfile: (updatedProfile: Partial<Profile>) => Promise<void>;
};
