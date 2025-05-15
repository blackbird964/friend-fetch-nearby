
import { FriendRequest } from '@/context/types';

// We shouldn't extend FriendRequest if the type is incompatible
// Instead, let's use the common parent type from context/types.ts
export interface MeetupRequest {
  type: 'meetup';
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  senderName?: string;
  senderProfilePic?: string;
  receiverName?: string;
  receiverProfilePic?: string;
  timestamp?: number;
  duration: number;
  meetLocation?: string;
}

export interface MeetupRequestMessageContent {
  type: 'meetup_request';
  duration: number;
  sender_name: string;
  sender_profile_pic: string | null;
  receiver_name: string;
  receiver_profile_pic: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
  meet_location?: string;
}
