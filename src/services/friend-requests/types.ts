
import { FriendRequest } from '@/context/types';

// Request creation input data
export interface SendFriendRequestInput {
  senderId: string;
  senderName: string;
  senderProfilePic: string | null;
  receiverId: string;
  receiverName: string;
  receiverProfilePic: string | null;
  duration: number;
}

// Message content structure for friend requests
export interface FriendRequestMessageContent {
  type: 'friend_request';
  duration: number;
  sender_name: string;
  sender_profile_pic: string | null;
  receiver_name: string;
  receiver_profile_pic: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}
