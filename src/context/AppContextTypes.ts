import { AppUser, Chat, FriendRequest, MeetupRequest, Location } from './types';
import { User } from '@supabase/supabase-js';

export interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  currentUser: AppUser | null;
  setCurrentUser: (user: AppUser | null) => void;
  supabaseUser: User | null;
  setSupabaseUser: (user: User | null) => void;
  loading: boolean;
  updateUserLocation: (userId: string, location: Location) => Promise<void>;
  updateUserProfile: (userId: string, profileData: Partial<AppUser>) => Promise<void>;
  blockUser: (userId: string) => Promise<boolean>;
  unblockUser: (userId: string) => Promise<boolean>;
  reportUser: (userId: string, reason: string) => Promise<boolean>;
  userActionsLoading?: boolean;
}

export interface UsersContextType {
  nearbyUsers: AppUser[];
  setNearbyUsers: (users: AppUser[]) => void;
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
  refreshNearbyUsers: (showToast?: boolean) => Promise<void>;
}

export interface SocialContextType {
  friendRequests: FriendRequest[];
  setFriendRequests: (requests: FriendRequest[]) => void;
  meetupRequests: MeetupRequest[];
  setMeetupRequests: (requests: MeetupRequest[]) => void;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  refreshFriendRequests: () => Promise<void>;
  refreshMeetupRequests: () => Promise<void>;
  unreadMessageCount: number;
  setUnreadMessageCount: (count: number) => void;
}

// Combined context type
export interface AppContextType extends AuthContextType, UsersContextType, SocialContextType {}
