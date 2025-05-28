import { Dispatch, SetStateAction } from 'react';

export interface Location {
  lat: number;
  lng: number;
}

export interface Priority {
  id: string;
  category: string;
  activity: string;
  frequency?: string;
  timePreference?: string;
  urgency?: string;
  location?: string;
  experienceLevel?: string;
}

export interface Business {
  id: string;
  auth_user_id: string;
  business_name: string;
  business_type: 'cafe' | 'bar' | 'restaurant' | 'lunch_spot' | 'other';
  description?: string;
  location?: { lat: number; lng: number };
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours_of_operation?: any;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
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
  isOnline: boolean;
  blockedUsers?: string[];
  blocked_users?: string[];
  active_priorities?: Priority[];
  is_over_18?: boolean;
  // New fields for business support
  isBusiness?: boolean;
  businessType?: 'cafe' | 'bar' | 'restaurant' | 'lunch_spot' | 'other';
  // Location settings
  locationSettings?: {
    isManualMode?: boolean;
    hideExactLocation?: boolean;
  };
  location_settings?: {
    is_manual_mode?: boolean;
    hide_exact_location?: boolean;
  };
  // Add distance property for filtering
  distance?: number;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  senderName?: string;
  receiverName?: string;
  senderProfilePic?: string;
  receiverProfilePic?: string;
  duration?: number;
  timestamp?: number;
}

export interface MeetupRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  location?: Location;
  meetLocation?: string; // Changed from Location to string for display
  duration?: number;
  senderName?: string;
  receiverName?: string;
  senderProfilePic?: string;
  receiverProfilePic?: string;
  timestamp?: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
  content?: string;
  chatId?: string;
  status?: 'sending' | 'sent' | 'received';
}

export interface Chat {
  id: string;
  name: string;
  participants: string[];
  participantId: string;
  participantName: string;
  profilePic: string;
  lastMessage: string;
  lastMessageTime: number;
  messages: Message[];
  unreadCount?: number;
  isOnline?: boolean;
}

export interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  supabaseUser: any;
  setSupabaseUser: Dispatch<SetStateAction<any>>;
  currentUser: AppUser | null;
  setCurrentUser: Dispatch<SetStateAction<AppUser | null>>;
  loading: boolean;
  updateUserLocation: (location: Location, options?: { hideExactLocation?: boolean }) => Promise<void>;
  updateUserProfile: (profileData: Partial<AppUser>) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  reportUser: (userId: string, reason: string) => Promise<void>;
  nearbyUsers: AppUser[];
  setNearbyUsers: Dispatch<SetStateAction<AppUser[]>>;
  radiusInKm: number;
  setRadiusInKm: Dispatch<SetStateAction<number>>;
  friendRequests: FriendRequest[];
  setFriendRequests: Dispatch<SetStateAction<FriendRequest[]>>;
  meetupRequests: MeetupRequest[];
  setMeetupRequests: Dispatch<SetStateAction<MeetupRequest[]>>;
  refreshFriendRequests: () => void;
  refreshMeetupRequests: () => void;
  chats: Chat[];
  setChats: Dispatch<SetStateAction<Chat[]>>;
  selectedChat: Chat | null;
  setSelectedChat: Dispatch<SetStateAction<Chat | null>>;
  unreadMessageCount: number;
  setUnreadMessageCount: Dispatch<SetStateAction<number>>;
  refreshNearbyUsers: (showToast: boolean) => Promise<void>;
}
