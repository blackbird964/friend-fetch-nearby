
import { User } from '@supabase/supabase-js';

export interface Location {
  lat: number;
  lng: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  location?: Location;
  interests: string[];
  profile_pic?: string;
  bio?: string;
  age?: number;
  gender?: string;
  distance?: number;
}

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  participants: string[]; // User IDs
  messages: Message[];
  participantId?: string;
  participantName?: string;
  profilePic?: string;
  lastMessage?: string;
  lastMessageTime?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
  text?: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  senderName?: string;
  senderProfilePic?: string;
  receiverName?: string;
  receiverProfilePic?: string;
  duration?: number;
  timestamp?: number;
}

export interface AppContextType {
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
  refreshNearbyUsers: (showToast?: boolean) => Promise<void>;
  updateUserLocation: (userId: string, location: Location) => Promise<void>;
  updateUserProfile: (userId: string, profileData: Partial<AppUser>) => Promise<void>;
}

export type MessageStatus = 'sent' | 'received' | 'read';
