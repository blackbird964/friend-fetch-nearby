
import { ReactNode } from 'react';
import { Profile } from '@/lib/supabase';

export interface Location {
  lat: number;
  lng: number;
}

export interface ActivePriority {
  id: string;
  category: string;
  activity: string;
  frequency?: string;
  timePreference?: string;
  urgency?: string;
  location?: string;
  experienceLevel?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  location?: Location;
  interests: string[];
  distance?: number;
  isOnline?: boolean;
  profile_pic?: string;
  bio?: string;
  age?: number;
  gender?: string;
  blockedUsers?: string[];
  locationSettings?: {
    isManualMode: boolean;
    hideExactLocation: boolean;
  };
  location_settings?: {
    is_manual_mode?: boolean;
    hide_exact_location?: boolean;
  };
  active_priorities?: ActivePriority[];
  todayActivities?: string[]; // New field for today's selected activities
  preferredHangoutDuration?: string; // New field for hangout duration preference
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  duration: string;
  sender_name: string;
  senderName?: string;
  receiverName?: string;
  senderProfilePic?: string;
  receiverProfilePic?: string;
  timestamp?: number;
}

export interface MeetupRequest {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  senderProfilePic?: string;
  receiverProfilePic?: string;
  duration: string;
  meetLocation?: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read' | 'sending' | 'received';
  text?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  participantId?: string;
  participantName?: string;
  profilePic?: string;
  name?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount?: number;
  isOnline?: boolean;
}

export interface AuthContextType {
  currentUser: AppUser | null;
  setCurrentUser: (user: AppUser) => void;
  loading: boolean;
  error: string | null;
  signUp: (data: any) => Promise<void>;
  signIn: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
}

export interface UsersContextType {
  nearbyUsers: AppUser[];
  setNearbyUsers: (users: AppUser[]) => void;
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
  refreshNearbyUsers: (showToast?: boolean) => Promise<void>;
}

export interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  friendRequests: FriendRequest[];
  loading: boolean;
  error: string | null;
  startChat: (user: AppUser) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  acceptFriendRequest: (friendRequestId: string, duration: string) => Promise<void>;
  rejectFriendRequest: (friendRequestId: string) => Promise<void>;
  sendFriendRequest: (receiverId: string, duration: string) => Promise<void>;
  cancelFriendRequest: (friendRequestId: string) => Promise<void>;
  loadChat: (chatId: string) => Promise<void>;
  removeChat: (chatId: string) => Promise<void>;
}

export interface AppContextType extends AuthContextType, UsersContextType, ChatContextType {
  children?: ReactNode;
}
