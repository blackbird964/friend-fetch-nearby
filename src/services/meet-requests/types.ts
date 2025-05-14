
import { FriendRequest } from '@/context/types';

export interface MeetupRequest extends FriendRequest {
  type: 'meetup';
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
