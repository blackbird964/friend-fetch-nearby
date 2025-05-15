
// Define types for chat functionality
export interface Conversation {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  other_user_id: string;
}

export interface ChatCacheItem {
  profile: any;
  lastMessage: any;
  timestamp: number;
}

export interface FetchChatsOptions {
  forceRefresh?: boolean;
}

export type ChatParticipant = [string, any[]];

