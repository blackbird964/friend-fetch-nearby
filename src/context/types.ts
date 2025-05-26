
import { User } from '@supabase/supabase-js';
import { ActivePriority } from '@/lib/supabase/profiles/types';

export interface Location {
  lat: number;
  lng: number;
}

export interface AppUser {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
  location?: Location;
  interests?: string[];
  profile_pic?: string;
  bio?: string;
  age?: number;
  gender?: string;
  blockedUsers?: string[];
  blocked_users?: string[];
  locationSettings?: {
    isManualMode: boolean;
    hideExactLocation: boolean;
  };
  location_settings?: {
    is_manual_mode?: boolean;
    hide_exact_location?: boolean;
  };
  distance?: number;
  chat?: Chat; // Chat property for navigation purposes
  isOnline?: boolean; // Adding isOnline property
  is_over_18?: boolean; // Added is_over_18 property
  active_priorities?: ActivePriority[]; // Added active_priorities property
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
  isOnline?: boolean; // Added this property
  unreadCount?: number; // Added this property for tracking unread messages
}

export interface Message {
  id: string;
  chatId?: string;  // Made optional since not all context requires it
  senderId: string;
  content?: string;  // Made optional since we're using text in some places
  text?: string;     // Added to support existing usage
  timestamp: string | number;  // Support both string and number timestamps
  status?: MessageStatus;  // Made optional for compatibility
}

export interface BaseRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  senderName?: string;
  senderProfilePic?: string;
  receiverName?: string;
  receiverProfilePic?: string;
  timestamp?: number;
}

export interface FriendRequest extends BaseRequest {
  duration?: number;
  type?: 'friend';
}

export interface MeetupRequest extends BaseRequest {
  duration: number;
  type: 'meetup';
  meetLocation?: string;
}

export type RequestType = FriendRequest | MeetupRequest;

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
  meetupRequests: MeetupRequest[];
  setMeetupRequests: (requests: MeetupRequest[]) => void;
  chats: Chat[];
  setChats: (chats: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null | ((prev: Chat | null) => Chat | null)) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  supabaseUser: User | null;
  setSupabaseUser: (user: User | null) => void;
  loading: boolean;
  refreshNearbyUsers: (showToast?: boolean) => Promise<void>;
  updateUserLocation: (userId: string, location: Location) => Promise<void>;
  updateUserProfile: (userId: string, profileData: Partial<AppUser>) => Promise<void>;
  refreshFriendRequests: () => Promise<void>;
  refreshMeetupRequests: () => Promise<void>;
  blockUser: (userId: string) => Promise<boolean>;
  unblockUser: (userId: string) => Promise<boolean>;
  reportUser: (userId: string, reason: string) => Promise<boolean>;
  unreadMessageCount: number;
  setUnreadMessageCount: (count: number) => void;
}

export type MessageStatus = 'sent' | 'received' | 'read' | 'sending';
