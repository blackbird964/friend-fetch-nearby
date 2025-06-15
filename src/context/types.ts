import { Profile } from '@/lib/supabase';

export interface Location {
  lat: number;
  lng: number;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderProfilePic?: string | null;
  receiverId: string;
  receiverName: string;
  receiverProfilePic?: string | null;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
  duration: number;
  sender_name?: string; // For backwards compatibility
}

export interface MeetupRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderProfilePic?: string | null;
  receiverId: string;
  receiverName: string;
  receiverProfilePic?: string | null;
  duration: number;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
  type: 'meetup';
  meetLocation?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string; // Make required to match ChatMessage
  text?: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  chatId?: string; // Add optional chatId
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  name?: string;
  participants: string[];
  participantId?: string;
  participantName?: string;
  profilePic?: string;
  messages: ChatMessage[];
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount?: number;
  isOnline?: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export interface LocationSettings {
  isManualMode: boolean;
  hideExactLocation: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  bio?: string;
  age?: number | null;
  gender?: string;
  interests?: string[];
  profile_pic?: string | null;
  email: string;
  location?: Location | null;
  distance?: number;
  last_seen?: string | null;
  is_online?: boolean | null;
  isOnline?: boolean | null; // For backwards compatibility
  is_over_18?: boolean | null;
  active_priorities?: ActivePriority[];
  preferredHangoutDuration?: number | null;
  todayActivities?: string[];
  locationSettings?: LocationSettings;
  location_settings?: {
    is_manual_mode?: boolean;
    hide_exact_location?: boolean;
  };
  email_notifications_enabled?: boolean;
  blockedUsers?: string[];
  blocked_users?: string[]; // For backwards compatibility
  chat?: Chat; // For compatibility with friends list
  friendRequest?: FriendRequest; // Add this property
}

export interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  currentUser: AppUser | null;
  setCurrentUser: (user: AppUser | null) => void;
  supabaseUser: any;
  setSupabaseUser: (user: any) => void;
  loading: boolean;
  updateUserLocation: (userId: string, location: Location, options?: { hideExactLocation?: boolean }) => Promise<void>;
  updateUserProfile: (profileData: Partial<AppUser>) => Promise<void>;
  friendRequests: FriendRequest[];
  setFriendRequests: (friendRequests: FriendRequest[]) => void;
  refreshFriendRequests: () => Promise<void>;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  addMessageToChat: (chatId: string, message: ChatMessage) => void;
  removeChat: (chatId: string) => void;
  blockedUsers: string[];
  setBlockedUsers: (blockedUsers: string[]) => void;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
	reportUser: (reportedUserId: string, reason: string) => Promise<void>;
}
