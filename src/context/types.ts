import { Profile } from '@/lib/supabase';

export interface Location {
  lat: number;
  lng: number;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: ChatMessage[];
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
